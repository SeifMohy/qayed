import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    const bankStatementId = parseInt(params.id, 10);
    const transactionId = parseInt(params.transactionId, 10);

    if (isNaN(bankStatementId) || isNaN(transactionId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement or transaction ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { creditAmount, debitAmount } = body;

    // Validate the input
    if (creditAmount !== null && creditAmount !== undefined && (isNaN(parseFloat(creditAmount)) || parseFloat(creditAmount) < 0)) {
      return NextResponse.json({
        success: false,
        error: 'Credit amount must be a valid positive number or null'
      }, { status: 400 });
    }

    if (debitAmount !== null && debitAmount !== undefined && (isNaN(parseFloat(debitAmount)) || parseFloat(debitAmount) < 0)) {
      return NextResponse.json({
        success: false,
        error: 'Debit amount must be a valid positive number or null'
      }, { status: 400 });
    }

    // Ensure transaction belongs to the specified bank statement
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        bankStatementId: bankStatementId
      }
    });

    if (!existingTransaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found or does not belong to this bank statement'
      }, { status: 404 });
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        creditAmount: creditAmount !== null && creditAmount !== undefined ? parseFloat(creditAmount) : null,
        debitAmount: debitAmount !== null && debitAmount !== undefined ? parseFloat(debitAmount) : null,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTransaction
    });

  } catch (error: any) {
    console.error('Error updating transaction:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while updating transaction'
    }, { status: 500 });
  }
} 