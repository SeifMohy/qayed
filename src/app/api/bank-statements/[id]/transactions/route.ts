import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bankStatementId = parseInt(params.id, 10);

    if (isNaN(bankStatementId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement ID'
      }, { status: 400 });
    }

    // Get transactions for the bank statement
    const transactions = await prisma.transaction.findMany({
      where: {
        bankStatementId: bankStatementId
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while fetching transactions'
    }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bankStatementId = parseInt(params.id, 10);

    if (isNaN(bankStatementId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      transactionDate,
      creditAmount,
      debitAmount,
      description,
      balance,
      pageNumber,
      entityName 
    } = body;

    // Validate required fields
    if (!transactionDate) {
      return NextResponse.json({
        success: false,
        error: 'Transaction date is required'
      }, { status: 400 });
    }

    // Validate amounts
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

    // Verify bank statement exists
    const bankStatement = await prisma.bankStatement.findUnique({
      where: { id: bankStatementId }
    });

    if (!bankStatement) {
      return NextResponse.json({
        success: false,
        error: 'Bank statement not found'
      }, { status: 404 });
    }

    // Create the new transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        bankStatementId,
        transactionDate: new Date(transactionDate),
        creditAmount: creditAmount !== null && creditAmount !== undefined ? parseFloat(creditAmount) : null,
        debitAmount: debitAmount !== null && debitAmount !== undefined ? parseFloat(debitAmount) : null,
        description: description || null,
        balance: balance !== null && balance !== undefined ? parseFloat(balance) : null,
        pageNumber: pageNumber || null,
        entityName: entityName || null,
        currency: bankStatement.accountCurrency || null // Inherit currency from bank statement
      }
    });

    // Trigger automatic classification for the bank statement after adding new transaction
    try {
      console.log(`Triggering automatic re-classification for bank statement ${bankStatementId} after adding new transaction`);
      
      // Import the classification service
      const { classifyBankStatementTransactions } = await import('@/lib/services/classificationService');
      
      // Trigger classification asynchronously (don't wait for it to complete)
      classifyBankStatementTransactions(bankStatementId)
          .then((result) => {
              console.log(`Re-classification completed for statement ${bankStatementId}: ${result.classifiedCount}/${result.totalTransactions} transactions classified`);
          })
          .catch((error) => {
              console.error(`Re-classification failed for statement ${bankStatementId}:`, error);
          });
    } catch (error) {
      console.error(`Failed to trigger re-classification for statement ${bankStatementId}:`, error);
      // Don't fail the main request if classification trigger fails
    }

    return NextResponse.json({
      success: true,
      data: newTransaction,
      classificationTriggered: true
    });

  } catch (error: any) {
    console.error('Error creating transaction:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while creating transaction'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bankStatementId = parseInt(params.id, 10);

    if (isNaN(bankStatementId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId || isNaN(parseInt(transactionId))) {
      return NextResponse.json({
        success: false,
        error: 'Valid transaction ID is required'
      }, { status: 400 });
    }

    // Verify the transaction belongs to this bank statement
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(transactionId),
        bankStatementId: bankStatementId
      }
    });

    if (!existingTransaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found or does not belong to this bank statement'
      }, { status: 404 });
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: parseInt(transactionId) }
    });

    // Trigger automatic re-classification for the bank statement after removing transaction
    try {
      console.log(`Triggering automatic re-classification for bank statement ${bankStatementId} after removing transaction`);
      
      // Import the classification service
      const { classifyBankStatementTransactions } = await import('@/lib/services/classificationService');
      
      // Trigger classification asynchronously (don't wait for it to complete)
      classifyBankStatementTransactions(bankStatementId)
          .then((result) => {
              console.log(`Re-classification completed for statement ${bankStatementId}: ${result.classifiedCount}/${result.totalTransactions} transactions classified`);
          })
          .catch((error) => {
              console.error(`Re-classification failed for statement ${bankStatementId}:`, error);
          });
    } catch (error) {
      console.error(`Failed to trigger re-classification for statement ${bankStatementId}:`, error);
      // Don't fail the main request if classification trigger fails
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      classificationTriggered: true
    });

  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while deleting transaction'
    }, { status: 500 });
  }
} 