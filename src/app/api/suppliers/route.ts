import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Supplier, Invoice } from '@/generated/prisma';

interface SupplierWithInvoices extends Supplier {
  Invoice: Invoice[];
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
    // Get all suppliers with their invoices
    const suppliers = await prisma.supplier.findMany({
      include: {
        Invoice: true,
      },
    });

    // Transform the data to include calculated total payables for each supplier
    const suppliersWithTotals: SupplierResponse[] = suppliers.map((supplier: SupplierWithInvoices) => {
      // Calculate total payables (sum of invoice totals)
      const totalPayables = supplier.Invoice.reduce(
        (sum: number, invoice: Invoice) => sum + Number(invoice.total), 
        0
      );

      // Get the most recent invoice date
      const sortedInvoices = [...supplier.Invoice].sort(
        (a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime()
      );
      const lastInvoiceDate = sortedInvoices.length > 0 
        ? sortedInvoices[0].invoiceDate.toISOString().split('T')[0]
        : null;

      // Calculate due in next 30 days - for now using date-based logic
      // This will be updated with actual banking data when available
      const now = new Date();
      const thirtyDaysLater = new Date(now);
      thirtyDaysLater.setDate(now.getDate() + 30);
      
      const dueNext30Days = supplier.Invoice.reduce((sum: number, invoice: Invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        // Estimate due date as invoice date + 30 days
        const estimatedDueDate = new Date(invoiceDate);
        estimatedDueDate.setDate(invoiceDate.getDate() + 30);
        
        if (estimatedDueDate >= now && estimatedDueDate <= thirtyDaysLater) {
          return sum + Number(invoice.total);
        }
        return sum;
      }, 0);

      return {
        id: supplier.id,
        name: supplier.name,
        country: supplier.country,
        paymentTerms: supplier.paymentTerms,
        totalPayables,
        dueNext30Days,
        lastPayment: null, // Placeholder until bank statement implementation
        nextPayment: lastInvoiceDate, // Using most recent invoice date as proxy until bank data is available
        status: 'On Time', // Placeholder until bank statement implementation
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