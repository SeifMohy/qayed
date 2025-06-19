import { NextResponse } from 'next/server';

// --- Main API Route Handler ---
export async function POST(request: Request) {
  try {
    const { bankId } = await request.json();

    if (!bankId) {
      return NextResponse.json({
        success: false,
        error: 'Bank ID is required'
      }, { status: 400 });
    }

    console.log(`Manual classification request for bank ${bankId}`);

    // Import and use the classification service
    const { classifyBankTransactions } = await import('@/lib/services/classificationService');
    
    const result = await classifyBankTransactions(bankId);

    return NextResponse.json({
      success: result.success,
      classifiedCount: result.classifiedCount,
      totalTransactions: result.totalTransactions,
      bankStatementsProcessed: result.bankStatementsProcessed,
      errors: result.errors.length > 0 ? result.errors : undefined
    });

  } catch (error: any) {
    console.error('Error in classify-bank route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during classification'
    }, { status: 500 });
  }
} 
