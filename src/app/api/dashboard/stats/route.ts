import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isFacilityAccount } from '@/utils/bankStatementUtils';
import { currencyCache } from '@/lib/services/currencyCache';

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
    const banks = await prisma.bank.findMany({
      include: {
        bankStatements: {
          where: {
            statementPeriodEnd: {
              lte: referenceDate
            }
          },
          orderBy: {
            statementPeriodEnd: 'desc'
          }
        }
      }
    });

    // First, collect all unique currencies from bank statements for preloading
    const uniqueCurrencies = new Set<string>();
    for (const bank of banks) {
      for (const statement of bank.bankStatements) {
        const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
        uniqueCurrencies.add(statementCurrency);
      }
    }

    // Preload all currency rates in one API call (same as banks page)
    const currencyList = Array.from(uniqueCurrencies).filter(currency => currency !== 'EGP');
    if (currencyList.length > 0) {
      console.log('🔄 Dashboard Stats - Preloading currency rates for:', currencyList);
      await currencyCache.preloadRates(currencyList);
    }

    let totalCashOnHand = 0;
    let totalBankObligations = 0;

    // Process each bank using the same logic as banks page
    for (const bank of banks) {
      // Group bank statements by account number to get latest statement for each account
      const accountGroups = bank.bankStatements.reduce((groups: { [key: string]: any[] }, statement: any) => {
        const accountNumber = statement.accountNumber;
        if (!groups[accountNumber]) {
          groups[accountNumber] = [];
        }
        groups[accountNumber].push(statement);
        return groups;
      }, {});
      
      // Process latest statement for each unique account
      for (const [accountNumber, statements] of Object.entries(accountGroups)) {
        // Get the statement with the latest end date for this account
        const latestStatement = (statements as any[]).reduce((latest: any, current: any) => {
          return new Date(current.statementPeriodEnd) > new Date(latest.statementPeriodEnd) 
            ? current 
            : latest;
        });
        
        const endingBalance = parseFloat(latestStatement.endingBalance?.toString() || '0');
        const statementCurrency = latestStatement.accountCurrency?.trim() || 'EGP';
        
        // Convert amount to EGP if needed using cached rates (same as banks page)
        let balanceInEGP = endingBalance;
        if (statementCurrency !== 'EGP' && endingBalance !== 0) {
          try {
            const conversion = await currencyCache.convertCurrency(
              Math.abs(endingBalance),
              statementCurrency,
              'EGP'
            );
            
            balanceInEGP = endingBalance < 0 ? -conversion.convertedAmount : conversion.convertedAmount;
            console.log(`💱 Dashboard Stats - Converted ${endingBalance} ${statementCurrency} to ${balanceInEGP} EGP for ${bank.name} (cached)`);
          } catch (error) {
            console.error('Dashboard Stats - Currency conversion error:', error);
            // Fallback to default rate
            const defaultRate = statementCurrency === 'USD' ? 50 : 1;
            balanceInEGP = endingBalance * defaultRate;
            console.log(`❌ Dashboard Stats - Conversion failed, using default rate: ${endingBalance} × ${defaultRate} = ${balanceInEGP} EGP`);
          }
        }
        
        // Determine if this is a facility account using the same logic as banks page
        const isFacility = isFacilityAccount(latestStatement.accountType, endingBalance);
        
        if (isFacility) {
          // Facility account - contributes to bank obligations
          const facilityAmountEGP = Math.abs(balanceInEGP);
          totalBankObligations += facilityAmountEGP;
        } else {
          // Regular account - both positive and negative balances contribute to cash position
          totalCashOnHand += balanceInEGP; // This can be negative for current accounts
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

    // 4. Outstanding Bank Payments - using actual facility account balances like banks page
    // (totalBankObligations is already calculated above)

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

    // Previous period bank payments - using 0 since we don't have historical facility data
    const prevOutstandingBankPayments = { _sum: { projectedAmount: 0 } };

    // Calculate change percentages
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const payablesAmount = Number(outstandingPayables._sum.total || 0);
    const prevPayablesAmount = Number(prevOutstandingPayables._sum.total || 0);
    const receivablesAmount = Number(outstandingReceivables._sum.total || 0);
    const prevReceivablesAmount = Number(prevOutstandingReceivables._sum.total || 0);
    const bankPaymentsAmount = Number(totalBankObligations);
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
        title: 'Outstanding Bank Pay...',
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