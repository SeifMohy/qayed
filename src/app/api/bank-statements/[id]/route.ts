import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement ID'
      }, { status: 400 });
    }
    
    // Get the bank statement with its transactions
    const bankStatement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            transactionDate: 'desc'
          }
        }
      }
    });
    
    if (!bankStatement) {
      return NextResponse.json({
        success: false,
        error: 'Bank statement not found'
      }, { status: 404 });
    }
    
    // Remove rawTextContent unless specifically requested
    const { searchParams } = new URL(request.url);
    const includeRawText = searchParams.get('includeRawText') === 'true';
    
    if (!includeRawText) {
      const { rawTextContent, ...statementWithoutText } = bankStatement;
      return NextResponse.json({
        success: true,
        bankStatement: statementWithoutText
      });
    }
    
    return NextResponse.json({
      success: true,
      bankStatement
    });
    
  } catch (error: any) {
    console.error(`Error fetching bank statement:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while fetching the bank statement'
    }, { status: 500 });
  }
}

// DELETE handler to remove a bank statement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid bank statement ID'
      }, { status: 400 });
    }
    
    // Check if the bank statement exists
    const bankStatement = await prisma.bankStatement.findUnique({
      where: { id }
    });
    
    if (!bankStatement) {
      return NextResponse.json({
        success: false,
        error: 'Bank statement not found'
      }, { status: 404 });
    }
    
    // Delete the bank statement (transactions will be cascade deleted)
    await prisma.bankStatement.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Bank statement deleted successfully'
    });
    
  } catch (error: any) {
    console.error(`Error deleting bank statement:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred while deleting the bank statement'
    }, { status: 500 });
  }
} 