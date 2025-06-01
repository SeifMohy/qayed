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
  dueNext30Days: number;
  lastPayment: string | null;
  nextPayment: string | null;
  status: string;
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

    // Transform the data to include calculated metrics
    const suppliersWithTotals: SupplierResponse[] = suppliers.map((supplier) => {
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

      // Calculate total payables and due amounts based on transaction matches
      let totalPayables = 0;
      let dueNext30Days = 0;

      const now = new Date();
      const thirtyDaysLater = new Date(now);
      thirtyDaysLater.setDate(now.getDate() + 30);

      const paymentDates: Date[] = [];

      supplier.Invoice.forEach(invoice => {
        const totalPaid = invoice.TransactionMatch.reduce((sum, match) => {
          return sum + Number(match.Transaction.debitAmount || 0);
        }, 0);
        
        const remaining = Number(invoice.total) - totalPaid;
        totalPayables += Math.max(0, remaining);

        // Check if due in next 30 days
        const dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + paymentDays);
        if (remaining > 0 && dueDate >= now && dueDate <= thirtyDaysLater) {
          dueNext30Days += remaining;
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

      // Determine status based on due amounts
      let status = 'On Time';
      if (dueNext30Days > 0) {
        status = dueNext30Days > 1000 ? 'Due Soon' : 'Current';
      }

      return {
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        paymentTerms: paymentDays,
        totalPayables,
        dueNext30Days,
        lastPayment: latestPaymentDate ? latestPaymentDate.toISOString().split('T')[0] : null,
        nextPayment: null, // Will be calculated based on invoice due dates
        status
      };
    });

    return NextResponse.json(suppliersWithTotals);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
} 