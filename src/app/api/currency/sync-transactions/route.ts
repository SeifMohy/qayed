import { NextRequest, NextResponse } from 'next/server';
import { TransactionCurrencyService } from '@/lib/services/transactionCurrencyService';

export async function GET(request: NextRequest) {
  try {
    const stats = await TransactionCurrencyService.getCurrencyStatistics();

    return NextResponse.json({
      success: true,
      message: 'Currency statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('❌ Error retrieving currency statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve currency statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = true } = body; // Default to force sync

    let stats;
    if (force) {
      console.log('🚀 Running FORCE currency sync (all transactions)');
      stats = await TransactionCurrencyService.syncTransactionCurrencies();
    } else {
      console.log('🚀 Running gentle currency sync (missing currencies only)');
      stats = await TransactionCurrencyService.syncMissingTransactionCurrencies();
    }

    return NextResponse.json({
      success: true,
      message: `Transaction currency sync completed successfully (${force ? 'FORCE' : 'gentle'} mode)`,
      mode: force ? 'force' : 'gentle',
      stats
    });

  } catch (error) {
    console.error('❌ Error syncing transaction currencies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync transaction currencies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 