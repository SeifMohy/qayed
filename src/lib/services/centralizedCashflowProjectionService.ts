import { prisma } from '@/lib/prisma';
import { CashflowType, CashflowStatus, RecurrenceFrequency } from '@prisma/client';
import { PaymentTermsCalculator } from './paymentTermsCalculator';
import type { PaymentTermsData } from '@/types/paymentTerms';
import { Decimal } from '@prisma/client/runtime/library';
import { isFacilityAccount } from '@/utils/bankStatementUtils';

interface ProjectionParams {
  startDate: Date;
  endDate: Date;
  forceRecalculate?: boolean;
}

interface RecurringProjectionItem {
  projectionDate: Date;
  projectedAmount: number;
  type: CashflowType;
  status: CashflowStatus;
  confidence: number;
  description: string;
  recurringPaymentId: number;
}

interface InvoiceProjectionItem {
  projectionDate: Date;
  projectedAmount: number;
  type: CashflowType;
  status: CashflowStatus;
  confidence: number;
  description: string;
  invoiceId: number;
}

interface BankObligationProjectionItem {
  projectionDate: Date;
  projectedAmount: number;
  type: CashflowType;
  status: CashflowStatus;
  confidence: number;
  description: string;
  bankStatementId: number;
}

export class CentralizedCashflowProjectionService {

  /**
   * Main method to refresh all projections in the system
   */
  async refreshAllProjections(params: ProjectionParams) {
    const { startDate, endDate, forceRecalculate = true } = params;
    
    console.log('🔄 Starting centralized cashflow projection refresh...');
    console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    try {
      // Step 1: Clear existing projections if force recalculate
      if (forceRecalculate) {
        await this.clearExistingProjections(startDate, endDate);
      }

      // Step 2: Generate all projections in parallel
      const [
        recurringProjections,
        invoiceProjections,
        bankObligationProjections
      ] = await Promise.all([
        this.generateRecurringProjections(startDate, endDate),
        this.generateInvoiceProjections(startDate, endDate),
        this.generateBankObligationProjections(startDate, endDate)
      ]);

      // Step 3: Save all projections to the centralized table
      const allProjections = [
        ...recurringProjections,
        ...invoiceProjections,
        ...bankObligationProjections
      ];

      if (allProjections.length > 0) {
        await this.saveProjections(allProjections);
      }

      // Step 4: We no longer update nextDueDate as it should remain stable
      // The projection generation logic handles advancing dates internally

      const summary = {
        totalProjections: allProjections.length,
        recurringPayments: recurringProjections.length,
        invoiceProjections: invoiceProjections.length,
        bankObligations: bankObligationProjections.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };

      console.log('✅ Centralized projection refresh completed:');
      console.log(`   - Total projections: ${summary.totalProjections}`);
      console.log(`   - Recurring payments: ${summary.recurringPayments}`);
      console.log(`   - Invoice projections: ${summary.invoiceProjections}`);
      console.log(`   - Bank obligations: ${summary.bankObligations}`);

      return summary;

    } catch (error) {
      console.error('❌ Error during centralized projection refresh:', error);
      throw error;
    }
  }

