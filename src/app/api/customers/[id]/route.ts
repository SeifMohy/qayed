import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
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
  currency: string;
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
      creditAmount: any; // Prisma Decimal type
      description: string | null;
      bankStatement: {
        bankName: string;
      };
    };
  }>;
}

export const GET = withAuth(async (
    request: NextRequest,
    authContext,
    { params }: { params: { id: string } }
) => {
    try {
        const customerId = parseInt(params.id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        const { companyAccessService } = authContext;

        // Get customer with company-scoped filtering
        let customer;
        try {
            customer = await companyAccessService.getCustomer(customerId);
        } catch (error: any) {
            if (error.message === 'Customer not found or access denied') {
                return NextResponse.json(
                    { error: 'Customer not found or access denied' },
                    { status: 404 }
                );
            }
            throw error;
        }

        // Calculate metrics for each invoice
        const invoicesWithMatches: InvoiceWithMatches[] = customer.Invoice.map(invoice => {
            const totalPaid = invoice.TransactionMatch.reduce((sum, match) => {
                return sum + Number(match.Transaction.creditAmount || 0);
            }, 0);
            
            const remaining = Number(invoice.total) - totalPaid;
            const isFullyPaid = remaining <= 0.01; // Account for floating point precision
            
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
                currency: invoice.currency,
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

        // Calculate total receivables (remaining amounts)
        const totalReceivables = invoicesWithMatches.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

        // Get all matched transactions for the transactions tab
        const matchedTransactions: MatchedTransaction[] = customer.Invoice
            .flatMap(invoice => 
                invoice.TransactionMatch.map(match => ({
                    id: match.Transaction.id,
                    transactionDate: match.Transaction.transactionDate.toISOString().split('T')[0],
                    amount: Number(match.Transaction.creditAmount || 0),
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

        // Calculate legacy payment terms for backward compatibility
        const legacyPaymentTerms = (() => {
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

        // Format the customer data
        const formattedCustomer = {
            id: customer.id,
            name: customer.name,
            contact: 'N/A',
            email: 'N/A',
            phone: 'N/A',
            industry: 'N/A',
            relationshipSince: customer.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            }),
            totalReceivables: totalReceivables,
            paymentTerms: legacyPaymentTerms,
            averagePaymentTime: averagePaymentTime,
            onTimePaymentPercentage: onTimePaymentPercentage,
            invoiceCount: customer.Invoice.length,
            lastInvoiceDate: customer.Invoice.length > 0 
                ? customer.Invoice.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())[0].invoiceDate.toISOString().split('T')[0]
                : null
        };

        return NextResponse.json({
            customer: formattedCustomer,
            invoices: invoicesWithMatches,
            transactions: matchedTransactions
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
});

export const PUT = withAuth(async (
    request: NextRequest,
    authContext,
    { params }: { params: { id: string } }
) => {
    try {
        const customerId = parseInt(params.id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        const { companyAccessService } = authContext;
        const body = await request.json();

        // Validate and prepare update data
        const updateData: any = {};
        
        if (body.name !== undefined) {
            if (!body.name || body.name.trim() === '') {
                return NextResponse.json(
                    { error: 'Customer name cannot be empty' },
                    { status: 400 }
                );
            }
            updateData.name = body.name.trim();
        }
        
        if (body.country !== undefined) {
            updateData.country = body.country || null;
        }
        
        if (body.etaId !== undefined) {
            updateData.etaId = body.etaId || null;
        }
        
        if (body.paymentTermsData !== undefined) {
            updateData.paymentTermsData = body.paymentTermsData || null;
        }

        // Update customer using company-scoped service
        const updatedCustomer = await companyAccessService.updateCustomer(customerId, updateData);

        return NextResponse.json({
            success: true,
            data: updatedCustomer,
            message: 'Customer updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating customer:', error);
        
        if (error.message === 'Customer not found or access denied') {
            return NextResponse.json(
                { error: 'Customer not found or access denied' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}); 