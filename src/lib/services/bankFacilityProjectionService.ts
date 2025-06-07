/**
 * Bank Facility Cashflow Projection Service
 * 
 * Handles the creation and management of cashflow projections for bank facility obligations.
 * This includes:
 * 1. Outstanding facility repayment schedules based on tenor
 * 2. New disbursement tracking and repayment schedules
 */

import { prisma } from '@/lib/prisma';
import { CashflowType, CashflowStatus } from '@prisma/client';
import { isFacilityAccount } from '@/utils/bankStatementUtils';
import { Decimal } from '@prisma/client/runtime/library';

export interface FacilityProjectionOptions {
  facilityId: number;
  startDate?: Date;
  generateForExisting?: boolean;
  generateForNewDisbursements?: boolean;
}

export interface ProjectionSummary {
  facilityId: number;
  facilityName: string;
  outstandingAmount: number;
  tenor: string | null;
  projectionsCreated: number;
  totalProjectedPayments: number;
  projectionDateRange: {
    start: Date | null;
    end: Date | null;
  };
}

/**
 * Parse tenor string into months for calculation
 */
function parseTenorToMonths(tenor: string | null): number {
  if (!tenor) {
    console.log('⚠️ No tenor specified, defaulting to 12 months');
    return 12; // Default to 12 months if no tenor specified
  }
  
  const cleanTenor = tenor.toLowerCase().trim();
  console.log(`🔍 Parsing tenor: "${tenor}" (cleaned: "${cleanTenor}")`);
  
  // Extract numeric value
  const numMatch = cleanTenor.match(/(\d+)/);
  if (!numMatch) {
    console.log('⚠️ No number found in tenor, defaulting to 12 months');
    return 12; // Default if no number found
  }
  
  const num = parseInt(numMatch[1]);
  console.log(`📊 Extracted number: ${num}`);
  
  // Determine time unit with more specific matching
  if (cleanTenor.includes('year') || cleanTenor.includes('yr')) {
    const months = num * 12;
    console.log(`📅 Interpreted as ${num} year(s) = ${months} months`);
    return months;
  } else if (cleanTenor.includes('month') || cleanTenor.includes('mon') || cleanTenor.includes('mo')) {
    console.log(`📅 Interpreted as ${num} month(s)`);
    return num;
  } else if (cleanTenor.includes('week') || cleanTenor.includes('wk')) {
    const months = Math.round(num / 4.33); // Approximate weeks to months
    console.log(`📅 Interpreted as ${num} week(s) = ${months} months`);
    return months;
  } else if (cleanTenor.includes('day') || cleanTenor.includes('d')) {
    const months = Math.round(num / 30.44); // Approximate days to months
    console.log(`📅 Interpreted as ${num} day(s) = ${months} months`);
    return months;
  } else {
    // If no unit specified, assume DAYS (most common for facilities)
    const months = Math.round(num / 30.44); // Convert days to months
    console.log(`⚠️ No time unit specified in tenor "${tenor}", assuming DAYS`);
    console.log(`📅 Interpreted as ${num} day(s) = ${months} months`);
    return months;
  }
}

/**
 * Calculate repayment schedule for a facility
 */
function calculateRepaymentSchedule(
  outstandingAmount: number,
  tenorMonths: number,
  startDate: Date
): { date: Date; amount: number }[] {
  if (outstandingAmount <= 0 || tenorMonths <= 0) {
    console.log(`⚠️ Invalid repayment parameters: amount=${outstandingAmount}, tenor=${tenorMonths}`);
    return [];
  }
  
  const monthlyPayment = outstandingAmount / tenorMonths;
  const schedule: { date: Date; amount: number }[] = [];
  
  console.log(`📊 Calculating repayment schedule:`);
  console.log(`   Outstanding amount: $${outstandingAmount.toFixed(2)}`);
  console.log(`   Tenor: ${tenorMonths} months`);
  console.log(`   Monthly payment: $${monthlyPayment.toFixed(2)}`);
  console.log(`   Start date: ${startDate.toISOString().split('T')[0]}`);
  
  for (let i = 1; i <= tenorMonths; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
    if (paymentDate.getDate() !== startDate.getDate()) {
      // If day changed due to month having fewer days, set to last day of target month
      paymentDate.setDate(0); // Go to last day of previous month
    }
    
    schedule.push({
      date: new Date(paymentDate), // Create new date object to avoid reference issues
      amount: monthlyPayment
    });
    
    console.log(`   Payment ${i}: ${paymentDate.toISOString().split('T')[0]} - $${monthlyPayment.toFixed(2)}`);
  }
  
  console.log(`✅ Generated ${schedule.length} monthly payments`);
  return schedule;
}

