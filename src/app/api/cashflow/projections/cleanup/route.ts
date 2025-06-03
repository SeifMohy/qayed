import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Starting cleanup of orphaned projections...');
    
    // First, find all orphaned projections (those with null recurringPaymentId but are recurring types)
    const orphanedProjections = await prisma.cashflowProjection.findMany({
      where: {
        OR: [
          {
            recurringPaymentId: null,
            type: 'RECURRING_INFLOW'
          },
          {
            recurringPaymentId: null,
            type: 'RECURRING_OUTFLOW'
          },
          {
            // Also clean up specific problematic descriptions
            description: {
              contains: 'Salary - monthly recurring'
            },
            recurringPaymentId: null
          },
          {
            description: {
              contains: 'Rent Income - monthly recurring'
            },
            recurringPaymentId: null
          },
          {
            description: {
              contains: 'Monthly Office Rent - monthly recurring'
            },
            recurringPaymentId: null
          }
        ]
      },
      select: {
        id: true,
        projectionDate: true,
        projectedAmount: true,
        description: true
      }
    });

    console.log(`📊 Found ${orphanedProjections.length} orphaned projections to delete`);

    if (orphanedProjections.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned projections found',
        deletedCount: 0
      });
    }

    // Log what we're about to delete
    orphanedProjections.forEach(proj => {
      console.log(`  - ID ${proj.id}: ${proj.projectionDate.toISOString().split('T')[0]} - ${proj.projectedAmount} - ${proj.description}`);
    });

    // Delete all orphaned projections
    const result = await prisma.cashflowProjection.deleteMany({
      where: {
        id: {
          in: orphanedProjections.map(p => p.id)
        }
      }
    });

    console.log(`✅ Successfully deleted ${result.count} orphaned projections`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} orphaned projections`,
      deletedCount: result.count,
      deletedProjections: orphanedProjections
    });

  } catch (error) {
    console.error('❌ Error cleaning up orphaned projections:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup orphaned projections',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 