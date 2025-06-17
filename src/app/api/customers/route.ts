import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  paymentTerms: number | null;
  totalReceivables: number;
  overdueAmount: number;
  paidAmount: number;
  lastPayment: string | null;
  nextPayment: string | null;
  status: string;
}

// Helper function to convert amount to EGP
async function convertToEGP(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === 'EGP' || amount === 0) {
    return amount;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.abs(amount),
        fromCurrency,
        toCurrency: 'EGP'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return amount < 0 ? -data.conversion.convertedAmount : data.conversion.convertedAmount;
    } else {
      console.warn(`Currency conversion failed for ${fromCurrency} to EGP:`, data.error);
      // Fallback to default exchange rates
      const defaultRates: Record<string, number> = {
        'USD': 50,
        'EUR': 52.63,
        'GBP': 62.5,
        'CNY': 6.9
      };
      const rate = defaultRates[fromCurrency] || 1;
      return amount * rate;
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback to default exchange rates
    const defaultRates: Record<string, number> = {
      'USD': 50,
      'EUR': 52.63,
      'GBP': 62.5,
      'CNY': 6.9
    };
    const rate = defaultRates[fromCurrency] || 1;
    return amount * rate;
  }
}

export async function GET() {
  console.log('🔍 Starting customers API request...');
  
  try {
    console.log('📊 Attempting to fetch customers from database...');
    // Get all customers with their invoices and transaction matches
    const customers = await prisma.customer.findMany({
      include: {
        Invoice: {
          include: {
            TransactionMatch: {
              where: {
                status: 'APPROVED'
              },
              include: {
                Transaction: {
                  select: {
                    transactionDate: true,
                    creditAmount: true
                  }
                }
              }
            }
          }
        }
      },
    });
    
    console.log(`✅ Successfully fetched ${customers.length} customers from database`);

    // Currency conversion cache to avoid duplicate API calls
    const conversionCache = new Map<string, number>();

    // Transform the data to include calculated metrics with currency conversion
    const customersWithTotals: CustomerResponse[] = await Promise.all(customers.map(async (customer) => {
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
      let overdueAmount = 0;
      let paidAmount = 0;

      const now = new Date();

      const paymentDates: Date[] = [];

      for (const invoice of customer.Invoice) {
        // Convert total paid amount to EGP
        let totalPaidEGP = 0;
        for (const match of invoice.TransactionMatch) {
          const cacheKey = `${invoice.currency}-EGP`;
          let conversionRate = conversionCache.get(cacheKey);
          
          if (conversionRate === undefined) {
            const creditAmountEGP = await convertToEGP(Number(match.Transaction.creditAmount || 0), invoice.currency);
            conversionRate = Number(match.Transaction.creditAmount || 0) === 0 ? 1 : creditAmountEGP / Number(match.Transaction.creditAmount || 0);
            conversionCache.set(cacheKey, conversionRate);
          }
          
          totalPaidEGP += Number(match.Transaction.creditAmount || 0) * conversionRate;
        }
        
        // Convert invoice total to EGP
        const cacheKey = `${invoice.currency}-EGP`;
        let conversionRate = conversionCache.get(cacheKey);
        
        if (conversionRate === undefined) {
          const invoiceTotalEGP = await convertToEGP(Number(invoice.total), invoice.currency);
          conversionRate = Number(invoice.total) === 0 ? 1 : invoiceTotalEGP / Number(invoice.total);
          conversionCache.set(cacheKey, conversionRate);
        }
        
        const invoiceTotalEGP = Number(invoice.total) * conversionRate;
        const remainingEGP = invoiceTotalEGP - totalPaidEGP;
        
        totalReceivables += Math.max(0, remainingEGP);
        paidAmount += totalPaidEGP;

        // Calculate due date for this invoice
        const dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + paymentDays);

        // Check if overdue
        if (remainingEGP > 0 && new Date() > dueDate) {
          overdueAmount += remainingEGP;
        }

        // Collect payment dates
        invoice.TransactionMatch.forEach(match => {
          paymentDates.push(new Date(match.Transaction.transactionDate));
        });
      }

      // Find the latest payment date
      const latestPaymentDate = paymentDates.length > 0 
        ? paymentDates.reduce((latest, current) => current > latest ? current : latest)
        : null;

      // Get the most recent invoice date for next payment estimation
      let lastInvoiceDate: string | null = null;
      if (customer.Invoice.length > 0) {
        const sortedInvoices = [...customer.Invoice].sort(
          (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
        );
        lastInvoiceDate = new Date(sortedInvoices[0].invoiceDate).toISOString().split('T')[0];
      }

      // Determine status based on payment status
      let status = 'On Time';
      if (overdueAmount > 0) {
        status = overdueAmount > 1000 ? 'Overdue' : 'Due Soon';
      } else if (totalReceivables === 0 && paidAmount > 0) {
        status = 'Paid';
      }

      const transformedCustomer = {
        id: customer.id,
        name: customer.name,
        country: customer.country,
        paymentTerms: paymentDays,
        totalReceivables: Math.round(totalReceivables * 100) / 100, // Round to 2 decimal places
        overdueAmount: Math.round(overdueAmount * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        lastPayment: latestPaymentDate ? latestPaymentDate.toISOString().split('T')[0] : null,
        nextPayment: lastInvoiceDate,
        status
      };

      console.log(`📊 Transformed customer ${customer.id}:`, {
        name: transformedCustomer.name,
        totalReceivables: transformedCustomer.totalReceivables,
        overdueAmount: transformedCustomer.overdueAmount,
        paidAmount: transformedCustomer.paidAmount,
        lastPayment: transformedCustomer.lastPayment
      });

      return transformedCustomer;
    }));

    console.log(`✅ Successfully transformed ${customersWithTotals.length} customers with EGP conversion`);
    console.log('📊 Total receivables (EGP):', customersWithTotals.reduce((sum, c) => sum + c.totalReceivables, 0));
    console.log('📊 Total overdue (EGP):', customersWithTotals.reduce((sum, c) => sum + c.overdueAmount, 0));
    console.log('📊 Total paid amount (EGP):', customersWithTotals.reduce((sum, c) => sum + c.paidAmount, 0));

    return NextResponse.json(customersWithTotals);
  } catch (error: any) {
    console.error('❌ Error in customers API:', {
      message: error.message,
      stack: error.stack,
      prismaError: error?.code, // Capture Prisma-specific error codes
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 