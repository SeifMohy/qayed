import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { isFacilityAccount } from '@/utils/bankStatementUtils';

export const GET = withAuth(async (request, authContext) => {
  try {
    // Get the latest bank statement date for the company
    const latestBankStatement = await prisma.bankStatement.findFirst({
      where: {
        bank: {
          companyId: authContext.companyId
        }
      },
      orderBy: {
        statementPeriodEnd: 'desc'
      },
      select: {
        statementPeriodEnd: true,
        bankName: true,
        accountNumber: true
      }
    });

    const referenceDate = latestBankStatement?.statementPeriodEnd || new Date();
    const oneMonthAgo = new Date(referenceDate);
    oneMonthAgo.setMonth(referenceDate.getMonth() - 1);

    // Calculate the correct Total Cash On Hand for the company
    const allBankStatements = await prisma.bankStatement.findMany({
      where: {
        bank: {
          companyId: authContext.companyId
        },
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
        const isFacility = isFacilityAccount(statement.accountType, endingBalance);
        
        if (!isFacility) {
          totalCashOnHand += endingBalance; // Include negative balances from current accounts
        }
      }
    }

    // Get all transactions in the date range for the company
    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: oneMonthAgo,
          lte: referenceDate
        },
        bankStatement: {
          bank: {
            companyId: authContext.companyId
          }
        }
      },
      include: {
        bankStatement: {
          select: {
            bankName: true,
            accountNumber: true,
            accountType: true,
            endingBalance: true
          }
        }
      },
      orderBy: {
        transactionDate: 'asc'
      }
    });

    // Filter transactions to only include those from regular (non-facility) accounts
    const regularTransactions = transactions.filter(transaction => {
      if (!transaction.bankStatement) return false;
      const endingBalance = Number(transaction.bankStatement.endingBalance || 0);
      return !isFacilityAccount(transaction.bankStatement.accountType, endingBalance);
    });

    // Calculate daily positions
    const dailyPositions: { [key: string]: any } = {};
    
    // Start with the Total Cash On Hand at the beginning of the period
    // We'll work backwards from the current Total Cash On Hand
    let startingBalance = totalCashOnHand;
    
    // Calculate total net cashflow over the period to determine starting balance
    const totalNetCashflow = regularTransactions.reduce((sum, transaction) => {
      const creditAmount = Number(transaction.creditAmount || 0);
      const debitAmount = Number(transaction.debitAmount || 0);
      return sum + (creditAmount - debitAmount);
    }, 0);
    
    // Adjust starting balance: ending balance - total net cashflow = starting balance
    startingBalance = totalCashOnHand - totalNetCashflow;

    // Initialize all days in the range
    const currentDay = new Date(oneMonthAgo);
    let runningBalance = startingBalance;
    
    while (currentDay <= referenceDate) {
      const dateKey = currentDay.toISOString().split('T')[0];
      dailyPositions[dateKey] = {
        date: dateKey,
        openingBalance: runningBalance,
        totalInflows: 0,
        totalOutflows: 0,
        netCashflow: 0,
        closingBalance: runningBalance,
        transactionCount: 0
      };
      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Process transactions
    regularTransactions.forEach(transaction => {
      const transactionDate = transaction.transactionDate.toISOString().split('T')[0];
      
      if (dailyPositions[transactionDate]) {
        const creditAmount = Number(transaction.creditAmount || 0);
        const debitAmount = Number(transaction.debitAmount || 0);
        
        dailyPositions[transactionDate].totalInflows += creditAmount;
        dailyPositions[transactionDate].totalOutflows += debitAmount;
        dailyPositions[transactionDate].transactionCount += 1;
      }
    });

    // Calculate closing balances
    const sortedDates = Object.keys(dailyPositions).sort();
    let cumulativeBalance = startingBalance;

    sortedDates.forEach(date => {
      const position = dailyPositions[date];
      position.openingBalance = cumulativeBalance;
      position.netCashflow = position.totalInflows - position.totalOutflows;
      cumulativeBalance += position.netCashflow;
      position.closingBalance = cumulativeBalance;
    });

    // Ensure the final balance matches Total Cash On Hand
    if (sortedDates.length > 0) {
      const finalDate = sortedDates[sortedDates.length - 1];
      dailyPositions[finalDate].closingBalance = totalCashOnHand;
    }

    // Convert to array and format
    const formattedPositions = sortedDates.map(date => {
      const position = dailyPositions[date];
      return {
        date: position.date,
        openingBalance: Math.round(position.openingBalance * 100) / 100,
        totalInflows: Math.round(position.totalInflows * 100) / 100,
        totalOutflows: Math.round(position.totalOutflows * 100) / 100,
        netCashflow: Math.round(position.netCashflow * 100) / 100,
        closingBalance: Math.round(position.closingBalance * 100) / 100,
        transactionCount: position.transactionCount,
        isActual: true
      };
    });

    // Calculate summary statistics
    const balances = formattedPositions.map(p => p.closingBalance);
    const summary = {
      totalDays: formattedPositions.length,
      totalTransactions: regularTransactions.length,
      averageDailyBalance: balances.length > 0 ? balances.reduce((sum, b) => sum + b, 0) / balances.length : 0,
      lowestBalance: balances.length > 0 ? Math.min(...balances) : 0,
      highestBalance: balances.length > 0 ? Math.max(...balances) : 0,
      totalInflows: formattedPositions.reduce((sum, p) => sum + p.totalInflows, 0),
      totalOutflows: formattedPositions.reduce((sum, p) => sum + p.totalOutflows, 0),
      netCashflow: formattedPositions.reduce((sum, p) => sum + p.netCashflow, 0),
      startingBalance: startingBalance,
      endingBalance: totalCashOnHand,
      lowestBalanceDate: '',
      highestBalanceDate: ''
    };

    // Find dates for lowest and highest balances
    if (balances.length > 0) {
      const lowestPosition = formattedPositions.find(p => p.closingBalance === summary.lowestBalance);
      const highestPosition = formattedPositions.find(p => p.closingBalance === summary.highestBalance);
      
      summary.lowestBalanceDate = lowestPosition?.date || '';
      summary.highestBalanceDate = highestPosition?.date || '';
    }

    console.log(`📊 Historical Cashflow (company ${authContext.companyId}) calculated:`);
    console.log(`   - Total transactions: ${regularTransactions.length}`);
    console.log(`   - Starting balance: ${startingBalance.toLocaleString()}`);
    console.log(`   - Ending balance: ${totalCashOnHand.toLocaleString()}`);
    console.log(`   - Net cashflow: ${summary.netCashflow.toLocaleString()}`);

    return NextResponse.json({
      success: true,
      positions: formattedPositions,
      summary: {
        ...summary,
        averageDailyBalance: Math.round(summary.averageDailyBalance * 100) / 100,
        totalInflows: Math.round(summary.totalInflows * 100) / 100,
        totalOutflows: Math.round(summary.totalOutflows * 100) / 100,
        netCashflow: Math.round(summary.netCashflow * 100) / 100
      },
      metadata: {
        companyId: authContext.companyId,
        referenceDate: referenceDate.toISOString(),
        referenceDateFormatted: referenceDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dateRange: {
          start: oneMonthAgo.toISOString(),
          end: referenceDate.toISOString()
        },
        bankName: latestBankStatement?.bankName || 'Multiple Banks',
        accountNumber: 'Combined Accounts',
        dataType: 'historical',
        basedOnTransactions: true,
        totalCashOnHand: totalCashOnHand,
        note: 'Historical data calculated from all regular account transactions, ending with current Total Cash On Hand'
      }
    });

  } catch (error) {
    console.error('Historical cashflow API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch historical cashflow data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}); 