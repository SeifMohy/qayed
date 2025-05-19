import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Get supplier with their invoices
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        Invoice: {
          orderBy: { invoiceDate: 'desc' }, // Most recent invoices first
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Calculate total payables
    const totalPayables = supplier.Invoice.reduce(
      (sum, invoice) => sum + Number(invoice.total),
      0
    );

    // Format the data to match the structure expected by the frontend
    const formattedInvoices = supplier.Invoice.map((invoice) => ({
      id: invoice.id,
      date: invoice.invoiceDate.toISOString().split('T')[0],
      invoice: invoice.invoiceNumber,
      amount: invoice.total.toString(),
      status: invoice.invoiceStatus,
      dueDate: new Date(invoice.invoiceDate.getTime() + (supplier.paymentTerms || 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // Using supplier payment terms if available, or default to 30 days
      paidDate: null, // Will be added once bank statements are implemented
    }));

    // Calculate stats
    const invoiceCount = supplier.Invoice.length;
    const avgInvoiceAmount = invoiceCount > 0 ? totalPayables / invoiceCount : 0;
    const relationshipStart = supplier.createdAt;
    const relationshipSinceFormatted = relationshipStart.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });

    // Calculate due in next 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    const dueNext30Days = supplier.Invoice.reduce((sum, invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      // Estimate due date as invoice date + payment terms (or 30 days)
      const estimatedDueDate = new Date(invoiceDate);
      estimatedDueDate.setDate(invoiceDate.getDate() + (supplier.paymentTerms || 30));
      
      if (estimatedDueDate >= now && estimatedDueDate <= thirtyDaysLater) {
        return sum + Number(invoice.total);
      }
      return sum;
    }, 0);

    // Format the supplier data
    const formattedSupplier = {
      id: supplier.id,
      name: supplier.name,
      contact: 'N/A', // Will be updated when this data is available
      email: 'N/A', // Will be updated when this data is available
      phone: 'N/A', // Will be updated when this data is available
      industry: 'N/A', // Will be updated when this data is available
      relationshipSince: relationshipSinceFormatted,
      purchasesPastYear: `$${totalPayables.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      grantedFacilities: 'N/A', // Will be updated when this data is available
      paymentTerms: supplier.paymentTerms ? `Net ${supplier.paymentTerms}` : 'N/A',
      percentOfTotalPurchases: 'N/A', // Will be calculated when we have all suppliers data
      paymentStatus: 'On Time', // Will be updated once bank statements are implemented
      supplierRating: 'N/A', // Will be updated when this data is available
      dueNext30Days: `$${dueNext30Days.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      averageInvoiceAmount: `$${avgInvoiceAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      country: supplier.country || 'N/A',
      history: formattedInvoices,
      notes: '', // Will be updated when this feature is implemented
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