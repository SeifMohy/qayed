import { NextResponse } from 'next/server';
import { updateStatementAccountNumber } from '@/lib/services/bankStatementConcurrencyService';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const statementId = parseInt(params.id);
    const { accountNumber } = await request.json();

    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Account number is required' },
        { status: 400 }
      );
    }

    const result = await updateStatementAccountNumber(statementId, accountNumber.trim());

    return NextResponse.json({
      success: true,
      merged: result.merged,
      targetStatementId: result.targetStatementId,
      message: result.message,
      ...(result.merged && {
        redirectTo: `/dashboard/annotation/statements/${result.targetStatementId}`
      })
    });

  } catch (error: any) {
    console.error('Error updating account number:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Bank statement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update account number' },
      { status: 500 }
    );
  }
} 