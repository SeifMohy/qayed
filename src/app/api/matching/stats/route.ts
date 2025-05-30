import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total invoices
    const totalInvoices = await prisma.invoice.count();

    // Get total transactions
    const totalTransactions = await prisma.transaction.count();

    // Get invoices that don't have any matches OR only have rejected/disputed matches
    const unmatchedInvoices = await prisma.invoice.count({
      where: {
        OR: [
          {
            TransactionMatch: {
              none: {}
            }
          },
          {
            TransactionMatch: {
              every: {
                status: {
                  in: ['REJECTED', 'DISPUTED']
                }
              }
            }
          }
        ]
      }
    });

    // Get transactions that don't have any matches OR only have rejected/disputed matches
    const unmatchedTransactions = await prisma.transaction.count({
      where: {
        OR: [
          {
            TransactionMatch: {
              none: {}
            }
          },
          {
            TransactionMatch: {
              every: {
                status: {
                  in: ['REJECTED', 'DISPUTED']
                }
              }
            }
          }
        ]
      }
    });

    // Get match counts by status
    const pendingMatches = await prisma.transactionMatch.count({
      where: { status: 'PENDING' }
    });

    const approvedMatches = await prisma.transactionMatch.count({
      where: { status: 'APPROVED' }
    });

    const rejectedMatches = await prisma.transactionMatch.count({
      where: { status: 'REJECTED' }
    });

    const disputedMatches = await prisma.transactionMatch.count({
      where: { status: 'DISPUTED' }
    });

    const totalMatches = await prisma.transactionMatch.count();

    // Get average match score for pending matches
    const avgMatchScore = await prisma.transactionMatch.aggregate({
      where: { status: 'PENDING' },
      _avg: { matchScore: true }
    });

    // Get high confidence matches (passed strict criteria)
    const highConfidenceMatches = await prisma.transactionMatch.count({
      where: { 
        status: 'PENDING',
        passedStrictCriteria: true 
      }
    });

    const stats = {
      totalInvoices,
      totalTransactions,
      unmatchedInvoices,
      unmatchedTransactions,
      matches: {
        total: totalMatches,
        pending: pendingMatches,
        approved: approvedMatches,
        rejected: rejectedMatches,
        disputed: disputedMatches,
        averageScore: avgMatchScore._avg.matchScore ? Number(avgMatchScore._avg.matchScore) : 0,
        highConfidence: highConfidenceMatches
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching matching stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch matching statistics'
    }, { status: 500 });
  }
} 