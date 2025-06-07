import { NextRequest, NextResponse } from 'next/server';
import { CashflowProjectionService } from '@/lib/services/cashflowProjectionService';
import { prisma } from '@/lib/prisma';
import { CashflowType, CashflowStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');
    const includeRelated = searchParams.get('includeRelated') === 'true';
    
    // Default to next 90 days if no dates provided
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date();
    
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // Parse type and status filters
    const typeFilter = typeParam ? typeParam.split(',') as CashflowType[] : undefined;
    const statusFilter = statusParam ? statusParam.split(',') as CashflowStatus[] : undefined;

    const service = new CashflowProjectionService();
    
    // Get projections with filters
    const projections = await service.getProjections(startDate, endDate, typeFilter, statusFilter);
    
    // Generate summary
    const summary = await service.generateSummary(startDate, endDate);

    // Format response
    const formattedProjections = projections.map(p => ({
      id: p.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      projectionDate: p.projectionDate,
      projectedAmount: Number(p.projectedAmount),
      actualAmount: p.actualAmount ? Number(p.actualAmount) : null,
      type: p.type,
      status: p.status,
      confidence: p.confidence,
      description: p.description,
      invoiceId: p.invoiceId,
      recurringPaymentId: p.recurringPaymentId,
      bankStatementId: p.bankStatementId,
      // Include related data if requested
      ...(includeRelated && {
        Invoice: p.Invoice ? {
          id: p.Invoice.id,
          invoiceNumber: p.Invoice.invoiceNumber,
          invoiceDate: p.Invoice.invoiceDate,
          total: Number(p.Invoice.total),
          Customer: p.Invoice.Customer,
          Supplier: p.Invoice.Supplier
        } : null,
        RecurringPayment: p.RecurringPayment ? {
          name: p.RecurringPayment.name,
          category: p.RecurringPayment.category,
          frequency: p.RecurringPayment.frequency,
          isActive: p.RecurringPayment.isActive
        } : null,
        BankStatement: p.BankStatement ? {
          id: p.BankStatement.id,
          bankName: p.BankStatement.bankName,
          accountType: p.BankStatement.accountType,
          endingBalance: Number(p.BankStatement.endingBalance)
        } : null
      })
    }));

    console.log(`📊 Cashflow projections summary:`);
    console.log(`   - Total projections: ${formattedProjections.length}`);
    console.log(`   - Customer receivables: ${formattedProjections.filter(p => p.type === 'CUSTOMER_RECEIVABLE').length}`);
    console.log(`   - Supplier payables: ${formattedProjections.filter(p => p.type === 'SUPPLIER_PAYABLE').length}`);
    console.log(`   - Bank obligations: ${formattedProjections.filter(p => p.type === 'BANK_OBLIGATION').length}`);
    console.log(`   - Loan payments: ${formattedProjections.filter(p => p.type === 'LOAN_PAYMENT').length}`);
    console.log(`   - Recurring inflows: ${formattedProjections.filter(p => p.type === 'RECURRING_INFLOW').length}`);
    console.log(`   - Recurring outflows: ${formattedProjections.filter(p => p.type === 'RECURRING_OUTFLOW').length}`);

    return NextResponse.json({
      success: true,
      projections: formattedProjections,
      summary,
      metadata: {
        count: formattedProjections.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        filters: {
          type: typeFilter,
          status: statusFilter
        },
        typeCounts: {
          customerReceivables: formattedProjections.filter(p => p.type === 'CUSTOMER_RECEIVABLE').length,
          supplierPayables: formattedProjections.filter(p => p.type === 'SUPPLIER_PAYABLE').length,
          bankObligations: formattedProjections.filter(p => p.type === 'BANK_OBLIGATION').length,
          loanPayments: formattedProjections.filter(p => p.type === 'LOAN_PAYMENT').length,
          recurringInflows: formattedProjections.filter(p => p.type === 'RECURRING_INFLOW').length,
          recurringOutflows: formattedProjections.filter(p => p.type === 'RECURRING_OUTFLOW').length
        }
      }
    });

  } catch (error) {
    console.error('Cashflow projections API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cashflow projections',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      startDate: startDateParam,
      endDate: endDateParam,
      recalculate = true
    } = body;
    
    // Default to next 90 days if no dates provided
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date();
    
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    console.log(`🚀 Generating cashflow projections for ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const service = new CashflowProjectionService();
    
    // Generate projections from invoices
    const projections = await service.generateProjectionsFromInvoices(startDate, endDate);
    
    // Get updated summary
    const summary = await service.generateSummary(startDate, endDate);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${projections.length} cashflow projections`,
      generated: {
        count: projections.length,
        customerReceivables: projections.filter(p => p.type === CashflowType.CUSTOMER_RECEIVABLE).length,
        supplierPayables: projections.filter(p => p.type === CashflowType.SUPPLIER_PAYABLE).length
      },
      summary,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Generate projections API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate cashflow projections',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, projectedAmount, projectionDate, confidence, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Projection ID is required' },
        { status: 400 }
      );
    }

    // Update the projection
    const updatedProjection = await prisma.cashflowProjection.update({
      where: { id: parseInt(id) },
      data: {
        ...(projectedAmount !== undefined && { projectedAmount }),
        ...(projectionDate && { projectionDate: new Date(projectionDate) }),
        ...(confidence !== undefined && { confidence }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        Invoice: {
          include: {
            Customer: { select: { name: true } },
            Supplier: { select: { name: true } }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      projection: {
        ...updatedProjection,
        projectedAmount: Number(updatedProjection.projectedAmount),
        actualAmount: updatedProjection.actualAmount ? Number(updatedProjection.actualAmount) : null
      },
      message: 'Projection updated successfully'
    });

  } catch (error) {
    console.error('Update projection API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update projection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Projection ID is required' },
        { status: 400 }
      );
    }

    // Delete the projection
    await prisma.cashflowProjection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Projection deleted successfully'
    });

  } catch (error) {
    console.error('Delete projection API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete projection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 