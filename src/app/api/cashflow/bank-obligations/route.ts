import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Debug facility information and projections
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    
    if (debug) {
      // Debug: Show all facility projections and their details
      const facilities = await prisma.bankStatement.findMany({
        where: {
          AND: [
            { endingBalance: { lt: 0 } }, // Outstanding debt
            {
              OR: [
                { accountType: { contains: 'overdraft', mode: 'insensitive' } },
                { accountType: { contains: 'loan', mode: 'insensitive' } },
                { accountType: { contains: 'credit', mode: 'insensitive' } },
                { accountType: { contains: 'facility', mode: 'insensitive' } },
                { tenor: { not: null } }
              ]
            }
          ]
        },
        include: {
          bank: true,
          CashflowProjection: {
            where: {
              type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
            },
            orderBy: { projectionDate: 'asc' }
          }
        }
      });
      
      console.log('🔍 DEBUGGING FACILITY PROJECTIONS:');
      console.log(`Found ${facilities.length} facility accounts with outstanding balances`);
      
      const facilityDebug = facilities.map(facility => {
        const endingBalance = parseFloat(facility.endingBalance.toString());
        const outstandingAmount = Math.abs(endingBalance);
        
        return {
          id: facility.id,
          bankName: facility.bank.name,
          accountType: facility.accountType,
          endingBalance: endingBalance,
          outstandingAmount: outstandingAmount,
          tenor: facility.tenor,
          availableLimit: facility.availableLimit ? parseFloat(facility.availableLimit.toString()) : null,
          interestRate: facility.interestRate,
          projectionCount: facility.CashflowProjection.length,
          projections: facility.CashflowProjection.map(p => ({
            id: p.id,
            date: p.projectionDate.toISOString().split('T')[0],
            amount: parseFloat(p.projectedAmount.toString()),
            type: p.type,
            description: p.description
          }))
        };
      });
      
      console.log('Facility Debug Results:', JSON.stringify(facilityDebug, null, 2));
      
      return NextResponse.json({
        success: true,
        debug: true,
        facilities: facilityDebug,
        summary: {
          totalFacilities: facilities.length,
          facilitiesWithProjections: facilities.filter(f => f.CashflowProjection.length > 0).length,
          totalProjections: facilities.reduce((sum, f) => sum + f.CashflowProjection.length, 0),
          totalOutstandingAmount: facilities.reduce((sum, f) => sum + Math.abs(parseFloat(f.endingBalance.toString())), 0)
        },
        message: 'Bank obligations are now managed by the centralized cashflow projection service. Use POST /api/cashflow/projections/refresh to generate projections.'
      });
    }
    
    // Default: return summary of current projections
    const projections = await prisma.cashflowProjection.findMany({
      where: {
        type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
      },
      include: {
        BankStatement: {
          include: {
            bank: true
          }
        }
      },
      orderBy: { projectionDate: 'asc' }
    });
    
    const summary = {
      totalProjections: projections.length,
      totalProjectedAmount: projections.reduce((sum, p) => sum + parseFloat(p.projectedAmount.toString()), 0),
      nextPaymentDate: projections.length > 0 ? projections[0].projectionDate : null,
      nextPaymentAmount: projections.length > 0 ? parseFloat(projections[0].projectedAmount.toString()) : 0,
      facilitiesWithProjections: new Set(projections.map(p => p.bankStatementId)).size
    };
    
    return NextResponse.json({
      success: true,
      data: summary,
      message: 'Bank obligations are managed by the centralized cashflow projection service. Use POST /api/cashflow/projections/refresh to generate projections.'
    });
    
  } catch (error: any) {
    console.error('Error handling facility projections request:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process facility projections'
    }, { status: 500 });
  }
}

/**
 * POST - Redirect to centralized service
 */
export async function POST(request: Request) {
  return NextResponse.json({
    success: false,
    error: 'Bank obligations are now managed by the centralized cashflow projection service',
    message: 'Please use POST /api/cashflow/projections/refresh to generate all projections including bank obligations'
  }, { status: 410 }); // 410 Gone - resource no longer available
}

/**
 * DELETE - Clean up bank obligation projections only
 */
export async function DELETE(request: Request) {
  try {
    const deletedCount = await prisma.cashflowProjection.deleteMany({
      where: {
        type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount.count} bank obligation projections. Use POST /api/cashflow/projections/refresh to regenerate.`
    });
    
  } catch (error: any) {
    console.error('Error deleting bank obligation projections:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete bank obligation projections'
    }, { status: 500 });
  }
} 