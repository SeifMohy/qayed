import { NextRequest, NextResponse } from 'next/server';
import { CentralizedCashflowProjectionService } from '@/lib/services/centralizedCashflowProjectionService';
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

    console.log('📊 Fetching projections using centralized service');
    
    // Use the centralized service
    const centralizedService = new CentralizedCashflowProjectionService();
    
    const projections = await centralizedService.getProjections(startDate, endDate, {
      types: typeFilter,
      statuses: statusFilter
    });

    // Generate summary using the old service for compatibility
    const oldService = new CashflowProjectionService();
    const summary = await oldService.generateSummary(startDate, endDate);
    
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
          endingBalance: p.BankStatement.endingBalance ? Number(p.BankStatement.endingBalance) : null,
          bank: p.BankStatement.bank
        } : null
      })
    }));

    console.log(`📊 Cashflow projections summary (centralized service):`);
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
        usedCentralizedService: true,
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
    console.log(`🔄 Using centralized service`);

    // Use the centralized service
    const centralizedService = new CentralizedCashflowProjectionService();
    
    const summary = await centralizedService.refreshAllProjections({
      startDate,
      endDate,
      forceRecalculate: recalculate
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated cashflow projections using centralized service`,
      generated: summary,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      usedCentralizedService: true
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
        ...(status && { status })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProjection,
        projectedAmount: Number(updatedProjection.projectedAmount),
        actualAmount: updatedProjection.actualAmount ? Number(updatedProjection.actualAmount) : null
      }
    });

  } catch (error) {
    console.error('Update projection API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update cashflow projection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Projection ID is required' },
        { status: 400 }
      );
    }

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
        error: 'Failed to delete cashflow projection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 