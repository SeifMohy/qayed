import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  paymentTerms: number | null;
  totalPayables: number;
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
  try {
    // Get all suppliers with their invoices and transaction matches
    const suppliers = await prisma.supplier.findMany({
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
                    debitAmount: true
                  }
                }
              }
            }
          }
        }
      },
    });

    // Currency conversion cache to avoid duplicate API calls
    const conversionCache = new Map<string, number>();

    // Transform the data to include calculated metrics with currency conversion
    const suppliersWithTotals: SupplierResponse[] = await Promise.all(suppliers.map(async (supplier) => {
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

      // Calculate total payables and paid amounts based on transaction matches
      let totalPayables = 0;
      let paidAmount = 0;

      const paymentDates: Date[] = [];

      for (const invoice of supplier.Invoice) {
        // Convert total paid amount to EGP
        let totalPaidEGP = 0;
        for (const match of invoice.TransactionMatch) {
          const cacheKey = `${invoice.currency}-EGP`;
          let conversionRate = conversionCache.get(cacheKey);
          
          if (conversionRate === undefined) {
            const debitAmountEGP = await convertToEGP(Number(match.Transaction.debitAmount || 0), invoice.currency);
            conversionRate = Number(match.Transaction.debitAmount || 0) === 0 ? 1 : debitAmountEGP / Number(match.Transaction.debitAmount || 0);
            conversionCache.set(cacheKey, conversionRate);
          }
          
          totalPaidEGP += Number(match.Transaction.debitAmount || 0) * conversionRate;
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
        
        totalPayables += Math.max(0, remainingEGP);
        paidAmount += totalPaidEGP;

        // Collect payment dates
        invoice.TransactionMatch.forEach(match => {
          paymentDates.push(new Date(match.Transaction.transactionDate));
        });
      }

      // Find the latest payment date
      const latestPaymentDate = paymentDates.length > 0 
        ? paymentDates.reduce((latest, current) => current > latest ? current : latest)
        : null;

      // Determine status based on payment status
      let status = 'On Time';
      if (totalPayables > 0) {
        status = totalPayables > 1000 ? 'Outstanding' : 'Current';
      } else if (paidAmount > 0) {
        status = 'Paid';
      }

      return {
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        paymentTerms: paymentDays,
        totalPayables: Math.round(totalPayables * 100) / 100, // Round to 2 decimal places
        paidAmount: Math.round(paidAmount * 100) / 100,
        lastPayment: latestPaymentDate ? latestPaymentDate.toISOString().split('T')[0] : null,
        nextPayment: null, // Will be calculated based on invoice due dates
        status
      };
    }));

    console.log(`✅ Successfully transformed ${suppliersWithTotals.length} suppliers with EGP conversion`);
    console.log('📊 Total payables (EGP):', suppliersWithTotals.reduce((sum, s) => sum + s.totalPayables, 0));
    console.log('📊 Total paid amount (EGP):', suppliersWithTotals.reduce((sum, s) => sum + s.paidAmount, 0));

    return NextResponse.json(suppliersWithTotals);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
} 