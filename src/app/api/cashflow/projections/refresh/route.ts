import { NextRequest, NextResponse } from 'next/server';
import { CentralizedCashflowProjectionService } from '@/lib/services/centralizedCashflowProjectionService';

/**
 * POST - Refresh all cashflow projections using centralized service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      startDate: startDateParam,
      endDate: endDateParam,
      forceRecalculate = true
    } = body;
    
    // Default to next 12 months if no dates provided
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date();
    
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 12 months

    console.log(`🚀 Refreshing all cashflow projections using centralized service`);
    console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    console.log(`🔄 Force recalculate: ${forceRecalculate}`);

    const service = new CentralizedCashflowProjectionService();
    
    // Refresh all projections
    const summary = await service.refreshAllProjections({
      startDate,
      endDate,
      forceRecalculate
    });

    // Get the actual projections for verification
    const projections = await service.getProjections(startDate, endDate);

    return NextResponse.json({
      success: true,
      message: `Successfully refreshed cashflow projections using centralized service`,
      summary,
      verification: {
        actualProjectionCount: projections.length,
        typeCounts: {
          customerReceivables: projections.filter(p => p.type === 'CUSTOMER_RECEIVABLE').length,
          supplierPayables: projections.filter(p => p.type === 'SUPPLIER_PAYABLE').length,
          recurringInflows: projections.filter(p => p.type === 'RECURRING_INFLOW').length,
          recurringOutflows: projections.filter(p => p.type === 'RECURRING_OUTFLOW').length,
          bankObligations: projections.filter(p => p.type === 'BANK_OBLIGATION').length,
          loanPayments: projections.filter(p => p.type === 'LOAN_PAYMENT').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Centralized projection refresh API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh cashflow projections',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET - Get status of projection refresh process
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Default to next 12 months if no dates provided
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date();
    
    const endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const service = new CentralizedCashflowProjectionService();
    const projections = await service.getProjections(startDate, endDate);

    // Count projections by source
    const sourceCounts = {
      fromInvoices: projections.filter(p => p.invoiceId !== null).length,
      fromRecurringPayments: projections.filter(p => p.recurringPaymentId !== null).length,
      fromBankObligations: projections.filter(p => p.bankStatementId !== null).length
    };

    // Count by type
    const typeCounts = {
      customerReceivables: projections.filter(p => p.type === 'CUSTOMER_RECEIVABLE').length,
      supplierPayables: projections.filter(p => p.type === 'SUPPLIER_PAYABLE').length,
      recurringInflows: projections.filter(p => p.type === 'RECURRING_INFLOW').length,
      recurringOutflows: projections.filter(p => p.type === 'RECURRING_OUTFLOW').length,
      bankObligations: projections.filter(p => p.type === 'BANK_OBLIGATION').length,
      loanPayments: projections.filter(p => p.type === 'LOAN_PAYMENT').length
    };

    return NextResponse.json({
      success: true,
      currentStatus: {
        totalProjections: projections.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        sourceCounts,
        typeCounts,
        lastUpdated: projections.length > 0 
          ? projections.reduce((latest, p) => 
              new Date(p.updatedAt) > new Date(latest) ? p.updatedAt : latest, 
              projections[0].updatedAt
            )
          : null
      }
    });

  } catch (error) {
    console.error('❌ Get projection status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get projection status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 