import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { CashflowProjectionService } from '@/lib/services/cashflowProjectionService';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (request: NextRequest, authContext) => {
  try {
    const { companyAccessService } = authContext;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const range = searchParams.get('range') || '30d';
    const customEndDateParam = searchParams.get('customEndDate');
    
    // Default to latest bank statement date if no date provided  
    let startDate: Date;
    if (dateParam) {
      startDate = new Date(dateParam);
    } else {
      // Get the latest bank statement date for the company
      try {
        const latestStatement = await prisma.bankStatement.findFirst({
          where: {
            bank: {
              companyId: authContext.companyId
            }
          },
          orderBy: { statementPeriodEnd: 'desc' }
        });
        
        if (latestStatement && latestStatement.statementPeriodEnd) {
          // Use the day after the latest bank statement as the starting point
          const latestDate = new Date(latestStatement.statementPeriodEnd);
          startDate = new Date(latestDate);
          startDate.setDate(latestDate.getDate() + 1);
          console.log(`📅 Position API (company ${authContext.companyId}): Using latest bank statement date: ${latestDate.toISOString().split('T')[0]}, projections start from: ${startDate.toISOString().split('T')[0]}`);
        } else {
          // Fallback to today if no bank statements found
          startDate = new Date();
          console.warn(`⚠️ Position API: No bank statements found for company ${authContext.companyId}, using today as fallback starting date`);
        }
      } catch (error) {
        console.error('❌ Position API: Error getting latest bank statement date:', error);
        startDate = new Date(); // Fallback to today
      }
    }
    
    // Calculate end date based on range
    let endDate = new Date(startDate);
    switch (range) {
      case '30d':
        endDate.setDate(endDate.getDate() + 30);
        break;
      case '90d':
        endDate.setDate(endDate.getDate() + 90);
        break;
      case '1y':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'custom':
        if (customEndDateParam) {
          endDate = new Date(customEndDateParam);
        } else {
          endDate.setDate(endDate.getDate() + 30); // Default fallback
        }
        break;
      default:
        endDate.setDate(endDate.getDate() + 30);
    }

    console.log(`📊 Calculating cash position for company ${authContext.companyId} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const service = new CashflowProjectionService();
    
    // TODO: Update CashflowProjectionService to accept company ID for filtering
    // For now, get company-scoped projections directly
    const projections = await companyAccessService.getCashflowProjections();
    
    // Get daily cash positions
    const result = await service.calculateCashPosition(startDate, endDate);
    const positions = result.positions;
    const cashMetadata = result.metadata;
    
    console.log(`💰 Cash position calculation completed for company ${authContext.companyId}:`);
    console.log(`   - Starting balance: ${cashMetadata.startingBalance.toLocaleString()}`);
    console.log(`   - Latest balance date: ${cashMetadata.latestBalanceDate}`);
    console.log(`   - Effective start date: ${cashMetadata.effectiveStartDate}`);
    console.log(`   - Generated ${positions.length} daily positions`);
    
    // Calculate summary statistics
    const balances = positions.map(p => p.closingBalance);
    const summary = {
      averageDailyBalance: balances.length > 0 ? balances.reduce((sum, b) => sum + b, 0) / balances.length : 0,
      lowestProjectedBalance: balances.length > 0 ? Math.min(...balances) : 0,
      lowestBalanceDate: '',
      highestProjectedBalance: balances.length > 0 ? Math.max(...balances) : 0,
      highestBalanceDate: '',
      cashPositiveDays: positions.filter(p => p.closingBalance > 0).length,
      cashNegativeDays: positions.filter(p => p.closingBalance < 0).length,
      totalDays: positions.length,
      startingBalance: cashMetadata.startingBalance,
      latestBalanceDate: cashMetadata.latestBalanceDate,
      effectiveStartDate: cashMetadata.effectiveStartDate
    };

    // Find dates for lowest and highest balances
    if (balances.length > 0) {
      const lowestPosition = positions.find(p => p.closingBalance === summary.lowestProjectedBalance);
      const highestPosition = positions.find(p => p.closingBalance === summary.highestProjectedBalance);
      
      summary.lowestBalanceDate = lowestPosition?.date || '';
      summary.highestBalanceDate = highestPosition?.date || '';
    }

    // Generate alerts
    const alerts = [];
    
    // Check for negative balances
    const negativeDays = positions.filter(p => p.closingBalance < 0);
    if (negativeDays.length > 0) {
      alerts.push({
        id: 'negative-balance-alert',
        type: 'negative_balance',
        severity: negativeDays.length > 5 ? 'critical' : 'high',
        title: 'Negative Cash Balance Projected',
        description: `${negativeDays.length} day${negativeDays.length > 1 ? 's' : ''} with negative cash balance projected`,
        date: negativeDays[0].date,
        amount: negativeDays[0].closingBalance,
        actionRequired: true
      });
    }

    // Check for large outflows
    const largeOutflows = positions.filter(p => p.totalOutflows > 50000);
    if (largeOutflows.length > 0) {
      alerts.push({
        id: 'large-outflow-alert',
        type: 'large_outflow',
        severity: 'medium',
        title: 'Large Outflows Projected',
        description: `${largeOutflows.length} day${largeOutflows.length > 1 ? 's' : ''} with outflows over $50,000`,
        date: largeOutflows[0].date,
        amount: largeOutflows[0].totalOutflows,
        actionRequired: false
      });
    }

    // Check for low confidence projections
    const lowConfidencePositions = positions.filter(p => p.averageConfidence < 0.6);
    if (lowConfidencePositions.length > 0) {
      alerts.push({
        id: 'low-confidence-alert',
        type: 'low_confidence',
        severity: 'low',
        title: 'Low Confidence Projections',
        description: `${lowConfidencePositions.length} day${lowConfidencePositions.length > 1 ? 's' : ''} with low confidence projections`,
        date: lowConfidencePositions[0].date,
        actionRequired: false
      });
    }

    return NextResponse.json({
      success: true,
      currentDate: startDate.toISOString(),
      positions: positions.map(p => ({
        date: p.date,
        openingBalance: Math.round(p.openingBalance * 100) / 100,
        totalInflows: Math.round(p.totalInflows * 100) / 100,
        totalOutflows: Math.round(p.totalOutflows * 100) / 100,
        netCashflow: Math.round(p.netCashflow * 100) / 100,
        closingBalance: Math.round(p.closingBalance * 100) / 100,
        projectionCount: p.projectionCount,
        averageConfidence: Math.round(p.averageConfidence * 100) / 100
      })),
      summary: {
        ...summary,
        averageDailyBalance: Math.round(summary.averageDailyBalance * 100) / 100,
        lowestProjectedBalance: Math.round(summary.lowestProjectedBalance * 100) / 100,
        highestProjectedBalance: Math.round(summary.highestProjectedBalance * 100) / 100
      },
      alerts,
      metadata: {
        companyId: authContext.companyId,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        range,
        totalProjections: positions.reduce((sum, p) => sum + p.projectionCount, 0)
      }
    });

  } catch (error) {
    console.error('Cash position API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate cash position',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}); 