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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = parseInt(params.id);

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        // Get customer with their invoices and related transaction matches
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
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

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
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
            salesPastYear: customer.Invoice.reduce((sum, inv) => sum + Number(inv.total), 0),
            paymentTerms: legacyPaymentTerms,
            paymentTermsData: (customer as any).paymentTermsData as PaymentTermsData | null,
            paymentStatus: onTimePaymentPercentage !== null 
                ? onTimePaymentPercentage >= 90 ? 'Excellent' 
                  : onTimePaymentPercentage >= 70 ? 'Good'
                  : onTimePaymentPercentage >= 50 ? 'Fair' : 'Poor'
                : 'No Data',
            creditScore: 'N/A',
            averageInvoiceAmount: customer.Invoice.reduce((sum, inv) => sum + Number(inv.total), 0) / Math.max(1, customer.Invoice.length),
            country: customer.country || 'N/A',
            totalReceivables,
            averagePaymentTime,
            onTimePaymentPercentage,
            recentPayments: matchedTransactions.length,
            invoices: invoicesWithMatches,
            matchedTransactions,
            notes: ''
        };

        return NextResponse.json(formattedCustomer);
    } catch (error: any) {
        console.error('Error fetching customer:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = parseInt(params.id);
        const body = await request.json();

        if (isNaN(customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 }
            );
        }

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: { Invoice: true }
        });

        if (!existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
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

        // Handle name changes with reconciliation
        if ('name' in body && body.name !== existingCustomer.name) {
            const newName = body.name.trim();
            
            // Check if another customer with this name already exists
            const duplicateCustomer = await prisma.customer.findFirst({
                where: {
                    name: newName,
                    id: { not: customerId } // Exclude the current customer
                },
                include: { Invoice: true }
            });

            if (duplicateCustomer) {
                console.log(`🔄 Found duplicate customer with name "${newName}". Reconciling...`);
                
                // Use a transaction to ensure data consistency
                await prisma.$transaction(async (tx) => {
                    // Move all invoices from the duplicate customer to the current customer
                    await tx.invoice.updateMany({
                        where: { customerId: duplicateCustomer.id },
                        data: { customerId: customerId }
                    });

                    // Delete the duplicate customer
                    await tx.customer.delete({
                        where: { id: duplicateCustomer.id }
                    });

                    // Update the current customer's name and other fields
                    await tx.customer.update({
                        where: { id: customerId },
                        data: { 
                            name: newName,
                            ...updateData,
                            updatedAt: new Date()
                        }
                    });
                });

                console.log(`✅ Successfully reconciled customer "${newName}" by merging ${duplicateCustomer.Invoice.length} invoices`);

                return NextResponse.json({
                    success: true,
                    message: `Customer updated and reconciled with existing duplicate. Merged ${duplicateCustomer.Invoice.length} invoices.`,
                    reconciledInvoices: duplicateCustomer.Invoice.length
                });
            } else {
                // No duplicate found, just update the name
                updateData.name = newName;
            }
        }

        // Handle other field updates
        if ('country' in body) {
            updateData.country = body.country;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        updateData.updatedAt = new Date();

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Customer updated successfully',
            customer: updatedCustomer
        });
    } catch (error: any) {
        console.error('Error updating customer:', error.message);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
} 