/**
 * Generate cashflow projections for a specific facility
 */
export async function generateFacilityProjections(
  options: FacilityProjectionOptions
): Promise<ProjectionSummary> {
  const { facilityId, startDate, generateForExisting = true, generateForNewDisbursements = true } = options;
  
  console.log(`🔧 Generating facility projections for facility ${facilityId}`);
  
  // Fetch the facility (bank statement)
  const facility = await prisma.bankStatement.findUnique({
    where: { id: facilityId },
    include: {
      transactions: {
        orderBy: { transactionDate: 'asc' }
      },
      bank: true
    }
  });
  
  if (!facility) {
    throw new Error(`Facility with ID ${facilityId} not found`);
  }
  
  console.log(`🏦 Found facility: ${facility.bank.name} - ${facility.accountType}`);
  
  // Use bank statement period end date as the starting point, or provided startDate
  const projectionStartDate = startDate || facility.statementPeriodEnd;
  console.log(`📅 Bank statement period: ${facility.statementPeriodStart.toISOString().split('T')[0]} to ${facility.statementPeriodEnd.toISOString().split('T')[0]}`);
  console.log(`📅 Projection start date: ${projectionStartDate.toISOString().split('T')[0]} ${startDate ? '(provided)' : '(from bank statement end)'}`);
  
  // Verify this is actually a facility account using the new logic
  const endingBalance = parseFloat(facility.endingBalance.toString());
  if (!isFacilityAccount(facility.accountType, endingBalance)) {
    console.log(`❌ Bank statement ${facilityId} is not a facility account (Type: ${facility.accountType}, Balance: ${endingBalance})`);
    throw new Error(`Bank statement ${facilityId} is not a facility account`);
  }
  
  const outstandingAmount = Math.abs(endingBalance);
  const tenorMonths = parseTenorToMonths(facility.tenor);
  let projectionsCreated = 0;
  let totalProjectedPayments = 0;
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;
  
  console.log(`💰 Outstanding amount: ${outstandingAmount}`);
  console.log(`📅 Tenor in months: ${tenorMonths}`);
  console.log(`💳 Monthly payment: ${outstandingAmount / tenorMonths}`);
  
  // 1. Generate projections for existing outstanding amount
  if (generateForExisting && outstandingAmount > 0) {
    console.log(`🔄 Generating repayment schedule for outstanding amount...`);
    
    // Note: Projections are now cleaned up by the main CashflowProjectionService
    // No need for individual facility cleanup here
    
    const repaymentSchedule = calculateRepaymentSchedule(outstandingAmount, tenorMonths, projectionStartDate);
    
    console.log(`📋 Created repayment schedule with ${repaymentSchedule.length} payments:`);
    repaymentSchedule.forEach((payment, index) => {
      console.log(`   Payment ${index + 1}: ${payment.date.toISOString().split('T')[0]} - $${payment.amount.toFixed(2)}`);
    });
    
    for (const payment of repaymentSchedule) {
      const projectionData = {
        projectionDate: payment.date,
        projectedAmount: new Decimal(-payment.amount), // Negative for outflow, use Decimal
        type: CashflowType.BANK_OBLIGATION,
        status: CashflowStatus.PROJECTED,
        confidence: 0.9, // High confidence for existing obligations
        description: `${facility.accountType || 'Facility'} repayment - ${facility.bank.name}`,
        bankStatementId: facilityId
      };
      
      const created = await prisma.cashflowProjection.create({
        data: projectionData
      });
      
      console.log(`✅ Created projection ${created.id}: ${payment.date.toISOString().split('T')[0]} - $${payment.amount.toFixed(2)}`);
      
      projectionsCreated++;
      totalProjectedPayments += payment.amount;
      
      if (!earliestDate || payment.date < earliestDate) earliestDate = payment.date;
      if (!latestDate || payment.date > latestDate) latestDate = payment.date;
    }
    
    console.log(`✅ Generated ${projectionsCreated} BANK_OBLIGATION projections totaling $${totalProjectedPayments.toFixed(2)}`);
  }
  
  // 2. Generate projections for new disbursements (debit transactions)
  if (generateForNewDisbursements) {
    console.log(`🔄 Checking for recent disbursements...`);
    
    // Find recent debit transactions (new disbursements)
    // Look at transactions within the statement period and shortly after
    const cutoffDate = new Date(facility.statementPeriodEnd);
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Look at 30 days before statement end
    
    const recentDisbursements = facility.transactions.filter(transaction => {
      const debitAmount = parseFloat(transaction.debitAmount?.toString() || '0');
      const transactionDate = new Date(transaction.transactionDate);
      
      return debitAmount > 0 && transactionDate >= cutoffDate && transactionDate <= facility.statementPeriodEnd;
    });
    
    console.log(`💳 Found ${recentDisbursements.length} recent disbursements in period`);
    
    for (const disbursement of recentDisbursements) {
      const disbursementAmount = parseFloat(disbursement.debitAmount?.toString() || '0');
      if (disbursementAmount > 0) {
        console.log(`💰 Processing disbursement: $${disbursementAmount} on ${disbursement.transactionDate.toISOString().split('T')[0]}`);
        
        // Create repayment schedule for this disbursement starting from the transaction date
        const disbursementDate = new Date(disbursement.transactionDate);
        const disbursementSchedule = calculateRepaymentSchedule(disbursementAmount, tenorMonths, disbursementDate);
        
        for (const payment of disbursementSchedule) {
          await prisma.cashflowProjection.create({
            data: {
              projectionDate: payment.date,
              projectedAmount: new Decimal(-payment.amount), // Negative for outflow, use Decimal
              type: CashflowType.LOAN_PAYMENT,
              status: CashflowStatus.PROJECTED,
              confidence: 0.8, // Slightly lower confidence for new disbursements
              description: `Repayment for disbursement on ${disbursementDate.toDateString()} - ${facility.bank.name}`,
              bankStatementId: facilityId
            }
          });
          
          projectionsCreated++;
          totalProjectedPayments += payment.amount;
          
          if (!earliestDate || payment.date < earliestDate) earliestDate = payment.date;
          if (!latestDate || payment.date > latestDate) latestDate = payment.date;
        }
        
        console.log(`✅ Generated ${disbursementSchedule.length} LOAN_PAYMENT projections for disbursement`);
      }
    }
  }
  
  return {
    facilityId,
    facilityName: `${facility.bank.name} - ${facility.accountType || 'Facility'}`,
    outstandingAmount,
    tenor: facility.tenor,
    projectionsCreated,
    totalProjectedPayments,
    projectionDateRange: {
      start: earliestDate,
      end: latestDate
    }
  };
}

