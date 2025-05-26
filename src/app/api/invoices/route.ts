import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Initialize Prisma client directly in this file to ensure we use the correct client
// with all the models properly generated
const CURRENT_CUSTOMER_NAMES = ['شركهكانلصناعهوتعبئهالعلب', 'شركةكان', 'شركةكانلصناعةوتعبئةالعلب', 'كانلصناعةوتعبئةالعلب', "شركهكانلصناعهوتعبيئهالعلب"];
const CURRENT_CUSTOMER_ETAID = "204942527";

export async function POST(request: NextRequest) {
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: { invoiceNumber?: string; error: string }[] = [];
  const createdInvoices: any[] = [];
  let invoicesToProcess: any[] = [];

  try {
    const requestBody = await request.json();
    invoicesToProcess = Array.isArray(requestBody) ? requestBody : [requestBody];

    console.log(`🔵 Starting bulk invoice processing for ${invoicesToProcess.length} invoices...`);

    for (const rawInvoice of invoicesToProcess) {
      const internalId = rawInvoice.internalId || 'N/A'; // Use a default if internalId is missing
      try {
        const document = typeof rawInvoice.document === 'string' ? JSON.parse(rawInvoice.document) : rawInvoice.document;

        const taxAmount = Array.isArray(document.taxTotals)
          ? document.taxTotals.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
          : 0;

        const firstLine = Array.isArray(document.invoiceLines) && document.invoiceLines.length > 0
          ? document.invoiceLines[0]
          : null;
        const currency = firstLine?.unitValue?.currencySold || 'EGP';
        const exchangeRate = firstLine?.unitValue?.currencyExchangeRate || 1; // Updated field name

        const issuerCountry = document.issuer?.address?.country || '';
        const receiverCountry = document.receiver?.address?.country || '';
        const issuerEtaId = document.issuer?.id || '';
        const receiverEtaId = document.receiver?.id || '';

        const totalDiscount = rawInvoice.totalDiscount ?? document.totalDiscountAmount ?? 0;
        const total = rawInvoice.total ?? document.totalAmount ?? 0;

        const invoiceData = {
          invoiceDate: new Date(rawInvoice.dateTimeIssued),
          invoiceNumber: rawInvoice.internalId,
          issuerName: rawInvoice.issuerName,
          receiverName: rawInvoice.receiverName,
          totalSales: rawInvoice.totalSales,
          totalDiscount,
          netAmount: rawInvoice.netAmount,
          total,
          invoiceStatus: rawInvoice.status,
          currency,
          exchangeRate,
          taxAmount,
          issuerCountry,
          receiverCountry,
          issuerEtaId: (issuerEtaId && issuerEtaId !== "0") ? issuerEtaId : '',
          receiverEtaId: (receiverEtaId && receiverEtaId !== "0") ? receiverEtaId : '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check for existing invoice
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            invoiceNumber: invoiceData.invoiceNumber,
            total: invoiceData.total, // Using total amount for duplication check
          },
        });

        if (existingInvoice) {
          console.log(`⏭️ Invoice ${invoiceData.invoiceNumber} already exists. Skipping.`);
          skippedCount++;
          continue;
        }

        console.log('📝 Prepared invoice data for:', invoiceData.invoiceNumber);
        console.log('🔍 Checking invoice type for:', invoiceData.invoiceNumber, {
          receiverName: rawInvoice.receiverName,
          issuerName: rawInvoice.issuerName,
          issuerEtaId: invoiceData.issuerEtaId, // Use sanitized Id
          receiverEtaId: invoiceData.receiverEtaId, // Use sanitized Id
          isCustomerByEtaId: invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID,
          isSupplierByEtaId: invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID,
          isCustomerByName: CURRENT_CUSTOMER_NAMES.includes(rawInvoice.issuerName),
          isSupplierByName: CURRENT_CUSTOMER_NAMES.includes(rawInvoice.receiverName),
        });

        let customerId: number | null = null;
        let supplierId: number | null = null;

        // First check by ETA ID (if valid and not "0"), then fall back to name matching
        if ((invoiceData.issuerEtaId && invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(rawInvoice.issuerName)) {
          console.log(`👥 Processing as customer invoice for: ${invoiceData.invoiceNumber}`);
          
          let customer = null;
          // Find customer by ETA ID first if available and not "0", then by name
          if (invoiceData.receiverEtaId) {
            customer = await prisma.customer.findFirst({ 
              where: { etaId: invoiceData.receiverEtaId } 
            });
          }
          
          if (!customer) {
            customer = await prisma.customer.findFirst({ 
              where: { name: rawInvoice.receiverName } 
            });
          }
          
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: rawInvoice.receiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null, // Store sanitized etaId or null
                paymentTerms: null, 
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          customerId = customer.id;
        } else if ((invoiceData.receiverEtaId && invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(rawInvoice.receiverName)) {
          console.log(`🏢 Processing as supplier invoice for: ${invoiceData.invoiceNumber}`);
          
          let supplier = null;
          // Find supplier by ETA ID first if available and not "0", then by name
          if (invoiceData.issuerEtaId) {
            supplier = await prisma.supplier.findFirst({ 
              where: { etaId: invoiceData.issuerEtaId } 
            });
          }
          
          if (!supplier) {
            supplier = await prisma.supplier.findFirst({ 
              where: { name: rawInvoice.issuerName } 
            });
          }
          
          if (!supplier) {
            supplier = await prisma.supplier.create({
              data: {
                name: rawInvoice.issuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null, // Store sanitized etaId or null
                paymentTerms: null, 
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          supplierId = supplier.id;
        } else {
          throw new Error('Invoice does not match any current customer ETA ID (excluding "0") or name as issuer or receiver.');
        }

        const newInvoice = await prisma.invoice.create({
          data: { ...invoiceData, customerId, supplierId },
        });
        createdInvoices.push(newInvoice);
        processedCount++;
        console.log(`✅ Invoice ${newInvoice.invoiceNumber} saved successfully.`);

      } catch (error: any) {
        console.error(`❌ Error processing invoice ${internalId}:`, error.message);
        errors.push({ invoiceNumber: internalId, error: error.message });
        errorCount++;
      }
    }

    console.log('🏁 Bulk processing finished.');
    return NextResponse.json({
      message: 'Bulk invoice processing complete.',
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors,
      createdInvoices: createdInvoices.map(inv => inv.id) // Return IDs of created invoices
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Major error during bulk processing:', error.message);
    return NextResponse.json({
      message: 'Failed to process bulk invoices.',
      error: error.message,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount + (invoicesToProcess.length > 0 ? invoicesToProcess.length - processedCount - skippedCount - errorCount : 0),
      errorDetails: errors.length > 0 ? errors : [{ invoiceNumber: 'N/A', error: error.message }],
    }, { status: 400 });
  }
} 