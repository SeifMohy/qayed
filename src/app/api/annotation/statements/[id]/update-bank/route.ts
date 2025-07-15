import { NextResponse } from 'next/server';
import { updateStatementBankAffiliation } from '@/lib/services/bankStatementConcurrencyService';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const statementId = parseInt(params.id);
    const { bankName } = await request.json();

    if (!bankName || typeof bankName !== 'string' || bankName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Bank name is required' },
        { status: 400 }
      );
    }

    // Fetch the statement and its bank to get companyId
    const statement = await prisma.bankStatement.findUnique({
      where: { id: statementId },
      include: { bank: true }
    });
    if (!statement) {
      return NextResponse.json(
        { success: false, error: 'Bank statement not found' },
        { status: 404 }
      );
    }
    const companyId = statement.bank.companyId;

    // Update the bank affiliation using only statementId, bankName, and companyId
    await updateStatementBankAffiliation(statementId, bankName.trim(), companyId);

    return NextResponse.json({
      success: true,
      message: `Bank affiliation updated to "${bankName.trim()}"`
    });

  } catch (error: any) {
    console.error('Error updating bank affiliation:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Bank statement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update bank affiliation' },
      { status: 500 }
    );
  }
} 