/**
 * Generate projections for all facility accounts
 */
export async function generateAllFacilityProjections(): Promise<ProjectionSummary[]> {
  console.log('🏦 Starting facility projections generation for all facilities...');
  
  // Find all facility accounts
  const facilities = await prisma.bankStatement.findMany({
    include: {
      bank: true,
      transactions: true
    }
  });

  console.log(`📋 Found ${facilities.length} total bank statements to evaluate`);
  
  const facilityAccounts = facilities.filter(statement => {
    const endingBalance = parseFloat(statement.endingBalance.toString());
    const isFacility = isFacilityAccount(statement.accountType, endingBalance);
    
    if (isFacility) {
      console.log(`✅ Identified facility: ${statement.bank.name} - ${statement.accountType} (Balance: ${endingBalance})`);
    }
    
    return isFacility;
  });

  console.log(`🏦 Found ${facilityAccounts.length} facility accounts for projection generation`);
  
  if (facilityAccounts.length === 0) {
    console.log('⚠️  No facility accounts found - skipping facility projection generation');
    return [];
  }

  const results: ProjectionSummary[] = [];
  
  for (const facility of facilityAccounts) {
    try {
      console.log(`🔄 Processing facility ${facility.id}: ${facility.bank.name} - ${facility.accountType}`);
      console.log(`   Outstanding balance: ${parseFloat(facility.endingBalance.toString())}`);
      console.log(`   Tenor: ${facility.tenor || 'Not set'}`);
      console.log(`   Available limit: ${facility.availableLimit ? parseFloat(facility.availableLimit.toString()) : 'Not set'}`);
      console.log(`   Statement period: ${facility.statementPeriodStart.toISOString().split('T')[0]} to ${facility.statementPeriodEnd.toISOString().split('T')[0]}`);
      
      // Don't override startDate - let each facility use its own bank statement end date
      const summary = await generateFacilityProjections({
        facilityId: facility.id,
        // startDate: not specified, will use facility.statementPeriodEnd
        generateForExisting: true,
        generateForNewDisbursements: true
      });
      
      console.log(`✅ Generated ${summary.projectionsCreated} projections for facility ${facility.id}`);
      console.log(`   Total projected payments: ${summary.totalProjectedPayments.toFixed(2)}`);
      
      results.push(summary);
    } catch (error) {
      console.error(`❌ Error generating projections for facility ${facility.id}:`, error);
    }
  }
  
  console.log(`🎯 Facility projection generation complete: ${results.length} facilities processed`);
  return results;
}

