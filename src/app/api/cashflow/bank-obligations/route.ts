import { NextResponse } from 'next/server';
import { 
  generateAllFacilityProjections, 
  generateFacilityProjections, 
  updateFacilityProjections,
  getFacilityProjectionsSummary 
} from '@/lib/services/bankFacilityProjectionService';

/**
 * GET - Get facility projections summary or generate projections
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const facilityId = url.searchParams.get('facilityId');
    const debug = url.searchParams.get('debug') === 'true';
    
    if (action === 'cleanup-long-projections') {
      // Clean up projections that extend too far into the future (likely due to tenor parsing issues)
      const { prisma } = await import('@/lib/prisma');
      
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() + 5); // 5 years from now
      
      console.log(`🧹 Cleaning up facility projections beyond ${cutoffDate.toISOString().split('T')[0]}`);
      
      const deletedCount = await prisma.cashflowProjection.deleteMany({
        where: {
          type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] },
          projectionDate: { gt: cutoffDate }
        }
      });
      
      console.log(`🗑️ Deleted ${deletedCount.count} long-term projections`);
      
      // Regenerate all facility projections with corrected tenor parsing
      const results = await generateAllFacilityProjections();
      
      return NextResponse.json({
        success: true,
        data: {
          deletedProjections: deletedCount.count,
          regeneratedFacilities: results.length,
          facilities: results
        },
        message: `Cleaned up ${deletedCount.count} projections and regenerated for ${results.length} facilities`
      });
    }
    
    if (action === 'debug' || debug) {
      // Debug: Show all facility projections and their details
      const { prisma } = await import('@/lib/prisma');
      
      // Get all facility accounts
      const facilities = await prisma.bankStatement.findMany({
        where: {
          accountType: { not: null }
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
      console.log(`Found ${facilities.length} bank statements`);
      
      const facilityDebug = facilities.map(facility => {
        const endingBalance = parseFloat(facility.endingBalance.toString());
        const isFacility = facility.accountType && (
          facility.accountType.toLowerCase().includes('overdraft') ||
          facility.accountType.toLowerCase().includes('loan') ||
          facility.accountType.toLowerCase().includes('credit') ||
          endingBalance < 0
        );
        
        return {
          id: facility.id,
          bankName: facility.bank.name,
          accountType: facility.accountType,
          endingBalance: endingBalance,
          isFacilityAccount: isFacility,
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
          totalProjections: facilities.reduce((sum, f) => sum + f.CashflowProjection.length, 0)
        }
      });
    }
    
    if (action === 'summary') {
      // Get summary of all facility projections
      const summary = await getFacilityProjectionsSummary();
      return NextResponse.json({
        success: true,
        data: summary
      });
    }
    
    if (action === 'generate-all') {
      // Generate projections for all facilities
      const results = await generateAllFacilityProjections();
      return NextResponse.json({
        success: true,
        data: results,
        message: `Generated projections for ${results.length} facilities`
      });
    }
    
    if (facilityId) {
      // Generate projections for specific facility
      const result = await generateFacilityProjections({
        facilityId: parseInt(facilityId),
        generateForExisting: true,
        generateForNewDisbursements: true
      });
      return NextResponse.json({
        success: true,
        data: result
      });
    }
    
    // Default: return summary
    const summary = await getFacilityProjectionsSummary();
    return NextResponse.json({
      success: true,
      data: summary
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
 * POST - Generate or update facility projections
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, facilityId, generateForExisting = true, generateForNewDisbursements = true } = body;
    
    if (action === 'generate-all') {
      // Generate projections for all facilities
      const results = await generateAllFacilityProjections();
      return NextResponse.json({
        success: true,
        data: results,
        message: `Generated projections for ${results.length} facilities`
      });
    }
    
    if (action === 'update' && facilityId) {
      // Update projections for specific facility
      const result = await updateFacilityProjections(facilityId);
      return NextResponse.json({
        success: true,
        data: result,
        message: `Updated projections for facility ${facilityId}`
      });
    }
    
    if (facilityId) {
      // Generate projections for specific facility
      const result = await generateFacilityProjections({
        facilityId,
        generateForExisting,
        generateForNewDisbursements
      });
      return NextResponse.json({
        success: true,
        data: result,
        message: `Generated projections for facility ${facilityId}`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Missing required parameters'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Error generating facility projections:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate facility projections'
    }, { status: 500 });
  }
}

/**
 * DELETE - Clean up facility projections
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const facilityId = url.searchParams.get('facilityId');
    
    if (facilityId) {
      // Delete projections for specific facility
      await updateFacilityProjections(parseInt(facilityId)); // This clears and regenerates
      return NextResponse.json({
        success: true,
        message: `Cleared and regenerated projections for facility ${facilityId}`
      });
    }
    
    // Delete all facility projections
    const { prisma } = await import('@/lib/prisma');
    const deletedCount = await prisma.cashflowProjection.deleteMany({
      where: {
        type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount.count} facility projections`
    });
    
  } catch (error: any) {
    console.error('Error deleting facility projections:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete facility projections'
    }, { status: 500 });
  }
} 