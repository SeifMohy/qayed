import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PaymentTermsData } from '@/types/paymentTerms';

interface MatchedTransaction {
  id: number;
  transactionDate: string;
  amount: number;
  description: string | null;
  bankName: string;
  matchScore: number;
  invoiceNumber: string;
}

interface InvoiceWithMatches {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  invoiceStatus: string;
  dueDate: string;
  paidAmount: number;
  remainingAmount: number;
  paidDate: string | null;
  TransactionMatch: Array<{
    id: number;
    matchScore: number;
    status: string;
    Transaction: {
      id: number;
      transactionDate: Date;
      debitAmount: any; // Using any to handle Prisma Decimal type
      description: string | null;
      bankStatement: {
        bankName: string;
      };
    };
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    // Get supplier with their invoices and related transaction matches
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        Invoice: {
          include: {
            TransactionMatch: {
              where: {
                status: 'APPROVED' // Only include approved matches
              },
              include: {
                Transaction: {
                  include: {
                    bankStatement: {
                      select: {
                        bankName: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { invoiceDate: 'desc' }
        }
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Calculate metrics for each invoice (using debit amounts for supplier payments)
    const invoicesWithMatches: InvoiceWithMatches[] = supplier.Invoice.map(invoice => {
      const totalPaid = invoice.TransactionMatch.reduce((sum, match) => {
        return sum + Number(match.Transaction.debitAmount || 0);
      }, 0);
      
      const remaining = Number(invoice.total) - totalPaid;
      const isFullyPaid = remaining <= 0.01; // Account for floating point precision
      
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
      
      // Get the latest transaction date for this invoice if fully paid
      const latestTransactionDate = isFullyPaid && invoice.TransactionMatch.length > 0 
        ? invoice.TransactionMatch
            .map(match => match.Transaction.transactionDate)
            .sort((a, b) => b.getTime() - a.getTime())[0]
        : null;

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
        total: Number(invoice.total),
        invoiceStatus: invoice.invoiceStatus,
        dueDate: new Date(invoice.invoiceDate.getTime() + paymentDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        paidAmount: totalPaid,
        remainingAmount: Math.max(0, remaining),
        paidDate: latestTransactionDate ? latestTransactionDate.toISOString().split('T')[0] : null,
        TransactionMatch: invoice.TransactionMatch
      };
    });

    // Calculate total payables (remaining amounts)
    const totalPayables = invoicesWithMatches.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

    // Get all matched transactions for the transactions tab
    const matchedTransactions: MatchedTransaction[] = supplier.Invoice
      .flatMap(invoice => 
        invoice.TransactionMatch.map(match => ({
          id: match.Transaction.id,
          transactionDate: match.Transaction.transactionDate.toISOString().split('T')[0],
          amount: Number(match.Transaction.debitAmount || 0),
          description: match.Transaction.description,
          bankName: match.Transaction.bankStatement.bankName,
          matchScore: match.matchScore,
          invoiceNumber: invoice.invoiceNumber
        }))
      )
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    // Calculate payment analytics
    const fullyPaidInvoices = invoicesWithMatches.filter(inv => inv.paidDate);
    const totalPaymentTime = fullyPaidInvoices.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      const paidDate = new Date(invoice.paidDate!);
      const daysDiff = Math.ceil((paidDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    const averagePaymentTime = fullyPaidInvoices.length > 0 ? Math.round(totalPaymentTime / fullyPaidInvoices.length) : null;

    // Calculate on-time payment percentage
    const onTimePayments = fullyPaidInvoices.filter(invoice => {
      const paidDate = new Date(invoice.paidDate!);
      const dueDate = new Date(invoice.dueDate);
      return paidDate <= dueDate;
    }).length;

    const onTimePaymentPercentage = fullyPaidInvoices.length > 0 
      ? Math.round((onTimePayments / fullyPaidInvoices.length) * 100) 
      : null;

    // Calculate due in next 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    const dueNext30Days = invoicesWithMatches.reduce((sum, invoice) => {
      const dueDate = new Date(invoice.dueDate);
      if (dueDate >= now && dueDate <= thirtyDaysLater && invoice.remainingAmount > 0) {
        return sum + invoice.remainingAmount;
      }
      return sum;
    }, 0);

    // Calculate legacy payment terms for backward compatibility
    const legacyPaymentTerms = (() => {
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

    // Format the supplier data
    const formattedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contact: 'N/A',
      email: 'N/A',
      phone: 'N/A',
      industry: 'N/A',
      relationshipSince: supplier.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      }),
      purchasesPastYear: `$${supplier.Invoice.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      paymentTerms: legacyPaymentTerms,
      paymentTermsData: (supplier as any).paymentTermsData as PaymentTermsData | null,
      paymentStatus: onTimePaymentPercentage !== null 
        ? onTimePaymentPercentage >= 90 ? 'Excellent' 
          : onTimePaymentPercentage >= 70 ? 'Good'
          : onTimePaymentPercentage >= 50 ? 'Fair' : 'Poor'
        : 'No Data',
      supplierRating: 'N/A',
      dueNext30Days: `$${dueNext30Days.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      averageInvoiceAmount: `$${(supplier.Invoice.reduce((sum, inv) => sum + Number(inv.total), 0) / Math.max(1, supplier.Invoice.length)).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      country: supplier.country || 'N/A',
      totalPayables,
      averagePaymentTime,
      onTimePaymentPercentage,
      recentPayments: matchedTransactions.length,
      invoices: invoicesWithMatches,
      matchedTransactions,
      notes: ''
    };

    return NextResponse.json(formattedSupplier);
  } catch (error: any) {
    console.error('Error fetching supplier:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      );
    }

    // Handle both old paymentTerms and new paymentTermsData
    const updateData: any = {};

    if ('paymentTermsData' in body) {
      // Validate payment terms data structure
      const termsData = body.paymentTermsData as PaymentTermsData;
      if (termsData && typeof termsData === 'object') {
        updateData.paymentTermsData = termsData;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: updateData
    });

    return NextResponse.json(updatedSupplier);
  } catch (error: any) {
    console.error('Error updating supplier:', error.message);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
} 