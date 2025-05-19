import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

// Initialize Prisma client directly in this file to ensure we use the correct client
// with all the models properly generated
const prisma = new PrismaClient();
const CURRENT_CUSTOMER_NAME = 'شركهكانلصناعهوتعبئهالعلب';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Starting invoice processing...');
    
    const json = await request.json();
    console.log('📄 Received JSON payload:', {
      internalId: json.internalId,
      dateTimeIssued: json.dateTimeIssued,
      issuerName: json.issuerName,
      receiverName: json.receiverName,
    });
    
    // Parse the embedded document JSON
    const document = typeof json.document === 'string' ? JSON.parse(json.document) : json.document;
    console.log('📋 Parsed document structure:', {
      hasInvoiceLines: Array.isArray(document.invoiceLines),
      hasTaxTotals: Array.isArray(document.taxTotals),
      issuerInfo: document.issuer?.address,
      receiverInfo: document.receiver?.address,
    });

    // Extract taxAmount: sum of all taxTotals[].amount
    const taxAmount = Array.isArray(document.taxTotals)
      ? document.taxTotals.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
      : 0;

    // Extract currency and exchangeRate from first invoice line
    const firstLine = Array.isArray(document.invoiceLines) && document.invoiceLines.length > 0
      ? document.invoiceLines[0]
      : null;
    const currency = firstLine?.unitValue?.currencySold || 'EGP';
    const exchangeRate = firstLine?.unitValue?.exchangeRate || 1;

    console.log('💰 Extracted financial details:', {
      taxAmount,
      currency,
      exchangeRate,
      firstLineInfo: firstLine ? {
        hasUnitValue: !!firstLine.unitValue,
        currencySold: firstLine.unitValue?.currencySold,
        exchangeRate: firstLine.unitValue?.exchangeRate,
      } : null
    });

    // Extract issuer/receiver country
    const issuerCountry = document.issuer?.address?.country || '';
    const receiverCountry = document.receiver?.address?.country || '';

    // Extract totalDiscount and total
    const totalDiscount = json.totalDiscount ?? document.totalDiscountAmount ?? 0;
    const total = json.total ?? document.totalAmount ?? 0;

    const invoiceData = {
      invoiceDate: new Date(json.dateTimeIssued),
      invoiceNumber: json.internalId,
      issuerName: json.issuerName,
      receiverName: json.receiverName,
      totalSales: json.totalSales,
      totalDiscount,
      netAmount: json.netAmount,
      total,
      invoiceStatus: json.status,
      currency,
      exchangeRate,
      taxAmount,
      issuerCountry,
      receiverCountry,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📝 Prepared invoice data:', invoiceData);
    console.log('🔍 Checking invoice type...', {
      receiverName: json.receiverName,
      issuerName: json.issuerName,
      currentCustomer: CURRENT_CUSTOMER_NAME,
      isCustomerInvoice: json.issuerName === CURRENT_CUSTOMER_NAME,
      isSupplierInvoice: json.receiverName === CURRENT_CUSTOMER_NAME,
    });

    // Determine if this is a customer or supplier invoice
    let customerId: number | null = null;
    let supplierId: number | null = null;

    if (json.issuerName === CURRENT_CUSTOMER_NAME) {
      // Our client is the issuer, so this is a customer invoice
      console.log('👥 Processing as customer invoice...');
      let customer = await prisma.customer.findFirst({ where: { name: json.receiverName } });
      console.log('🔍 Customer lookup result:', { found: !!customer, name: json.receiverName });
      
      if (!customer) {
        console.log('➕ Creating new customer record...');
        customer = await prisma.customer.create({
          data: {
            name: json.receiverName,
            country: receiverCountry,
            paymentTerms: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('✅ New customer created:', { id: customer.id, name: customer.name });
      }
      customerId = customer.id;
    } else if (json.receiverName === CURRENT_CUSTOMER_NAME) {
      // Our client is the receiver, so this is a supplier invoice
      console.log('🏢 Processing as supplier invoice...');
      let supplier = await prisma.supplier.findFirst({ where: { name: json.issuerName } });
      console.log('🔍 Supplier lookup result:', { found: !!supplier, name: json.issuerName });
      
      if (!supplier) {
        console.log('➕ Creating new supplier record...');
        supplier = await prisma.supplier.create({
          data: {
            name: json.issuerName,
            country: issuerCountry,
            paymentTerms: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('✅ New supplier created:', { id: supplier.id, name: supplier.name });
      }
      supplierId = supplier.id;
    } else {
      console.error('❌ Invoice validation failed:', {
        reason: 'No match for current customer',
        issuerName: json.issuerName,
        receiverName: json.receiverName,
        currentCustomer: CURRENT_CUSTOMER_NAME,
      });
      throw new Error('Invoice does not match current customer as issuer or receiver.');
    }

    // Save the invoice with the correct field names
    console.log('💾 Saving invoice to database...', {
      customerId,
      supplierId,
      invoiceNumber: invoiceData.invoiceNumber,
    });
    
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        customerId,
        supplierId,
      },
    });

    console.log('✅ Invoice saved successfully:', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      type: customerId ? 'customer' : 'supplier',
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error processing invoice:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 