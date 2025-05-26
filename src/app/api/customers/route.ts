import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Customer, Invoice } from '@prisma/client';

interface CustomerWithInvoices extends Customer {
  Invoice: Invoice[];
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
    // Get all customers with their invoices
    const customers = await prisma.customer.findMany({
      include: {
        Invoice: true,
      },
    });
    
    console.log(`✅ Successfully fetched ${customers.length} customers from database`);
    console.log('📝 Sample customer data:', customers.length > 0 ? {
      firstCustomer: {
        id: customers[0].id,
        name: customers[0].name,
        invoiceCount: customers[0].Invoice.length
      }
    } : 'No customers found');

    // Transform the data to include calculated total receivables for each customer
    const customersWithTotals: CustomerResponse[] = customers.map((customer: CustomerWithInvoices) => {
      // Calculate total receivables (sum of invoice totals)
      const totalReceivables = customer.Invoice.reduce(
        (sum: number, invoice: Invoice) => sum + Number(invoice.total), 
        0
      );

      // Get the most recent invoice date
      const sortedInvoices = [...customer.Invoice].sort(
        (a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime()
      );
      const lastInvoiceDate = sortedInvoices.length > 0 
        ? sortedInvoices[0].invoiceDate.toISOString().split('T')[0]
        : null;

      const transformedCustomer = {
        id: customer.id,
        name: customer.name,
        country: customer.country,
        paymentTerms: customer.paymentTerms,
        totalReceivables,
        // Bank statement related fields would be added here once implemented
        overdueAmount: 0, // Placeholder until bank statement implementation
        lastPayment: null, // Placeholder until bank statement implementation
        nextPayment: lastInvoiceDate, // Using most recent invoice date as proxy until bank data is available
        status: 'On Time', // Placeholder until bank statement implementation
      };

      console.log(`📊 Transformed customer ${customer.id}:`, {
        name: transformedCustomer.name,
        totalReceivables: transformedCustomer.totalReceivables,
        invoiceCount: customer.Invoice.length
      });

      return transformedCustomer;
    });

    console.log(`✅ Successfully transformed ${customersWithTotals.length} customers`);
    console.log('📊 Total receivables:', customersWithTotals.reduce((sum, c) => sum + c.totalReceivables, 0));

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