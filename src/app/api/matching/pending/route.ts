import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'PENDING';
    const sortBy = searchParams.get('sortBy') || 'matchScore';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Get pending matches with full transaction and invoice details
    const matches = await prisma.transactionMatch.findMany({
      where: {
        status: status as MatchStatus,
      },
      include: {
        Transaction: {
          include: {
            bankStatement: {
              select: {
                bankName: true,
                accountNumber: true,
                fileName: true,
              },
            },
          },
        },
        Invoice: {
          include: {
            Customer: {
              select: {
                id: true,
                name: true,
              },
            },
            Supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.transactionMatch.count({
      where: {
        status: status as MatchStatus,
      },
    });

    // Format the data for the frontend
    const formattedMatches = matches.map(match => ({
      id: match.id,
      matchScore: match.matchScore,
      matchReason: match.matchReason,
      matchType: match.matchType,
      passedStrictCriteria: match.passedStrictCriteria,
      status: match.status,
      createdAt: match.createdAt,
      transactionCategory: match.transactionCategory,
      transaction: {
        id: match.Transaction.id,
        date: match.Transaction.transactionDate,
        description: match.Transaction.description,
        creditAmount: match.Transaction.creditAmount ? Number(match.Transaction.creditAmount) : null,
        debitAmount: match.Transaction.debitAmount ? Number(match.Transaction.debitAmount) : null,
        entityName: match.Transaction.entityName,
        bankStatement: {
          bankName: match.Transaction.bankStatement.bankName,
          accountNumber: match.Transaction.bankStatement.accountNumber,
          fileName: match.Transaction.bankStatement.fileName,
        },
      },
      invoice: match.Invoice ? {
        id: match.Invoice.id,
        invoiceNumber: match.Invoice.invoiceNumber,
        date: match.Invoice.invoiceDate,
        issuerName: match.Invoice.issuerName,
        receiverName: match.Invoice.receiverName,
        total: Number(match.Invoice.total),
        currency: match.Invoice.currency,
        customer: match.Invoice.Customer,
        supplier: match.Invoice.Supplier,
      } : null,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      matches: formattedMatches,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error: any) {
    console.error('Error fetching pending matches:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pending matches',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, action, notes } = body;

    console.log('Match update request:', { matchId, action, notes, body });

    if (!matchId || !action) {
      console.error('Missing required fields:', { matchId, action });
      return NextResponse.json({
        success: false,
        error: 'Match ID and action are required',
      }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'dispute'];
    if (!validActions.includes(action)) {
      console.error('Invalid action:', action);
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be approve, reject, or dispute',
      }, { status: 400 });
    }

    // First check if the match exists
    const existingMatch = await prisma.transactionMatch.findUnique({
      where: { id: matchId },
      include: {
        Transaction: {
          select: {
            id: true,
            description: true,
          },
        },
        Invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    if (!existingMatch) {
      console.error('Match not found:', matchId);
      return NextResponse.json({
        success: false,
        error: `Match with ID ${matchId} not found`,
      }, { status: 404 });
    }

    console.log('Existing match found:', existingMatch);

    // Map action to status
    const statusMap = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      dispute: 'DISPUTED',
    } as const;

    const newStatus = statusMap[action as keyof typeof statusMap] as MatchStatus;
    console.log('Updating match status to:', newStatus);

    const updatedMatch = await prisma.transactionMatch.update({
      where: { id: matchId },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        verifiedBy: 'system', // This could be replaced with actual user info when auth is implemented
        verificationNotes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        Transaction: {
          select: {
            id: true,
            description: true,
          },
        },
        Invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    console.log('Match updated successfully:', updatedMatch);

    return NextResponse.json({
      success: true,
      message: `Match ${action}d successfully`,
      match: updatedMatch,
    });

  } catch (error: any) {
    console.error('Error updating match status:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update match status';
    if (error.code === 'P2002') {
      errorMessage = 'Constraint violation: This match may already exist or have conflicting data';
    } else if (error.code === 'P2025') {
      errorMessage = 'Match not found or has been deleted';
    } else if (error.message) {
      errorMessage = `Database error: ${error.message}`;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
} 