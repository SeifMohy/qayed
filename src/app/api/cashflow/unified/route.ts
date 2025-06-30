import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashflowProjectionService } from '@/lib/services/cashflowProjectionService';
import { currencyCache } from '@/lib/services/currencyCache';
import { isFacilityAccount } from '@/utils/bankStatementUtils';

/**
 * GET /api/cashflow/unified - Get unified cashflow data with multi-currency support
 * Converts all amounts to EGP using the same logic as the banks page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const range = searchParams.get('range') || '90d';
    const customEndDateParam = searchParams.get('customEndDate');
    
    // Default to latest bank statement date if no date provided
    let startDate: Date;
    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      // Get the latest bank statement date (same logic as dashboard)
      try {
        const latestStatement = await prisma.bankStatement.findFirst({
          orderBy: { statementPeriodEnd: 'desc' }
        });
        
        if (latestStatement && latestStatement.statementPeriodEnd) {
          // Use the day after the latest bank statement as the starting point
          const latestDate = new Date(latestStatement.statementPeriodEnd);
          startDate = new Date(latestDate);
          startDate.setDate(latestDate.getDate() + 1);
          console.log(`📅 Using latest bank statement date: ${latestDate.toISOString().split('T')[0]}, projections start from: ${startDate.toISOString().split('T')[0]}`);
        } else {
          // Fallback to today if no bank statements found
          startDate = new Date();
          console.warn('⚠️ No bank statements found, using today as fallback starting date');
        }
      } catch (error) {
        console.error('❌ Error getting latest bank statement date:', error);
        startDate = new Date(); // Fallback to today
      }
    }
    
    // Calculate end date based on range or use custom end date
    let endDate = new Date(startDate);
    if (customEndDateParam) {
      endDate = new Date(customEndDateParam);
    } else {
      switch (range) {
        case '30d':
          endDate.setDate(endDate.getDate() + 30);
          break;
        case '90d':
          endDate.setDate(endDate.getDate() + 90);
          break;
        case '1y':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setDate(endDate.getDate() + 90);
      }
    }

    console.log(`💰 Getting unified cashflow data from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // 1. Calculate starting balance (cash on hand) - same logic as banks page
    const startingBalance = await calculateCashOnHandInEGP();
    
    // 2. Get all projections in the date range
    const projections = await prisma.cashflowProjection.findMany({
      where: {
        projectionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        Invoice: {
          include: {
            Customer: { select: { name: true } },
            Supplier: { select: { name: true } }
          }
        },
        RecurringPayment: true,
        BankStatement: {
          include: { bank: true }
        }
      },
      orderBy: { projectionDate: 'asc' }
    });

    // 3. Convert all projection amounts to EGP
    const projectionsInEGP = await convertProjectionsToEGP(projections);

    // 4. Calculate cash position using converted amounts
    const positions = await calculateDailyCashPositions(startDate, endDate, startingBalance, projectionsInEGP);

    // 5. Calculate summary statistics
    const summary = calculateSummaryStatistics(projectionsInEGP, startDate, endDate);

    // 6. Generate alerts
    const alerts = generateCashflowAlerts(positions);

    // 7. Calculate position summary
    const positionSummary = calculatePositionSummary(positions, startingBalance);

    return NextResponse.json({
      success: true,
      summary,
      positions: positions.map(p => ({
        date: p.date,
        openingBalance: Math.round(p.openingBalance * 100) / 100,
        totalInflows: Math.round(p.totalInflows * 100) / 100,
        totalOutflows: Math.round(p.totalOutflows * 100) / 100,
        netCashflow: Math.round(p.netCashflow * 100) / 100,
        closingBalance: Math.round(p.closingBalance * 100) / 100,
        projectionCount: p.projectionCount,
        averageConfidence: Math.round(p.averageConfidence * 100) / 100
      })),
      positionSummary: {
        ...positionSummary,
        averageDailyBalance: Math.round(positionSummary.averageDailyBalance * 100) / 100,
        lowestProjectedBalance: Math.round(positionSummary.lowestProjectedBalance * 100) / 100,
        highestProjectedBalance: Math.round(positionSummary.highestProjectedBalance * 100) / 100,
        startingBalance: Math.round(startingBalance * 100) / 100
      },
      alerts,
      projections: projectionsInEGP,
      metadata: {
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        currency: 'EGP',
        startingBalance: Math.round(startingBalance * 100) / 100,
        totalProjections: projectionsInEGP.length,
        conversionNote: 'All amounts converted to EGP using latest exchange rates'
      }
    });

  } catch (error) {
    console.error('❌ Unified cashflow API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch unified cashflow data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Calculate total cash on hand in EGP - same logic as banks page
 */
