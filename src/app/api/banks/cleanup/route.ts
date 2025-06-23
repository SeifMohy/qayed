import { NextResponse } from 'next/server';
import { cleanupAllOrphanedBanks } from '@/lib/services/bankCleanupService';

/**
 * POST handler to cleanup all orphaned banks
 * This endpoint finds and removes all banks that have no associated bank statements
 */
export async function POST(request: Request) {
  try {
    console.log('Starting manual cleanup of orphaned banks...');
    
    const result = await cleanupAllOrphanedBanks();
    
    if (result.removedCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned banks found to clean up',
        removedCount: 0,
        removedBanks: []
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${result.removedCount} orphaned bank(s)`,
      removedCount: result.removedCount,
      removedBanks: result.removedBanks
    });
    
  } catch (error: any) {
    console.error('Error during manual bank cleanup:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cleanup orphaned banks'
    }, { status: 500 });
  }
}

/**
 * GET handler to get information about orphaned banks without deleting them
 */
export async function GET(request: Request) {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Find all banks that have no bank statements
    const orphanedBanks = await prisma.bank.findMany({
      where: {
        bankStatements: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({
      success: true,
      orphanedBanks,
      count: orphanedBanks.length
    });
    
  } catch (error: any) {
    console.error('Error fetching orphaned banks:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch orphaned banks'
    }, { status: 500 });
  }
} 