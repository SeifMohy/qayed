import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import type { Supplier, Invoice } from '@prisma/client';
import type { PaymentTermsData } from '@/types/paymentTerms';

interface SupplierWithInvoicesAndMatches extends Supplier {
  Invoice: Array<Invoice & {
    TransactionMatch: Array<{
      Transaction: {
        transactionDate: Date;
        debitAmount: any; // Prisma Decimal type
      };
    }>;
  }>;
}

interface SupplierResponse {
  id: number;
  name: string;
  country: string | null;
  etaId: string | null;
  paymentTerms: string;
  paymentDays: number;
  totalPayables: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueAmount: number;
  invoiceCount: number;
  averagePaymentDelay: number;
  currency: string;
  lastPaymentDate: Date | null;
  nextPaymentDue: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Currency conversion function
async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string = 'EGP'): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, fromCurrency, toCurrency })
    });

    if (!response.ok) {
      return amount;
    }

    const data = await response.json();
    if (!data.success || typeof data.convertedAmount !== 'number' || isNaN(data.convertedAmount)) {
      return amount;
    }
    return data.convertedAmount;
  } catch (error) {
    return amount;
  }
}

// Function to get suppliers with currency conversion
async function getSuppliersWithConversion(suppliers: SupplierWithInvoicesAndMatches[], conversionCache: Map<string, number>): Promise<SupplierResponse[]> {
  return Promise.all(suppliers.map(async (supplier) => {
    // Calculate payment terms from paymentTermsData or default to 30
    const paymentDays = (() => {
      const termsData = (supplier as any).paymentTermsData as PaymentTermsData | null;
      if (termsData?.paymentPeriod) {
        if (termsData.paymentPeriod.includes('Net ')) {
          return parseInt(termsData.paymentPeriod.replace('Net ', '')) || 30;
        } else if (termsData.paymentPeriod === 'Due on receipt') {
          return 0;
        }
      }
      return 30; // Default fallback
    })();

    // Calculate total payables and paid amounts
    let totalPayables = 0;
    let totalPaid = 0;
    let totalDelayDays = 0;
    let paymentsWithDelay = 0;
    let lastPaymentDate: Date | null = null;
    let nextPaymentDue: Date | null = null;

    for (const invoice of supplier.Invoice) {
      const invoiceCurrency = invoice.currency || 'EGP';
      let conversionRate = 1;

      // Get conversion rate (cached)
      if (invoiceCurrency !== 'EGP') {
        const cacheKey = `${invoiceCurrency}_EGP`;
        if (conversionCache.has(cacheKey)) {
          conversionRate = conversionCache.get(cacheKey) ?? 1;
        } else {
          conversionRate = await convertCurrency(1, invoiceCurrency, 'EGP');
          if (typeof conversionRate !== 'number' || isNaN(conversionRate)) {
            console.warn('Conversion rate is not a valid number:', conversionRate, 'for currency', invoiceCurrency, 'for supplier', supplier.name);
            conversionRate = 1;
          }
          conversionCache.set(cacheKey, conversionRate);
        }
      }

      // Handle Prisma Decimal for invoice.total
      let invoiceTotalRaw = invoice.total;
      let invoiceTotalNum: number;
      if (invoiceTotalRaw && typeof invoiceTotalRaw === 'object' && typeof invoiceTotalRaw.toNumber === 'function') {
        invoiceTotalNum = invoiceTotalRaw.toNumber();
      } else {
        invoiceTotalNum = Number(invoiceTotalRaw ?? 0);
      }
      const totalInEGP = invoiceTotalNum * conversionRate;
      totalPayables += isNaN(totalInEGP) ? 0 : totalInEGP;

      // Calculate payments and delays
      for (const match of invoice.TransactionMatch) {
        const paidAmount = Number(match.Transaction.debitAmount ?? 0) * conversionRate;
        totalPaid += isNaN(paidAmount) ? 0 : paidAmount;

        const paymentDate = new Date(match.Transaction.transactionDate);
        if (!lastPaymentDate || paymentDate > lastPaymentDate) {
          lastPaymentDate = paymentDate;
        }

        // Calculate payment delay
        const invoiceDate = new Date(invoice.invoiceDate);
        const expectedPaymentDate = new Date(invoiceDate);
        expectedPaymentDate.setDate(invoiceDate.getDate() + paymentDays);

        if (paymentDate > expectedPaymentDate) {
          const delayDays = Math.floor((paymentDate.getTime() - expectedPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
          totalDelayDays += delayDays;
          paymentsWithDelay++;
        }
      }

      // Calculate next payment due (for unpaid invoices)
      const invoicePaid = invoice.TransactionMatch.reduce((sum, match) =>
        sum + (isNaN(Number(match.Transaction.debitAmount ?? 0)) ? 0 : Number(match.Transaction.debitAmount ?? 0)) * conversionRate, 0
      );
      const invoiceBalance = (isNaN(totalInEGP) ? 0 : totalInEGP) - invoicePaid;
      if (invoiceBalance > 0) {
        const invoiceDate = new Date(invoice.invoiceDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(invoiceDate.getDate() + paymentDays);
        if (!nextPaymentDue || dueDate < nextPaymentDue) {
          nextPaymentDue = dueDate;
        }
      }
    }

    const outstandingBalance = (isNaN(totalPayables) ? 0 : totalPayables) - (isNaN(totalPaid) ? 0 : totalPaid);
    const averagePaymentDelay = paymentsWithDelay > 0 ? Math.round(totalDelayDays / paymentsWithDelay) : 0;

    // Calculate overdue amount
    const now = new Date();
    let overdueAmount = 0;
    for (const invoice of supplier.Invoice) {
      const invoiceCurrency = invoice.currency || 'EGP';
      const conversionRate = conversionCache.get(`${invoiceCurrency}_EGP`) ?? 1;
      const invoiceDate = new Date(invoice.invoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + paymentDays);
      if (dueDate < now) {
        const invoiceTotal = Number(invoice.total ?? 0);
        const invoiceTotalInEGP = invoiceTotal * conversionRate;
        const paidAmount = invoice.TransactionMatch.reduce((sum, match) =>
          sum + (isNaN(Number(match.Transaction.debitAmount ?? 0)) ? 0 : Number(match.Transaction.debitAmount ?? 0)) * conversionRate, 0
        );
        const balance = (isNaN(invoiceTotalInEGP) ? 0 : invoiceTotalInEGP) - paidAmount;
        if (balance > 0) {
          overdueAmount += balance;
        }
      }
    }

    return {
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      etaId: supplier.etaId,
      paymentTerms: `Net ${paymentDays}`,
      paymentDays,
      totalPayables: Math.round((isNaN(totalPayables) ? 0 : totalPayables) * 100) / 100,
      totalPaid: Math.round((isNaN(totalPaid) ? 0 : totalPaid) * 100) / 100,
      outstandingBalance: Math.round((isNaN(outstandingBalance) ? 0 : outstandingBalance) * 100) / 100,
      overdueAmount: Math.round((isNaN(overdueAmount) ? 0 : overdueAmount) * 100) / 100,
      invoiceCount: supplier.Invoice.length,
      averagePaymentDelay,
      currency: 'EGP',
      lastPaymentDate,
      nextPaymentDue,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    };
  }));
}

export const GET = withAuth(async (request: NextRequest, authContext) => {
  try {
    const { companyAccessService } = authContext;
    
    // Get all suppliers with their invoices and transaction matches using company-scoped filtering
    const suppliers = await companyAccessService.getSuppliers();

    // Currency conversion cache to avoid duplicate API calls
    const conversionCache = new Map<string, number>();

    // Transform the data to include calculated metrics with currency conversion
    const suppliersWithTotals = await getSuppliersWithConversion(suppliers as SupplierWithInvoicesAndMatches[], conversionCache);

    return NextResponse.json({
      success: true,
      data: suppliersWithTotals,
      count: suppliersWithTotals.length,
      currency: 'EGP',
      metadata: {
        totalPayables: suppliersWithTotals.reduce((sum, s) => sum + s.totalPayables, 0),
        totalPaid: suppliersWithTotals.reduce((sum, s) => sum + s.totalPaid, 0),
        totalOutstanding: suppliersWithTotals.reduce((sum, s) => sum + s.outstandingBalance, 0),
        totalOverdue: suppliersWithTotals.reduce((sum, s) => sum + s.overdueAmount, 0),
        averagePaymentDelay: suppliersWithTotals.length > 0 
          ? Math.round(suppliersWithTotals.reduce((sum, s) => sum + s.averagePaymentDelay, 0) / suppliersWithTotals.length)
          : 0,
        conversionNote: 'All amounts converted to EGP using latest exchange rates'
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, authContext) => {
  try {
    const { companyAccessService } = authContext;
    const body = await request.json();
    
    const { name, country, etaId, paymentTermsData } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Supplier name is required' },
        { status: 400 }
      );
    }

    // Create supplier using company-scoped service
    const supplier = await companyAccessService.createSupplier({
      name: name.trim(),
      country: country || null,
      etaId: etaId || null,
      paymentTermsData: paymentTermsData || null,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}); 