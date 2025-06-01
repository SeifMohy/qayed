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
  lastPayment: string | null;
  nextPayment: string | null;
  status: string;
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

    // Transform the data to include calculated metrics
    const customersWithTotals: CustomerResponse[] = customers.map((customer) => {
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

      // Calculate total receivables and overdue amounts based on transaction matches
      let totalReceivables = 0;
      let overdueAmount = 0;

      const paymentDates: Date[] = [];

      customer.Invoice.forEach(invoice => {
        const totalPaid = invoice.TransactionMatch.reduce((sum, match) => {
          return sum + Number(match.Transaction.creditAmount || 0);
        }, 0);
        
        const remaining = Number(invoice.total) - totalPaid;
        totalReceivables += Math.max(0, remaining);

        // Check if overdue
        const dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + paymentDays);
        if (remaining > 0 && new Date() > dueDate) {
          overdueAmount += remaining;
        }

        // Collect payment dates
        invoice.TransactionMatch.forEach(match => {
          paymentDates.push(new Date(match.Transaction.transactionDate));
        });
      });

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

      // Determine status based on overdue amount
      let status = 'On Time';
      if (overdueAmount > 0) {
        status = overdueAmount > 1000 ? 'Overdue' : 'Due Soon';
      }

      const transformedCustomer = {
        id: customer.id,
        name: customer.name,
        country: customer.country,
        paymentTerms: paymentDays,
        totalReceivables,
        overdueAmount,
        lastPayment: latestPaymentDate ? latestPaymentDate.toISOString().split('T')[0] : null,
        nextPayment: lastInvoiceDate,
        status
      };

      console.log(`📊 Transformed customer ${customer.id}:`, {
        name: transformedCustomer.name,
        totalReceivables: transformedCustomer.totalReceivables,
        overdueAmount: transformedCustomer.overdueAmount,
        lastPayment: transformedCustomer.lastPayment
      });

      return transformedCustomer;
    });

    console.log(`✅ Successfully transformed ${customersWithTotals.length} customers`);
    console.log('📊 Total receivables:', customersWithTotals.reduce((sum, c) => sum + c.totalReceivables, 0));
    console.log('📊 Total overdue:', customersWithTotals.reduce((sum, c) => sum + c.overdueAmount, 0));

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