/**
 * Update projections when facility terms change
 */
export async function updateFacilityProjections(facilityId: number): Promise<ProjectionSummary> {
  // First, clean up existing projections
  await prisma.cashflowProjection.deleteMany({
    where: {
      bankStatementId: facilityId,
      type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
    }
  });
  
  // Then regenerate
  return generateFacilityProjections({
    facilityId,
    generateForExisting: true,
    generateForNewDisbursements: true
  });
}

/**
 * Get facility projections summary
 */
export async function getFacilityProjectionsSummary(): Promise<{
  totalFacilities: number;
  totalProjections: number;
  totalProjectedPayments: number;
  nextPaymentDate: Date | null;
  nextPaymentAmount: number;
}> {
  const facilityProjections = await prisma.cashflowProjection.findMany({
    where: {
      type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] },
      status: 'PROJECTED',
      projectionDate: { gte: new Date() }
    },
    orderBy: { projectionDate: 'asc' }
  });
  
  const facilitiesWithProjections = await prisma.bankStatement.findMany({
    where: {
      CashflowProjection: {
        some: {
          type: { in: ['BANK_OBLIGATION', 'LOAN_PAYMENT'] }
        }
      }
    }
  });
  
  const totalProjectedPayments = facilityProjections.reduce((sum, projection) => {
    return sum + Math.abs(parseFloat(projection.projectedAmount.toString()));
  }, 0);
  
  const nextPayment = facilityProjections[0];
  
  return {
    totalFacilities: facilitiesWithProjections.length,
    totalProjections: facilityProjections.length,
    totalProjectedPayments,
    nextPaymentDate: nextPayment?.projectionDate || null,
    nextPaymentAmount: nextPayment ? Math.abs(parseFloat(nextPayment.projectedAmount.toString())) : 0
  };
} 