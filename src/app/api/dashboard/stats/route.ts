import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { isFacilityAccount } from '@/utils/bankStatementUtils';
import { currencyCache } from '@/lib/services/currencyCache';

export const GET = withAuth(async (request, authContext) => {
  try {
    const { companyAccessService } = authContext;
    
    // Get the latest bank statement for the company
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
          companyId: authContext.companyId,
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

    // Calculate Total Cash On Hand using company-scoped banks
    const banks = await companyAccessService.getBanks();

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
      console.log(`🔄 Dashboard Stats (company ${authContext.companyId}) - Preloading currency rates for:`, currencyList);
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
            console.log(`💱 Dashboard Stats (company ${authContext.companyId}) - Converted ${endingBalance} ${statementCurrency} to ${balanceInEGP} EGP for ${bank.name} (cached)`);
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
        companyId: authContext.companyId,
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

    // 3. Outstanding Receivables (30 days) - customer invoices not paid within 30 days from reference date
    const outstandingReceivables = await prisma.invoice.aggregate({
      where: {
        customerId: { not: null },
        companyId: authContext.companyId,
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

    // 4. Previous period stats for comparison (30 days earlier)
    const sixtyDaysAgo = new Date(referenceDate);
    sixtyDaysAgo.setDate(referenceDate.getDate() - 60);
    const previousPeriodEnd = new Date(referenceDate);
    previousPeriodEnd.setDate(referenceDate.getDate() - 30);

    const previousPayables = await prisma.invoice.aggregate({
      where: {
        supplierId: { not: null },
        companyId: authContext.companyId,
        invoiceDate: {
          gte: sixtyDaysAgo,
          lte: previousPeriodEnd
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

    const previousReceivables = await prisma.invoice.aggregate({
      where: {
        customerId: { not: null },
        companyId: authContext.companyId,
        invoiceDate: {
          gte: sixtyDaysAgo,
          lte: previousPeriodEnd
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

    // Helper functions for calculations
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const getChangeType = (current: number, previous: number): 'increase' | 'decrease' | 'neutral' => {
      if (current > previous) return 'increase';
      if (current < previous) return 'decrease';
      return 'neutral';
    };

    // Calculate values
    const payablesValue = Number(outstandingPayables._sum.total || 0);
    const receivablesValue = Number(outstandingReceivables._sum.total || 0);
    const bankObligationsValue = totalBankObligations;
    const cashOnHandValue = totalCashOnHand;

    const previousPayablesValue = Number(previousPayables._sum.total || 0);
    const previousReceivablesValue = Number(previousReceivables._sum.total || 0);

    // Build stats array
    const stats = [
      {
        title: 'Total Cash On Hand',
        value: Math.round(cashOnHandValue),
        change: 0, // No historical comparison for cash on hand
        changeType: 'neutral' as const,
        icon: 'CurrencyDollarIcon',
        iconColor: 'bg-green-500',
        dataSource: 'bankStatements'
      },
      {
        title: 'Outstanding Payables (30 days)',
        value: Math.round(payablesValue),
        change: Math.round(calculateChange(payablesValue, previousPayablesValue)),
        changeType: getChangeType(payablesValue, previousPayablesValue),
        icon: 'BanknotesIcon',
        iconColor: 'bg-red-500',
        interpretation: 'positive' as const,
        dataSource: 'accountsPayable'
      },
      {
        title: 'Outstanding Receivables (30 days)',
        value: Math.round(receivablesValue),
        change: Math.round(calculateChange(receivablesValue, previousReceivablesValue)),
        changeType: getChangeType(receivablesValue, previousReceivablesValue),
        icon: 'CreditCardIcon',
        iconColor: 'bg-blue-500',
        dataSource: 'accountsReceivable'
      },
      {
        title: 'Outstanding Bank Payments (30 days)',
        value: Math.round(bankObligationsValue),
        change: 0, // No historical comparison for bank obligations
        changeType: 'neutral' as const,
        icon: 'ArrowTrendingUpIcon',
        iconColor: 'bg-purple-500',
        interpretation: 'negative' as const,
        dataSource: 'bankPosition'
      },
    ];

    console.log(`📊 Dashboard Stats (company ${authContext.companyId}) calculated:`);
    console.log(`   - Cash On Hand: ${cashOnHandValue.toLocaleString()}`);
    console.log(`   - Outstanding Payables: ${payablesValue.toLocaleString()}`);
    console.log(`   - Outstanding Receivables: ${receivablesValue.toLocaleString()}`);
    console.log(`   - Bank Obligations: ${bankObligationsValue.toLocaleString()}`);

    return NextResponse.json({
      success: true,
      stats,
      metadata: {
        companyId: authContext.companyId,
        referenceDate: referenceDate.toISOString(),
        referenceDateFormatted: referenceDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        bankName: latestBankStatement.bankName,
        accountNumber: latestBankStatement.accountNumber,
        cashBalanceDate: latestBankStatement.statementPeriodEnd?.toISOString() || new Date().toISOString(),
        period: '30 days',
        note: 'All amounts are in EGP'
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate dashboard stats' },
      { status: 500 }
    );
  }
}); 