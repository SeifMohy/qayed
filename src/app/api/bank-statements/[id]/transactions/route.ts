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
        transactionDate: 'desc'
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