  /**
   * Generate recurring payment projections
   */
  async generateRecurringProjections(startDate: Date, endDate: Date): Promise<RecurringProjectionItem[]> {
    console.log('📅 Generating recurring payment projections...');
    console.log(`   Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    // Validate date range
    if (startDate >= endDate) {
      console.warn('⚠️  Invalid date range: startDate >= endDate, skipping recurring projections');
      return [];
    }
    
    const activeRecurringPayments = await prisma.recurringPayment.findMany({
      where: { 
        isActive: true,
        // Only include payments that could occur within our date range
        OR: [
          { endDate: null }, // No end date
          { endDate: { gte: startDate } } // End date is after our start date
        ]
      }
    });

    console.log(`   Found ${activeRecurringPayments.length} active recurring payments`);

    if (activeRecurringPayments.length === 0) {
      console.log('   No active recurring payments found');
      return [];
    }

    const projections: RecurringProjectionItem[] = [];

    for (const payment of activeRecurringPayments) {
      console.log(`   Processing "${payment.name}" (${payment.frequency}, next: ${new Date(payment.nextDueDate).toISOString().split('T')[0]})`);
      
      const paymentProjections = this.generateProjectionsForRecurringPayment(
        payment,
        startDate,
        endDate
      );
      
      console.log(`   Generated ${paymentProjections.length} projections for "${payment.name}"`);
      projections.push(...paymentProjections);
    }

    console.log(`✅ Generated ${projections.length} recurring payment projections from ${activeRecurringPayments.length} active payments`);
    return projections;
  }

  /**
   * Generate projections for a single recurring payment
   */
  private generateProjectionsForRecurringPayment(
    payment: any,
    startDate: Date,
    endDate: Date
  ): RecurringProjectionItem[] {
    const projections: RecurringProjectionItem[] = [];
    let currentDate = new Date(payment.nextDueDate);

    // Ensure we don't start before the payment's start date
    if (currentDate < new Date(payment.startDate)) {
      currentDate = new Date(payment.startDate);
    }

    // If the current date is in the past relative to our projection start date,
    // advance it to the first occurrence on or after the start date
    let iterations = 0;
    const maxIterations = 1000; // Safety limit to prevent infinite loops

    while (currentDate < startDate && iterations < maxIterations) {
      currentDate = this.getNextOccurrence(
        currentDate,
        payment.frequency,
        payment.dayOfMonth,
        payment.dayOfWeek
      );
      iterations++;
    }

    if (iterations >= maxIterations) {
      console.warn(`⚠️  Hit maximum iterations (${maxIterations}) for payment ${payment.name}, stopping to prevent infinite loop`);
      return projections;
    }

    // Now generate projections within the date range
    let projectionCount = 0;
    while (currentDate <= endDate && projectionCount < 100) { // Safety limit of 100 projections per payment
      // Check if this projection is within our date range
      if (currentDate >= startDate && currentDate <= endDate) {
        // Check if payment has ended
        if (payment.endDate && currentDate > new Date(payment.endDate)) {
          break;
        }

        projections.push({
          projectionDate: new Date(currentDate),
          projectedAmount: payment.type === 'RECURRING_INFLOW' 
            ? Number(payment.amount) 
            : -Number(payment.amount), // Negative for outflows
          type: payment.type,
          status: CashflowStatus.PROJECTED,
          confidence: Number(payment.confidence),
          description: `${payment.name}${payment.category ? ` (${payment.category})` : ''}`,
          recurringPaymentId: payment.id
        });

        projectionCount++;
      }

      // Calculate next occurrence
      currentDate = this.getNextOccurrence(
        currentDate,
        payment.frequency,
        payment.dayOfMonth,
        payment.dayOfWeek
      );
    }

    return projections;
  }

  /**
   * Generate invoice-based projections with proper payment terms
   */
  async generateInvoiceProjections(startDate: Date, endDate: Date): Promise<InvoiceProjectionItem[]> {
    console.log('💰 Generating invoice-based projections...');
    
    // Get unpaid invoices (both customer and supplier)
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { customerId: { not: null } },
          { supplierId: { not: null } }
        ],
        invoiceDate: { gte: new Date('2023-01-01') } // Only recent invoices
      },
      include: {
        Customer: {
          select: {
            name: true,
            paymentTermsData: true
          }
        },
        Supplier: {
          select: {
            name: true,
            paymentTermsData: true
          }
        },
        TransactionMatch: {
          where: { status: 'APPROVED' },
          include: { 
            Transaction: {
              select: {
                creditAmount: true,
                debitAmount: true
              }
            }
          }
        }
      }
    });

    const projections: InvoiceProjectionItem[] = [];

    for (const invoice of unpaidInvoices) {
      // Calculate paid amount
      const paidAmount = invoice.TransactionMatch.reduce((sum, match) => {
        if (invoice.customerId) {
          return sum + Number(match.Transaction.creditAmount || 0);
        } else {
          return sum + Number(match.Transaction.debitAmount || 0);
        }
      }, 0);

      const remainingAmount = Number(invoice.total) - paidAmount;

      if (remainingAmount > 0.01) {
        const isCustomerInvoice = invoice.customerId !== null;
        const entityName = isCustomerInvoice 
          ? invoice.Customer?.name || 'Unknown Customer'
          : invoice.Supplier?.name || 'Unknown Supplier';
        
        const paymentTerms = (isCustomerInvoice 
          ? invoice.Customer?.paymentTermsData 
          : invoice.Supplier?.paymentTermsData) as unknown as PaymentTermsData || { 
          paymentPeriod: 'Net 30' 
        };

        try {
          const expectedPayments = PaymentTermsCalculator.calculateExpectedPayments(
            remainingAmount,
            invoice.invoiceDate,
            paymentTerms
          );

          for (const payment of expectedPayments) {
            const projectionDate = new Date(payment.date);
            
            if (projectionDate >= startDate && projectionDate <= endDate) {
              projections.push({
                projectionDate,
                projectedAmount: isCustomerInvoice 
                  ? payment.amount  // Positive for customer receivables (money coming in)
                  : -payment.amount, // Negative for supplier payables (money going out)
                type: isCustomerInvoice 
                  ? CashflowType.CUSTOMER_RECEIVABLE 
                  : CashflowType.SUPPLIER_PAYABLE,
                status: CashflowStatus.PROJECTED,
                confidence: this.calculateInvoiceConfidence(invoice, paymentTerms, remainingAmount),
                description: `${payment.description} for invoice ${invoice.invoiceNumber} ${isCustomerInvoice ? 'from' : 'to'} ${entityName}`,
                invoiceId: invoice.id
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error processing payment terms for invoice ${invoice.invoiceNumber}:`, error);
          
          // Fallback: 30-day projection
          const fallbackDate = new Date(invoice.invoiceDate);
          fallbackDate.setDate(fallbackDate.getDate() + 30);
          
          if (fallbackDate >= startDate && fallbackDate <= endDate) {
            projections.push({
              projectionDate: fallbackDate,
              projectedAmount: isCustomerInvoice ? remainingAmount : -remainingAmount,
              type: isCustomerInvoice 
                ? CashflowType.CUSTOMER_RECEIVABLE 
                : CashflowType.SUPPLIER_PAYABLE,
              status: CashflowStatus.PROJECTED,
              confidence: 0.6, // Lower confidence for fallback
              description: `Payment for invoice ${invoice.invoiceNumber} ${isCustomerInvoice ? 'from' : 'to'} ${entityName} (fallback terms)`,
              invoiceId: invoice.id
            });
          }
        }
      }
    }

    console.log(`✅ Generated ${projections.length} invoice-based projections from ${unpaidInvoices.length} unpaid invoices`);
    return projections;
  }

  /**
   * Generate bank obligation projections (facilities/loans)
   */
  async generateBankObligationProjections(startDate: Date, endDate: Date): Promise<BankObligationProjectionItem[]> {
    console.log('💳 Generating bank obligation projections...');
    
    // Get bank statements that represent facilities/loans with outstanding balances
    const bankStatements = await prisma.bankStatement.findMany({
      where: {
        AND: [
          // Must have negative balance (indicating outstanding debt)
          { endingBalance: { lt: 0 } },
          // Must be a facility account based on our simplified logic
          {
            OR: [
              { accountType: 'Facility Account' },
              { tenor: { not: null } } // Also include any account with tenor information
            ]
          }
        ]
      },
      include: {
        bank: true
      }
    });

    console.log(`🔍 Found ${bankStatements.length} bank statements with outstanding balances to process`);

    const projections: BankObligationProjectionItem[] = [];

    for (const statement of bankStatements) {
      const endingBalance = Number(statement.endingBalance);
      
      // Double-check using our utility function for consistency
      if (!isFacilityAccount(statement.accountType, endingBalance) && !statement.tenor) {
        console.log(`⚠️  Skipping ${statement.bank.name} - not recognized as a facility account`);
        continue;
      }
      
      const outstandingAmount = Math.abs(endingBalance);
      
      console.log(`📊 Processing ${statement.bank.name} - ${statement.accountType || 'Facility'}`);
      console.log(`   Outstanding amount: $${outstandingAmount.toFixed(2)}`);
      console.log(`   Tenor: ${statement.tenor || 'Not specified'}`);
      
      const statementProjections = this.generateProjectionsForOutstandingBalance(
        statement,
        outstandingAmount,
        startDate,
        endDate
      );
      
      projections.push(...statementProjections);
      console.log(`   Generated ${statementProjections.length} repayment projections`);
    }

    console.log(`✅ Generated ${projections.length} bank obligation projections from ${bankStatements.length} facility accounts`);
    return projections;
  }

  /**
   * Generate repayment projections for outstanding balance
   */
  private generateProjectionsForOutstandingBalance(
    statement: any,
    outstandingAmount: number,
    startDate: Date,
    endDate: Date
  ): BankObligationProjectionItem[] {
    const projections: BankObligationProjectionItem[] = [];
    
    if (outstandingAmount <= 0) {
      console.log(`⚠️  No outstanding amount to project for ${statement.bank.name}`);
      return projections;
    }
    
    const tenorMonths = this.parseTenor(statement.tenor);
    
    if (tenorMonths <= 0) {
      console.log(`⚠️  Invalid or missing tenor for ${statement.bank.name}, skipping projections`);
      return projections;
    }
    
    const monthlyPayment = outstandingAmount / tenorMonths;
    console.log(`💰 Monthly repayment: $${monthlyPayment.toFixed(2)} over ${tenorMonths} months`);
    
    // Start projections from the statement period end date
    let currentDate = new Date(statement.statementPeriodEnd);
    
    for (let month = 1; month <= tenorMonths; month++) {
      // Calculate next month properly, handling month-end edge cases
      const nextPaymentDate = this.addMonths(currentDate, 1);
      currentDate = nextPaymentDate;
      
      // Only include projections within the requested date range
      if (nextPaymentDate >= startDate && nextPaymentDate <= endDate) {
        projections.push({
          projectionDate: new Date(nextPaymentDate),
          projectedAmount: -monthlyPayment, // Negative because it's a payment going out
          type: CashflowType.BANK_OBLIGATION,
          status: CashflowStatus.PROJECTED,
          confidence: 0.9, // High confidence for existing obligations
          description: `${statement.bank.name} ${statement.accountType || 'facility'} repayment (${month}/${tenorMonths})`,
          bankStatementId: statement.id
        });
      }
    }
    
    return projections;
  }

  /**
   * Add months to a date, handling month-end edge cases properly
   */
  private addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    const originalDay = date.getDate();
    
    newDate.setMonth(newDate.getMonth() + months);
    
    // Handle month-end edge cases (e.g., Jan 31 + 1 month should be Feb 28/29)
    if (newDate.getDate() !== originalDay) {
      // If the day changed, it means the target month has fewer days
      // Set to the last day of the target month
      newDate.setDate(0);
    }
    
    return newDate;
  }

  /**
   * Save all projections to the centralized table
   */
  private async saveProjections(
    projections: (RecurringProjectionItem | InvoiceProjectionItem | BankObligationProjectionItem)[]
  ) {
    if (projections.length === 0) return;

    console.log(`💾 Saving ${projections.length} projections to centralized table...`);

    // Convert to Prisma format and save in batches
    const batchSize = 100;
    for (let i = 0; i < projections.length; i += batchSize) {
      const batch = projections.slice(i, i + batchSize);
      
      await prisma.cashflowProjection.createMany({
        data: batch.map(p => ({
          projectionDate: p.projectionDate,
          projectedAmount: new Decimal(p.projectedAmount),
          type: p.type,
          status: p.status,
          confidence: p.confidence,
          description: p.description,
          invoiceId: 'invoiceId' in p ? p.invoiceId : null,
          recurringPaymentId: 'recurringPaymentId' in p ? p.recurringPaymentId : null,
          bankStatementId: 'bankStatementId' in p ? p.bankStatementId : null
        }))
      });
    }

    console.log(`✅ Successfully saved ${projections.length} projections`);
  }

  /**
   * Clear existing projections in date range
   */
  private async clearExistingProjections(startDate: Date, endDate: Date) {
    console.log('🧹 Clearing existing projections in date range...');
    
    const deletedCount = await prisma.cashflowProjection.deleteMany({
      where: {
        projectionDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    console.log(`🗑️  Cleared ${deletedCount.count} existing projections`);
  }

  /**
   * Calculate next occurrence for recurring payments
   */
  private getNextOccurrence(
    currentDate: Date,
    frequency: RecurrenceFrequency,
    dayOfMonth?: number | null,
    dayOfWeek?: number | null
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        nextDate.setDate(nextDate.getDate() + 14);
        break;  
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (dayOfMonth) {
          const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
          nextDate.setDate(Math.min(dayOfMonth, lastDayOfMonth));
        }
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'SEMIANNUALLY':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'ANNUALLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  /**
   * Parse tenor string to months with comprehensive handling
   */
  private parseTenor(tenor: string | null): number {
    if (!tenor) {
      console.log('⚠️  No tenor specified, defaulting to 12 months');
      return 12; // Default to 12 months if no tenor specified
    }
    
    const cleanTenor = tenor.toLowerCase().trim();
    console.log(`🔍 Parsing tenor: "${tenor}" (cleaned: "${cleanTenor}")`);
    
    // Extract numeric value
    const numMatch = cleanTenor.match(/(\d+(?:\.\d+)?)/);
    if (!numMatch) {
      console.log('⚠️  No number found in tenor, defaulting to 12 months');
      return 12; // Default if no number found
    }
    
    const num = parseFloat(numMatch[1]);
    console.log(`📊 Extracted number: ${num}`);
    
    // Determine time unit with specific matching
    let months: number;
    
    if (cleanTenor.includes('year') || cleanTenor.includes('yr')) {
      months = Math.round(num * 12);
      console.log(`📅 Interpreted as ${num} year(s) = ${months} months`);
    } else if (cleanTenor.includes('month') || cleanTenor.includes('mon') || cleanTenor.includes('mo')) {
      months = Math.round(num);
      console.log(`📅 Interpreted as ${num} month(s)`);
    } else if (cleanTenor.includes('week') || cleanTenor.includes('wk')) {
      months = Math.round(num / 4.33); // Approximate weeks to months (52 weeks / 12 months)
      console.log(`📅 Interpreted as ${num} week(s) = ${months} months`);
    } else if (cleanTenor.includes('day') || cleanTenor.includes('d')) {
      months = Math.round(num / 30.44); // Approximate days to months (365.25 days / 12 months)
      console.log(`📅 Interpreted as ${num} day(s) = ${months} months`);
    } else {
      // If no unit specified, check the number range to make educated guess
      if (num <= 12) {
        // Likely months (1-12 range)
        months = Math.round(num);
        console.log(`⚠️  No time unit specified, assuming ${num} month(s) based on range`);
      } else if (num <= 365) {
        // Likely days (13-365 range)
        months = Math.round(num / 30.44);
        console.log(`⚠️  No time unit specified, assuming ${num} day(s) = ${months} months based on range`);
      } else {
        // Very large number, treat as days but cap at reasonable maximum
        months = Math.min(Math.round(num / 30.44), 120); // Cap at 10 years
        console.log(`⚠️  Large number ${num} assumed as days, capped at ${months} months`);
      }
    }
    
    // Ensure reasonable bounds (minimum 1 month, maximum 10 years)
    months = Math.max(1, Math.min(months, 120));
    
    console.log(`✅ Final tenor: ${months} months`);
    return months;
  }

  /**
   * Calculate confidence for invoice projections
   */
  private calculateInvoiceConfidence(invoice: any, paymentTerms: PaymentTermsData, amount: number): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on payment terms complexity
    if (paymentTerms.paymentPeriod === 'Net 30') {
      confidence += 0.1; // Standard terms are more predictable
    }
    
    // Adjust based on invoice age
    const invoiceAge = Date.now() - new Date(invoice.invoiceDate).getTime();
    const daysSinceInvoice = invoiceAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceInvoice > 90) {
      confidence -= 0.2; // Older invoices are less predictable
    }
    
    // Adjust based on amount
    if (amount > 100000) {
      confidence -= 0.1; // Large amounts might have delays
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Get all projections for display
   */
  async getProjections(startDate: Date, endDate: Date, filters?: {
    types?: CashflowType[];
    statuses?: CashflowStatus[];
  }) {
    const whereClause: any = {
      projectionDate: {
        gte: startDate,
        lte: endDate
      }
    };

    if (filters?.types && filters.types.length > 0) {
      whereClause.type = { in: filters.types };
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      whereClause.status = { in: filters.statuses };
    }

    return await prisma.cashflowProjection.findMany({
      where: whereClause,
      include: {
        Invoice: {
          include: {
            Customer: { select: { name: true } },
            Supplier: { select: { name: true } }
          }
        },
        RecurringPayment: true,
        BankStatement: {
          include: {
            bank: { select: { name: true } }
          }
        }
      },
      orderBy: { projectionDate: 'asc' }
    });
  }
} 