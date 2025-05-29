import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total invoices
    const totalInvoices = await prisma.invoice.count();

    // Get total transactions
    const totalTransactions = await prisma.transaction.count();

    // Get invoices that don't have any matches
    const unmatchedInvoices = await prisma.invoice.count({
      where: {
        TransactionMatch: {
          none: {}
        }
      }
    });

    // Get transactions that don't have any matches
    const unmatchedTransactions = await prisma.transaction.count({
      where: {
        TransactionMatch: {
          none: {}
        }
      }
    });

    const stats = {
      totalInvoices,
      totalTransactions,
      unmatchedInvoices,
      unmatchedTransactions
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