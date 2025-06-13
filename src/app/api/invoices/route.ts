import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CURRENT_CUSTOMER_NAMES, CURRENT_CUSTOMER_ETAID } from '@/lib/constants';
import { normalizeNames } from '@/lib/services/nameNormalizationService';
import type { NameToNormalize } from '@/lib/services/nameNormalizationService';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client directly in this file to ensure we use the correct client
// with all the models properly generated

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

    // Step 1: Extract all unique names that need normalization
    const namesToNormalize: NameToNormalize[] = [];
    const nameMapping = new Map<string, string>(); // original name -> unique ID

    for (const rawInvoice of invoicesToProcess) {
      const issuerName = rawInvoice.issuerName;
      const receiverName = rawInvoice.receiverName;

      // Create unique IDs for issuer and receiver names
      if (issuerName && !nameMapping.has(issuerName)) {
        const id = uuidv4();
        nameMapping.set(issuerName, id);
        namesToNormalize.push({
          id,
          name: issuerName,
          type: 'issuer'
        });
      }

      if (receiverName && !nameMapping.has(receiverName)) {
        const id = uuidv4();
        nameMapping.set(receiverName, id);
        namesToNormalize.push({
          id,
          name: receiverName,
          type: 'receiver'
        });
      }
    }

    console.log(`📝 Extracted ${namesToNormalize.length} unique names for normalization`);

    // Step 2: Send names to LLM for normalization
    let normalizedNamesMap = new Map<string, string>(); // original name -> normalized name
    
    if (namesToNormalize.length > 0) {
      try {
        console.log(`🤖 Sending ${namesToNormalize.length} names to LLM for normalization...`);
        const normalizationResult = await normalizeNames(namesToNormalize);
        
        // Create mapping from original names to normalized names
        for (const result of normalizationResult.normalizedNames) {
          const originalName = namesToNormalize.find(n => n.id === result.id)?.name;
          if (originalName) {
            normalizedNamesMap.set(originalName, result.normalizedName);
            console.log(`✨ Normalized: "${originalName}" → "${result.normalizedName}" (confidence: ${result.confidence})`);
          }
        }

        // Log any normalization errors
        if (normalizationResult.errors.length > 0) {
          console.warn(`⚠️ Name normalization errors:`, normalizationResult.errors);
        }

        console.log(`✅ Successfully normalized ${normalizedNamesMap.size} names`);
      } catch (error) {
        console.warn(`⚠️ Name normalization failed, using original names:`, error);
        // Fallback: use original names if normalization fails
        for (const nameItem of namesToNormalize) {
          normalizedNamesMap.set(nameItem.name, nameItem.name);
        }
      }
    }

    // Step 3: Process invoices with normalized names
    for (const rawInvoice of invoicesToProcess) {
      const internalId = rawInvoice.internalId || 'N/A'; // Use a default if internalId is missing
      try {
        const document = typeof rawInvoice.document === 'string' ? JSON.parse(rawInvoice.document) : rawInvoice.document;

        const taxAmount = Array.isArray(document.taxTotals)
          ? document.taxTotals.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
          : 0;

        // Improved currency extraction with better debugging
        const firstLine = Array.isArray(document.invoiceLines) && document.invoiceLines.length > 0
          ? document.invoiceLines[0]
          : null;
        
        // Enhanced currency extraction with fallback logic
        let currency = 'EGP'; // Default fallback
        let exchangeRate = 1; // Default fallback
        
        if (firstLine?.unitValue) {
          // Primary: Extract from currencySold
          if (firstLine.unitValue.currencySold) {
            currency = firstLine.unitValue.currencySold;
          }
          // Extract exchange rate
          if (firstLine.unitValue.currencyExchangeRate) {
            exchangeRate = firstLine.unitValue.currencyExchangeRate;
          }
        }
        
        // Debug logging for currency extraction
        console.log(`💱 Currency extraction for invoice ${internalId}:`, {
          hasInvoiceLines: Array.isArray(document.invoiceLines),
          invoiceLinesLength: document.invoiceLines?.length || 0,
          hasFirstLine: !!firstLine,
          hasUnitValue: !!firstLine?.unitValue,
          currencySold: firstLine?.unitValue?.currencySold,
          extractedCurrency: currency,
          exchangeRate: exchangeRate,
          fullUnitValue: firstLine?.unitValue
        });

        const issuerCountry = document.issuer?.address?.country || '';
        const receiverCountry = document.receiver?.address?.country || '';
        const issuerEtaId = document.issuer?.id || '';
        const receiverEtaId = document.receiver?.id || '';

        const totalDiscount = rawInvoice.totalDiscount ?? document.totalDiscountAmount ?? 0;
        const total = rawInvoice.total ?? document.totalAmount ?? 0;

        // Use normalized names if available, otherwise fall back to original names
        const normalizedIssuerName = normalizedNamesMap.get(rawInvoice.issuerName) || rawInvoice.issuerName;
        const normalizedReceiverName = normalizedNamesMap.get(rawInvoice.receiverName) || rawInvoice.receiverName;

        const invoiceData = {
          invoiceDate: new Date(rawInvoice.dateTimeIssued),
          invoiceNumber: rawInvoice.internalId,
          issuerName: normalizedIssuerName,
          receiverName: normalizedReceiverName,
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
          receiverName: normalizedReceiverName,
          issuerName: normalizedIssuerName,
          originalReceiverName: rawInvoice.receiverName,
          originalIssuerName: rawInvoice.issuerName,
          issuerEtaId: invoiceData.issuerEtaId, // Use sanitized Id
          receiverEtaId: invoiceData.receiverEtaId, // Use sanitized Id
          isCustomerByEtaId: invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID,
          isSupplierByEtaId: invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID,
          isCustomerByName: CURRENT_CUSTOMER_NAMES.includes(normalizedIssuerName),
          isSupplierByName: CURRENT_CUSTOMER_NAMES.includes(normalizedReceiverName),
        });

        let customerId: number | null = null;
        let supplierId: number | null = null;

        // First check by ETA ID (if valid and not "0"), then fall back to name matching
        if ((invoiceData.issuerEtaId && invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedIssuerName)) {
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
              where: { name: normalizedReceiverName } 
            });
          }
          
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: normalizedReceiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null, // Store sanitized etaId or null
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          customerId = customer.id;
        } else if ((invoiceData.receiverEtaId && invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedReceiverName)) {
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
              where: { name: normalizedIssuerName } 
            });
          }
          
          if (!supplier) {
            supplier = await prisma.supplier.create({
              data: {
                name: normalizedIssuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null, // Store sanitized etaId or null
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
        console.log(`✅ Invoice ${newInvoice.invoiceNumber} saved successfully with normalized names.`);

      } catch (error: any) {
        console.error(`❌ Error processing invoice ${internalId}:`, error.message);
        errors.push({ invoiceNumber: internalId, error: error.message });
        errorCount++;
      }
    }

    console.log('🏁 Bulk processing finished.');
    return NextResponse.json({
      message: 'Bulk invoice processing complete with LLM name normalization.',
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors,
      createdInvoices: createdInvoices.map(inv => inv.id), // Return IDs of created invoices
      normalizationStats: {
        totalUniqueNames: namesToNormalize.length,
        normalizedNames: normalizedNamesMap.size
      }
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