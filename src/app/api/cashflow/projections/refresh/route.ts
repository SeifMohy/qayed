import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { CentralizedCashflowProjectionService } from '@/lib/services/centralizedCashflowProjectionService';

/**
 * POST - Refresh all cashflow projections using centralized service
 */
export const POST = withAuth(async (request: NextRequest, authContext) => {
  try {
    const { companyAccessService } = authContext;
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

    console.log(`🚀 Refreshing all cashflow projections using centralized service for company ${authContext.companyId}`);
    console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    console.log(`🔄 Force recalculate: ${forceRecalculate}`);

    const service = new CentralizedCashflowProjectionService();
    
    // TODO: Pass company ID to centralized service when it supports it
    // For now, refresh all projections and let the service handle company filtering
    const summary = await service.refreshAllProjections({
      startDate,
      endDate,
      forceRecalculate
    });

    // Get the company-scoped projections for verification
    const projections = await companyAccessService.getCashflowProjections();
    const projectionCount = projections.length;

    return NextResponse.json({
      success: true,
      message: `Successfully refreshed cashflow projections using centralized service for company ${authContext.companyId}`,
      summary,
      companyId: authContext.companyId,
      verification: {
        actualProjectionCount: projectionCount,
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
});

/**
 * GET - Get status of projection refresh process
 */
export const GET = withAuth(async (request: NextRequest, authContext) => {
  try {
    const { companyAccessService } = authContext;
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

    // Get company-scoped projections
    const allProjections = await companyAccessService.getCashflowProjections();
    
    // Filter by date range
    const projections = allProjections.filter(p => {
      const projectionDate = new Date(p.projectionDate);
      return projectionDate >= startDate && projectionDate <= endDate;
    });

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
        companyId: authContext.companyId,
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
}); 