async function calculateCashOnHandInEGP(): Promise<number> {
  try {
    console.log('💰 Calculating cash on hand in EGP...');
    
    // Get all bank statements and process each account separately (same as banks page)
    const allBankStatements = await prisma.bankStatement.findMany({
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

    if (allBankStatements.length === 0) {
      console.log('⚠️ No bank statements found, using balance of 0');
      return 0;
    }

    // First, collect all unique currencies from bank statements
    const uniqueCurrencies = new Set<string>();
    for (const statement of allBankStatements) {
      const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
      uniqueCurrencies.add(statementCurrency);
    }

    // Preload all currency rates in one API call
    const currencyList = Array.from(uniqueCurrencies).filter(currency => currency !== 'EGP');
    if (currencyList.length > 0) {
      console.log('🔄 Cashflow - Preloading currency rates for:', currencyList);
      await currencyCache.preloadRates(currencyList);
    }

    // Group by account to get latest statement for each account
    const accountMap = new Map();
    for (const statement of allBankStatements) {
      const accountKey = `${statement.bankId}-${statement.accountNumber}`;
      if (!accountMap.has(accountKey)) {
        accountMap.set(accountKey, statement);
      }
    }

    let totalCashOnHandEGP = 0;

    for (const statement of accountMap.values()) {
      if (statement.endingBalance) {
        const endingBalance = Number(statement.endingBalance);
        const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
        
        // Convert amount to EGP if needed using cached rates
        let balanceInEGP = endingBalance;
        if (statementCurrency !== 'EGP' && endingBalance !== 0) {
          try {
            const conversion = await currencyCache.convertCurrency(
              Math.abs(endingBalance),
              statementCurrency,
              'EGP'
            );
            
            balanceInEGP = endingBalance < 0 ? -conversion.convertedAmount : conversion.convertedAmount;
            console.log(`💱 Cashflow - Converted ${endingBalance} ${statementCurrency} to ${balanceInEGP} EGP for ${statement.bank.name} (cached)`);
          } catch (error) {
            console.error('Cashflow - Currency conversion error:', error);
            // Fallback to default rate
            const defaultRate = statementCurrency === 'USD' ? 50 : 1;
            balanceInEGP = endingBalance * defaultRate;
            console.log(`❌ Cashflow - Conversion failed, using default rate: ${endingBalance} × ${defaultRate} = ${balanceInEGP} EGP`);
          }
        }
        
        // Use the same logic as banks page: include all regular accounts (positive and negative balances)
        const isFacility = isFacilityAccount(statement.accountType, endingBalance);
        
        if (!isFacility) {
          totalCashOnHandEGP += balanceInEGP; // Include negative balances from current accounts
          console.log(`🏦 Cashflow - Regular Account: +${balanceInEGP} to total cash, running total: ${totalCashOnHandEGP}`);
        }
      }
    }

    console.log(`💰 Cashflow - Total cash on hand in EGP: ${totalCashOnHandEGP.toLocaleString()}`);
    return totalCashOnHandEGP;

  } catch (error) {
    console.error('❌ Error calculating cash on hand:', error);
    return 0;
  }
}

/**
 * Convert all projections to EGP
 */
async function convertProjectionsToEGP(projections: any[]): Promise<any[]> {
  console.log(`💱 Converting ${projections.length} projections to EGP...`);
  
  // Collect unique currencies from projections
  const uniqueCurrencies = new Set<string>();
  
  projections.forEach(projection => {
    // Get currency from associated records
    let currency = 'EGP'; // default
    
    if (projection.Invoice) {
      currency = projection.Invoice.currency || 'EGP';
    } else if (projection.RecurringPayment) {
      currency = projection.RecurringPayment.currency || 'EGP';
    } else if (projection.BankStatement) {
      currency = projection.BankStatement.accountCurrency?.trim() || 'EGP';
    }
    
    uniqueCurrencies.add(currency);
  });

  // Preload currency rates
  const currencyList = Array.from(uniqueCurrencies).filter(currency => currency !== 'EGP');
  if (currencyList.length > 0) {
    console.log('🔄 Preloading currency rates for projections:', currencyList);
    await currencyCache.preloadRates(currencyList);
  }

  // Convert each projection
  const convertedProjections = [];
  
  for (const projection of projections) {
    let currency = 'EGP';
    let originalAmount = Number(projection.projectedAmount);
    
    // Determine currency from associated records
    if (projection.Invoice) {
      currency = projection.Invoice.currency || 'EGP';
    } else if (projection.RecurringPayment) {
      currency = projection.RecurringPayment.currency || 'EGP';
    } else if (projection.BankStatement) {
      currency = projection.BankStatement.accountCurrency?.trim() || 'EGP';
    }

    let amountInEGP = originalAmount;

    // Convert to EGP if needed
    if (currency !== 'EGP' && originalAmount !== 0) {
      try {
        const conversion = await currencyCache.convertCurrency(
          Math.abs(originalAmount),
          currency,
          'EGP'
        );
        
        amountInEGP = originalAmount < 0 ? -conversion.convertedAmount : conversion.convertedAmount;
        console.log(`💱 Converted projection ${projection.id}: ${originalAmount} ${currency} to ${amountInEGP} EGP`);
      } catch (error) {
        console.error('Projection currency conversion error:', error);
        // Fallback to default rate
        const defaultRate = currency === 'USD' ? 50 : 1;
        amountInEGP = originalAmount * defaultRate;
        console.log(`❌ Conversion failed, using default rate: ${originalAmount} × ${defaultRate} = ${amountInEGP} EGP`);
      }
    }

    convertedProjections.push({
      ...projection,
      projectedAmount: amountInEGP,
      originalAmount,
      originalCurrency: currency,
      convertedToEGP: currency !== 'EGP'
    });
  }

  console.log(`✅ Converted ${convertedProjections.length} projections to EGP`);
  return convertedProjections;
}

/**
 * Calculate daily cash positions with EGP amounts
 */
async function calculateDailyCashPositions(
  startDate: Date, 
  endDate: Date, 
  startingBalance: number, 
  projections: any[]
): Promise<any[]> {
  // Group projections by date
  const dailyPositions = new Map<string, any>();
  let runningBalance = startingBalance;
  
  // Create a complete date range from start to end date
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyPositions.set(dateKey, {
      date: dateKey,
      openingBalance: runningBalance,
      totalInflows: 0,
      totalOutflows: 0,
      netCashflow: 0,
      projectionCount: 0,
      confidenceSum: 0,
      projections: []
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Apply projections to their respective dates
  projections.forEach(projection => {
    const dateKey = projection.projectionDate.toISOString().split('T')[0];
    const position = dailyPositions.get(dateKey);
    
    if (position) {
      const amount = Number(projection.projectedAmount); // Already in EGP
      
      position.projectionCount++;
      position.confidenceSum += projection.confidence;
      position.projections.push(projection);
      
      if (amount > 0) {
        position.totalInflows += amount;
      } else {
        position.totalOutflows += Math.abs(amount);
      }
      
      position.netCashflow += amount;
    }
  });
  
  // Calculate running balances for each day
  const sortedDates = Array.from(dailyPositions.keys()).sort();
  const positions = sortedDates.map(dateKey => {
    const day = dailyPositions.get(dateKey);
    const closingBalance = day.openingBalance + day.netCashflow;
    
    // Update running balance for next day
    runningBalance = closingBalance;
    
    // Update opening balance for next day if it exists
    const nextDateKey = sortedDates[sortedDates.indexOf(dateKey) + 1];
    if (nextDateKey && dailyPositions.has(nextDateKey)) {
      dailyPositions.get(nextDateKey).openingBalance = closingBalance;
    }
    
    return {
      ...day,
      closingBalance,
      averageConfidence: day.projectionCount > 0 ? day.confidenceSum / day.projectionCount : 1.0
    };
  });
  
  return positions;
}

/**
 * Calculate summary statistics
 */
function calculateSummaryStatistics(projections: any[], startDate: Date, endDate: Date) {
  const totalInflows = projections
    .filter(p => Number(p.projectedAmount) > 0)
    .reduce((sum, p) => sum + Number(p.projectedAmount), 0);
    
  const totalOutflows = projections
    .filter(p => Number(p.projectedAmount) < 0)
    .reduce((sum, p) => sum + Math.abs(Number(p.projectedAmount)), 0);

  return {
    totalInflows,
    totalOutflows,
    netCashflow: totalInflows - totalOutflows,
    totalItems: projections.length,
    projectedItems: projections.filter(p => p.status === 'PROJECTED').length,
    confirmedItems: projections.filter(p => p.status === 'CONFIRMED').length,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  };
}

/**
 * Generate cashflow alerts
 */
function generateCashflowAlerts(positions: any[]) {
  const alerts = [];
  
  // Check for negative balances
  const negativeDays = positions.filter(p => p.closingBalance < 0);
  if (negativeDays.length > 0) {
    alerts.push({
      id: 'negative-balance-alert',
      type: 'negative_balance',
      severity: negativeDays.length > 5 ? 'critical' : 'high',
      title: 'Negative Cash Balance Projected',
      description: `${negativeDays.length} day${negativeDays.length > 1 ? 's' : ''} with negative cash balance projected`,
      date: negativeDays[0].date,
      amount: negativeDays[0].closingBalance,
      actionRequired: true
    });
  }

  // Check for large outflows (>50,000 EGP)
  const largeOutflows = positions.filter(p => p.totalOutflows > 50000);
  if (largeOutflows.length > 0) {
    alerts.push({
      id: 'large-outflow-alert',
      type: 'large_outflow',
      severity: 'medium',
      title: 'Large Outflows Expected',
      description: `${largeOutflows.length} day${largeOutflows.length > 1 ? 's' : ''} with outflows exceeding £E 50,000`,
      actionRequired: false
    });
  }

  return alerts;
}

/**
 * Calculate position summary
 */
function calculatePositionSummary(positions: any[], startingBalance: number) {
  if (positions.length === 0) {
    return {
      averageDailyBalance: startingBalance,
      lowestProjectedBalance: startingBalance,
      lowestBalanceDate: '',
      highestProjectedBalance: startingBalance,
      highestBalanceDate: '',
      cashPositiveDays: 0,
      cashNegativeDays: 0,
      totalDays: 0,
      startingBalance,
      latestBalanceDate: new Date().toISOString().split('T')[0],
      effectiveStartDate: new Date().toISOString().split('T')[0]
    };
  }

  const balances = positions.map(p => p.closingBalance);
  const lowestBalance = Math.min(...balances);
  const highestBalance = Math.max(...balances);
  
  const lowestPosition = positions.find(p => p.closingBalance === lowestBalance);
  const highestPosition = positions.find(p => p.closingBalance === highestBalance);

  return {
    averageDailyBalance: balances.reduce((sum, b) => sum + b, 0) / balances.length,
    lowestProjectedBalance: lowestBalance,
    lowestBalanceDate: lowestPosition?.date || '',
    highestProjectedBalance: highestBalance,
    highestBalanceDate: highestPosition?.date || '',
    cashPositiveDays: positions.filter(p => p.closingBalance > 0).length,
    cashNegativeDays: positions.filter(p => p.closingBalance < 0).length,
    totalDays: positions.length,
    startingBalance,
    latestBalanceDate: new Date().toISOString().split('T')[0], // This should come from bank statement data
    effectiveStartDate: positions[0]?.date || new Date().toISOString().split('T')[0]
  };
} 