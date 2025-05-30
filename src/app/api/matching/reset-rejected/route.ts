import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Reset all rejected matches to pending for testing
    const updatedMatches = await prisma.transactionMatch.updateMany({
      where: {
        status: 'REJECTED'
      },
      data: {
        status: 'PENDING',
        verifiedAt: null,
        verifiedBy: null,
        verificationNotes: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Reset ${updatedMatches.count} rejected matches back to pending`,
      resetCount: updatedMatches.count
    });

  } catch (error: any) {
    console.error('Error resetting rejected matches:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset rejected matches'
    }, { status: 500 });
  }
} 