import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


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

        // Get customer with their invoices
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                Invoice: {
                    orderBy: { invoiceDate: 'desc' }, // Most recent invoices first
                },
            },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Calculate total receivables
        const totalReceivables = customer.Invoice.reduce(
            (sum, invoice) => sum + Number(invoice.total),
            0
        );

        // Format the data to match the structure expected by the frontend
        const formattedInvoices = customer.Invoice.map((invoice) => ({
            id: invoice.id,
            date: invoice.invoiceDate.toISOString().split('T')[0],
            invoice: invoice.invoiceNumber,
            amount: invoice.total.toString(),
            status: invoice.invoiceStatus,
            dueDate: new Date(invoice.invoiceDate.getTime() + (customer.paymentTerms || 30) * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0], // Using customer payment terms if available, or default to 30 days
            paidDate: null, // Will be added once bank statements are implemented
        }));

        // Calculate stats
        const invoiceCount = customer.Invoice.length;
        const avgInvoiceAmount = invoiceCount > 0 ? totalReceivables / invoiceCount : 0;
        const relationshipStart = customer.createdAt;
        const relationshipSinceFormatted = relationshipStart.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });

        // Format the customer data
        const formattedCustomer = {
            id: customer.id,
            name: customer.name,
            contact: 'N/A', // Will be updated when this data is available
            email: 'N/A', // Will be updated when this data is available
            phone: 'N/A', // Will be updated when this data is available
            industry: 'N/A', // Will be updated when this data is available
            relationshipSince: relationshipSinceFormatted,
            salesPastYear: `$${totalReceivables.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            grantedFacilities: 'N/A', // Will be updated when this data is available
            paymentTerms: customer.paymentTerms ? `Net ${customer.paymentTerms}` : 'N/A',
            percentOfTotalSales: 'N/A', // Will be calculated when we have all customers data
            paymentStatus: 'On Time', // Will be updated once bank statements are implemented
            creditScore: 'N/A', // Will be updated when this data is available
            averageInvoiceAmount: `$${avgInvoiceAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            country: customer.country || 'N/A',
            history: formattedInvoices,
            notes: '', // Will be updated when this feature is implemented
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