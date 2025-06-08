import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isFacilityAccount } from '@/utils/bankStatementUtils';

export async function GET() {
  try {
    // Get the latest bank statement (remove strict validation filters)
    const latestBankStatement = await prisma.bankStatement.findFirst({
      orderBy: {
        statementPeriodEnd: 'desc'
      },
      select: {
        endingBalance: true,
        statementPeriodEnd: true,
        bankName: true,
        accountNumber: true,
        locked: true,
        validated: true
      }
    });

    if (!latestBankStatement) {
      return NextResponse.json({
        success: true,
        stats: [
          {
            title: 'Total Cash On Hand',
            value: 0,
            change: 0,
            changeType: 'neutral' as const,
            icon: 'CurrencyDollarIcon',
            iconColor: 'bg-green-500',
            dataSource: 'bankStatements'
          },
          {
            title: 'Outstanding Payables (30 days)',
            value: 0,
            change: 0,
            changeType: 'neutral' as const,
            icon: 'BanknotesIcon',
            iconColor: 'bg-red-500',
            interpretation: 'positive' as const,
            dataSource: 'accountsPayable'
          },
          {
            title: 'Outstanding Receivables (30 days)',
            value: 0,
            change: 0,
            changeType: 'neutral' as const,
            icon: 'CreditCardIcon',
            iconColor: 'bg-blue-500',
            dataSource: 'accountsReceivable'
          },
          {
            title: 'Outstanding Bank Payments (30 days)',
            value: 0,
            change: 0,
            changeType: 'neutral' as const,
            icon: 'ArrowTrendingUpIcon',
            iconColor: 'bg-purple-500',
            interpretation: 'negative' as const,
            dataSource: 'bankPosition'
          },
        ],
        metadata: {
          referenceDate: new Date().toISOString(),
          referenceDateFormatted: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bankName: 'No Bank Data',
          accountNumber: '',
          cashBalanceDate: new Date().toISOString(),
          period: '30 days',
          note: 'No bank statement data available'
        }
      });
    }
    
    // Use bank statement date as reference instead of today
    const referenceDate = latestBankStatement.statementPeriodEnd || new Date();
    const thirtyDaysAgo = new Date(referenceDate);
    thirtyDaysAgo.setDate(referenceDate.getDate() - 30);
    const thirtyDaysFromReference = new Date(referenceDate);
    thirtyDaysFromReference.setDate(referenceDate.getDate() + 30);

    // Calculate Total Cash On Hand using the same logic as banks page
    // Only count regular accounts (non-facility) with positive balances
    // Get all bank statements and process each account separately
    const allBankStatements = await prisma.bankStatement.findMany({
      where: {
        statementPeriodEnd: {
          lte: referenceDate
        }
      },
      orderBy: [
        { bankId: 'asc' },
        { accountNumber: 'asc' },
        { statementPeriodEnd: 'desc' }
      ],
      include: {
        bank: {
          select: {
            name: true
          }
        }
      }
    });

    // Group by account to get latest statement for each account
    const accountMap = new Map();
    for (const statement of allBankStatements) {
      const accountKey = `${statement.bankId}-${statement.accountNumber}`;
      if (!accountMap.has(accountKey)) {
        accountMap.set(accountKey, statement);
      }
    }

    let totalCashOnHand = 0;
    for (const statement of accountMap.values()) {
      if (statement.endingBalance) {
        const endingBalance = Number(statement.endingBalance);
        
        // Use the same logic as banks page: only count regular accounts with positive balances
        const isFacility = isFacilityAccount(statement.accountType, endingBalance);
        
        if (!isFacility && endingBalance > 0) {
          totalCashOnHand += endingBalance;
        }
      }
    }

    // 2. Outstanding Payables (30 days) - supplier invoices not paid within 30 days from reference date
    const outstandingPayables = await prisma.invoice.aggregate({
      where: {
        supplierId: { not: null },
        invoiceDate: {
          gte: thirtyDaysAgo,
          lte: referenceDate
        },
        TransactionMatch: {
          none: {
            status: 'APPROVED'
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // 3. Outstanding Receivables (30 days) - customer invoices not received within 30 days from reference date
    const outstandingReceivables = await prisma.invoice.aggregate({
      where: {
        customerId: { not: null },
        invoiceDate: {
          gte: thirtyDaysAgo,
          lte: referenceDate
        },
        TransactionMatch: {
          none: {
            status: 'APPROVED'
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // 4. Outstanding Bank Payments (30 days) - bank obligations in next 30 days from reference date
    const outstandingBankPayments = await prisma.cashflowProjection.aggregate({
      where: {
        type: {
          in: ['BANK_OBLIGATION', 'LOAN_PAYMENT']
        },
        status: 'PROJECTED',
        projectionDate: {
          gte: referenceDate,
          lte: thirtyDaysFromReference
        }
      },
      _sum: {
        projectedAmount: true
      }
    });

    // Calculate previous period values for change percentages (using bank statement date as reference)
    const prevThirtyDaysAgo = new Date(referenceDate);
    prevThirtyDaysAgo.setDate(referenceDate.getDate() - 60);
    const prevReferenceDate = new Date(referenceDate);
    prevReferenceDate.setDate(referenceDate.getDate() - 30);

    // Previous period payables
    const prevOutstandingPayables = await prisma.invoice.aggregate({
      where: {
        supplierId: { not: null },
        invoiceDate: {
          gte: prevThirtyDaysAgo,
          lte: prevReferenceDate
        },
        TransactionMatch: {
          none: {
            status: 'APPROVED'
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // Previous period receivables
    const prevOutstandingReceivables = await prisma.invoice.aggregate({
      where: {
        customerId: { not: null },
        invoiceDate: {
          gte: prevThirtyDaysAgo,
          lte: prevReferenceDate
        },
        TransactionMatch: {
          none: {
            status: 'APPROVED'
          }
        }
      },
      _sum: {
        total: true
      }
    });

    // Previous period bank payments
    const prevThirtyDaysFromThen = new Date(prevReferenceDate);
    prevThirtyDaysFromThen.setDate(prevReferenceDate.getDate() + 30);
    
    const prevOutstandingBankPayments = await prisma.cashflowProjection.aggregate({
      where: {
        type: {
          in: ['BANK_OBLIGATION', 'LOAN_PAYMENT']
        },
        status: 'PROJECTED',
        projectionDate: {
          gte: prevReferenceDate,
          lte: prevThirtyDaysFromThen
        }
      },
      _sum: {
        projectedAmount: true
      }
    });

    // Calculate change percentages
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const payablesAmount = Number(outstandingPayables._sum.total || 0);
    const prevPayablesAmount = Number(prevOutstandingPayables._sum.total || 0);
    const receivablesAmount = Number(outstandingReceivables._sum.total || 0);
    const prevReceivablesAmount = Number(prevOutstandingReceivables._sum.total || 0);
    const bankPaymentsAmount = Math.abs(Number(outstandingBankPayments._sum.projectedAmount || 0));
    const prevBankPaymentsAmount = Math.abs(Number(prevOutstandingBankPayments._sum.projectedAmount || 0));

    const getChangeType = (current: number, previous: number): 'increase' | 'decrease' | 'neutral' => {
      if (current > previous) return 'increase';
      if (current < previous) return 'decrease';
      return 'neutral';
    };

    const stats = [
      {
        title: 'Total Cash On Hand',
        value: Number(totalCashOnHand),
        change: 0, // We don't have historical cash data for comparison
        changeType: 'neutral' as const,
        icon: 'CurrencyDollarIcon',
        iconColor: 'bg-green-500',
        dataSource: 'bankStatements'
      },
      {
        title: 'Outstanding Payables (30 days)',
        value: payablesAmount,
        change: calculateChange(payablesAmount, prevPayablesAmount),
        changeType: getChangeType(prevPayablesAmount, payablesAmount), // Reversed for payables (lower is better)
        icon: 'BanknotesIcon',
        iconColor: 'bg-red-500',
        interpretation: 'positive' as const, // Lower payables is better
        dataSource: 'accountsPayable'
      },
      {
        title: 'Outstanding Receivables (30 days)',
        value: receivablesAmount,
        change: calculateChange(receivablesAmount, prevReceivablesAmount),
        changeType: getChangeType(receivablesAmount, prevReceivablesAmount),
        icon: 'CreditCardIcon',
        iconColor: 'bg-blue-500',
        dataSource: 'accountsReceivable'
      },
      {
        title: 'Outstanding Bank Payments (30 days)',
        value: bankPaymentsAmount,
        change: calculateChange(bankPaymentsAmount, prevBankPaymentsAmount),
        changeType: getChangeType(bankPaymentsAmount, prevBankPaymentsAmount),
        icon: 'ArrowTrendingUpIcon',
        iconColor: 'bg-purple-500',
        interpretation: 'negative' as const, // Higher bank payments is worse
        dataSource: 'bankPosition'
      },
    ];

    return NextResponse.json({
      success: true,
      stats,
      metadata: {
        referenceDate: referenceDate.toISOString(),
        referenceDateFormatted: referenceDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        bankName: latestBankStatement.bankName || 'Unknown Bank',
        accountNumber: latestBankStatement.accountNumber || '',
        cashBalanceDate: referenceDate.toISOString(),
        period: '30 days',
        note: 'All calculations are based on the latest bank statement date',
        dataStatus: {
          hasValidatedData: latestBankStatement.validated || false,
          hasLockedData: latestBankStatement.locked || false,
          dataSource: 'validated'
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 