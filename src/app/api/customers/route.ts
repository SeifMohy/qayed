import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import type { Customer, Invoice } from '@prisma/client';
import type { PaymentTermsData } from '@/types/paymentTerms';

interface CustomerWithInvoicesAndMatches extends Customer {
  Invoice: Array<Invoice & {
    TransactionMatch: Array<{
      Transaction: {
        transactionDate: Date;
        creditAmount: any; // Prisma Decimal type
      };
    }>;
  }>;
}

interface CustomerResponse {
  id: number;
  name: string;
  country: string | null;
  etaId: string | null;
  paymentTerms: string;
  paymentDays: number;
  totalReceivables: number;
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
      console.warn(`Currency conversion failed for ${fromCurrency} to ${toCurrency}, using 1:1 rate`);
      return amount;
    }

    const data = await response.json();
    return data.success ? data.convertedAmount : amount;
  } catch (error) {
    console.warn(`Currency conversion error for ${fromCurrency} to ${toCurrency}:`, error);
    return amount;
  }
}

// Function to get customers with currency conversion
async function getCustomersWithConversion(customers: CustomerWithInvoicesAndMatches[], conversionCache: Map<string, number>): Promise<CustomerResponse[]> {
  return Promise.all(customers.map(async (customer) => {
    // Calculate payment terms from paymentTermsData or default to 30
    const paymentDays = (() => {
      const termsData = (customer as any).paymentTermsData as PaymentTermsData | null;
      if (termsData?.paymentPeriod) {
        if (termsData.paymentPeriod.includes('Net ')) {
          return parseInt(termsData.paymentPeriod.replace('Net ', '')) || 30;
        } else if (termsData.paymentPeriod === 'Due on receipt') {
          return 0;
        }
      }
      return 30; // Default fallback
    })();

    // Calculate total receivables and paid amounts
    let totalReceivables = 0;
    let totalPaid = 0;
    let totalDelayDays = 0;
    let paymentsWithDelay = 0;
    let lastPaymentDate: Date | null = null;
    let nextPaymentDue: Date | null = null;

    for (const invoice of customer.Invoice) {
      const invoiceCurrency = invoice.currency || 'EGP';
      let conversionRate = 1;

      // Get conversion rate (cached)
      if (invoiceCurrency !== 'EGP') {
        const cacheKey = `${invoiceCurrency}_EGP`;
        if (conversionCache.has(cacheKey)) {
          conversionRate = conversionCache.get(cacheKey)!;
        } else {
          conversionRate = await convertCurrency(1, invoiceCurrency, 'EGP');
          conversionCache.set(cacheKey, conversionRate);
        }
      }

      const totalInEGP = Number(invoice.total) * conversionRate;
      totalReceivables += totalInEGP;

      // Calculate payments and delays
      for (const match of invoice.TransactionMatch) {
        const paidAmount = Number(match.Transaction.creditAmount || 0) * conversionRate;
        totalPaid += paidAmount;

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
      const invoiceBalance = totalInEGP - (invoice.TransactionMatch.reduce((sum, match) => 
        sum + Number(match.Transaction.creditAmount || 0) * conversionRate, 0
      ));
      
      if (invoiceBalance > 0) {
        const invoiceDate = new Date(invoice.invoiceDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(invoiceDate.getDate() + paymentDays);
        
        if (!nextPaymentDue || dueDate < nextPaymentDue) {
          nextPaymentDue = dueDate;
        }
      }
    }

    const outstandingBalance = totalReceivables - totalPaid;
    const averagePaymentDelay = paymentsWithDelay > 0 ? Math.round(totalDelayDays / paymentsWithDelay) : 0;

    // Calculate overdue amount
    const now = new Date();
    let overdueAmount = 0;
    for (const invoice of customer.Invoice) {
      const invoiceCurrency = invoice.currency || 'EGP';
      const conversionRate = conversionCache.get(`${invoiceCurrency}_EGP`) || 1;
      
      const invoiceDate = new Date(invoice.invoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + paymentDays);
      
      if (dueDate < now) {
        const invoiceTotal = Number(invoice.total) * conversionRate;
        const paidAmount = invoice.TransactionMatch.reduce((sum, match) => 
          sum + Number(match.Transaction.creditAmount || 0) * conversionRate, 0
        );
        const balance = invoiceTotal - paidAmount;
        if (balance > 0) {
          overdueAmount += balance;
        }
      }
    }

    return {
      id: customer.id,
      name: customer.name,
      country: customer.country,
      etaId: customer.etaId,
      paymentTerms: `Net ${paymentDays}`,
      paymentDays,
      totalReceivables: Math.round(totalReceivables * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstandingBalance: Math.round(outstandingBalance * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      invoiceCount: customer.Invoice.length,
      averagePaymentDelay,
      currency: 'EGP',
      lastPaymentDate,
      nextPaymentDue,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }));
}

export const GET = withAuth(async (request: NextRequest, authContext) => {
  console.log('🔍 Starting customers API request...');
  
  try {
    const { companyAccessService } = authContext;
    
    console.log('📊 Attempting to fetch customers from database...');
    // Get all customers with their invoices and transaction matches using company-scoped filtering
    const customers = await companyAccessService.getCustomers();
    
    console.log(`✅ Successfully fetched ${customers.length} customers from database`);

    // Currency conversion cache to avoid duplicate API calls
    const conversionCache = new Map<string, number>();

    // Transform the data to include calculated metrics with currency conversion
    const customersWithTotals = await getCustomersWithConversion(customers as CustomerWithInvoicesAndMatches[], conversionCache);

    return NextResponse.json({
      success: true,
      data: customersWithTotals,
      count: customersWithTotals.length,
      currency: 'EGP',
      metadata: {
        totalReceivables: customersWithTotals.reduce((sum, c) => sum + c.totalReceivables, 0),
        totalPaid: customersWithTotals.reduce((sum, c) => sum + c.totalPaid, 0),
        totalOutstanding: customersWithTotals.reduce((sum, c) => sum + c.outstandingBalance, 0),
        totalOverdue: customersWithTotals.reduce((sum, c) => sum + c.overdueAmount, 0),
        averagePaymentDelay: customersWithTotals.length > 0 
          ? Math.round(customersWithTotals.reduce((sum, c) => sum + c.averagePaymentDelay, 0) / customersWithTotals.length)
          : 0,
        conversionNote: 'All amounts converted to EGP using latest exchange rates'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
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
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Create customer using company-scoped service
    const customer = await companyAccessService.createCustomer({
      name: name.trim(),
      country: country || null,
      etaId: etaId || null,
      paymentTermsData: paymentTermsData || null,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}); 