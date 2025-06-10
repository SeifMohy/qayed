import { prisma } from '@/lib/prisma';
import { CashflowType, CashflowStatus } from '@prisma/client';
import { PaymentTermsCalculator } from './paymentTermsCalculator';
import type { PaymentTermsData } from '@/types/paymentTerms';
import { Decimal } from '@prisma/client/runtime/library';
import { isFacilityAccount } from '@/utils/bankStatementUtils';

interface ProjectionItem {
  projectionDate: Date;
  projectedAmount: number;
  type: CashflowType;
  status: CashflowStatus;
  confidence: number;
  description: string;
  invoiceId: number;
}

export class CashflowProjectionService {
  
  /**
   * Generate comprehensive cashflow projections from all sources within a date range
   */
  async generateProjectionsFromInvoices(startDate: Date, endDate: Date) {
    console.log('🔄 Generating comprehensive cashflow projections...');
    console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    // Clear ALL existing projections for the date range to avoid duplicates
    await this.clearExistingProjections(startDate, endDate);
    
    // Generate customer receivables and supplier payables
    const [customerProjections, supplierProjections] = await Promise.all([
      this.generateCustomerReceivables(startDate, endDate),
      this.generateSupplierPayables(startDate, endDate)
    ]);
    
    const invoiceProjections = [...customerProjections, ...supplierProjections];
    
    if (invoiceProjections.length > 0) {
      // Insert invoice projections in batches for better performance
      await prisma.cashflowProjection.createMany({
        data: invoiceProjections.map(p => ({
          projectionDate: p.projectionDate,
          projectedAmount: new Decimal(p.projectedAmount),
          type: p.type,
          status: p.status,
          confidence: p.confidence,
          description: p.description,
          invoiceId: p.invoiceId
        }))
      });
      
      console.log(`✅ Generated ${invoiceProjections.length} invoice-based projections`);
      console.log(`   - Customer receivables: ${customerProjections.length}`);
      console.log(`   - Supplier payables: ${supplierProjections.length}`);
      
      // Update invoice expected payment dates
      await this.updateInvoiceExpectedPayments(invoiceProjections);
    } else {
      console.log('ℹ️  No invoice projections generated - no unpaid invoices in date range');
    }
    
    console.log('✅ Invoice projection generation completed');
    
    // Return combined count
    const allProjections = [...invoiceProjections];
    return allProjections;
  }

  /**
   * Generate projections for customer receivables (money coming in)
   */
  async generateCustomerReceivables(startDate: Date, endDate: Date): Promise<ProjectionItem[]> {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        customerId: { not: null },
        invoiceDate: { gte: new Date('2023-01-01') } // Get recent invoices only
      },
      include: {
        Customer: {
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
                creditAmount: true
              }
            }
          }
        }
      }
    });

    const projections: ProjectionItem[] = [];
    
    for (const invoice of unpaidInvoices) {
      // Calculate how much has been paid already
      const paidAmount = invoice.TransactionMatch.reduce(
        (sum, match) => sum + Number(match.Transaction.creditAmount || 0), 0
      );
      
      const remainingAmount = Number(invoice.total) - paidAmount;
      
      // Only create projections for invoices with outstanding amounts
      if (remainingAmount > 0.01) {
        const customerName = invoice.Customer?.name || 'Unknown Customer';
        const paymentTerms = (invoice.Customer?.paymentTermsData as unknown as PaymentTermsData) || { 
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
            
            // Only include projections within our date range
            if (projectionDate >= startDate && projectionDate <= endDate) {
              projections.push({
                projectionDate,
                projectedAmount: payment.amount,
                type: CashflowType.CUSTOMER_RECEIVABLE,
                status: CashflowStatus.PROJECTED,
                confidence: this.calculateConfidence(invoice, paymentTerms, remainingAmount),
                description: `${payment.description} for invoice ${invoice.invoiceNumber} from ${customerName}`,
                invoiceId: invoice.id
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error processing payment terms for invoice ${invoice.invoiceNumber}:`, error);
          
          // Fallback: create simple 30-day projection
          const fallbackDate = new Date(invoice.invoiceDate);
          fallbackDate.setDate(fallbackDate.getDate() + 30);
          
          if (fallbackDate >= startDate && fallbackDate <= endDate) {
            projections.push({
              projectionDate: fallbackDate,
              projectedAmount: remainingAmount,
              type: CashflowType.CUSTOMER_RECEIVABLE,
              status: CashflowStatus.PROJECTED,
              confidence: 0.6, // Lower confidence due to fallback
              description: `Payment for invoice ${invoice.invoiceNumber} from ${customerName} (fallback terms)`,
              invoiceId: invoice.id
            });
          }
        }
      }
    }
    
    return projections;
  }

  /**
   * Generate projections for supplier payables (money going out)
   */
  async generateSupplierPayables(startDate: Date, endDate: Date): Promise<ProjectionItem[]> {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        supplierId: { not: null },
        invoiceDate: { gte: new Date('2023-01-01') }
      },
      include: {
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
                debitAmount: true
              }
            }
          }
        }
      }
    });

    const projections: ProjectionItem[] = [];
    
    for (const invoice of unpaidInvoices) {
      // Calculate how much has been paid already
      const paidAmount = invoice.TransactionMatch.reduce(
        (sum, match) => sum + Number(match.Transaction.debitAmount || 0), 0
      );
      
      const remainingAmount = Number(invoice.total) - paidAmount;
      
      if (remainingAmount > 0.01) {
        const supplierName = invoice.Supplier?.name || 'Unknown Supplier';
        const paymentTerms = (invoice.Supplier?.paymentTermsData as unknown as PaymentTermsData) || { 
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
                projectedAmount: -payment.amount, // Negative for outflows
                type: CashflowType.SUPPLIER_PAYABLE,
                status: CashflowStatus.PROJECTED,
                confidence: this.calculateConfidence(invoice, paymentTerms, remainingAmount),
                description: `${payment.description} for invoice ${invoice.invoiceNumber} to ${supplierName}`,
                invoiceId: invoice.id
              });
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error processing payment terms for supplier invoice ${invoice.invoiceNumber}:`, error);
          
          // Fallback: create simple 30-day projection
          const fallbackDate = new Date(invoice.invoiceDate);
          fallbackDate.setDate(fallbackDate.getDate() + 30);
          
          if (fallbackDate >= startDate && fallbackDate <= endDate) {
            projections.push({
              projectionDate: fallbackDate,
              projectedAmount: -remainingAmount, // Negative for outflows
              type: CashflowType.SUPPLIER_PAYABLE,
              status: CashflowStatus.PROJECTED,
              confidence: 0.6,
              description: `Payment for invoice ${invoice.invoiceNumber} to ${supplierName} (fallback terms)`,
              invoiceId: invoice.id
            });
          }
        }
      }
    }
    
    return projections;
  }

  /**
   * Calculate confidence score based on various factors
   */
  private calculateConfidence(invoice: any, paymentTerms: PaymentTermsData, amount: number): number {
    let confidence = 0.8; // Base confidence
    
    // Adjust based on invoice age
    const daysSinceInvoice = Math.floor((Date.now() - invoice.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceInvoice > 90) {
      confidence -= 0.2; // Older invoices are less certain
    } else if (daysSinceInvoice > 30) {
      confidence -= 0.1;
    }
    
    // Adjust based on amount (larger amounts might have more delays)
    if (amount > 100000) {
      confidence -= 0.1;
    } else if (amount > 50000) {
      confidence -= 0.05;
    }
    
    // Adjust based on payment terms complexity
    if (paymentTerms.installments && paymentTerms.installments.length > 0) {
      confidence += 0.1; // Installments might be more predictable
    }
    
    if (paymentTerms.downPayment?.required) {
      confidence += 0.05; // Down payments show commitment
    }
    
    // Ensure confidence stays within bounds
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Update invoice records with expected payment dates
   */
  private async updateInvoiceExpectedPayments(projections: ProjectionItem[]) {
    const invoiceUpdates = new Map<number, any[]>();
    
    // Group projections by invoice
    projections.forEach(projection => {
      if (!invoiceUpdates.has(projection.invoiceId)) {
        invoiceUpdates.set(projection.invoiceId, []);
      }
      
      invoiceUpdates.get(projection.invoiceId)!.push({
        date: projection.projectionDate.toISOString(),
        amount: Math.abs(projection.projectedAmount),
        description: projection.description,
        type: projection.type === CashflowType.CUSTOMER_RECEIVABLE ? 'receivable' : 'payable'
      });
    });
    
    // Update invoices with expected payment dates
    for (const [invoiceId, payments] of invoiceUpdates) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          expectedPaymentDates: {
            payments,
            totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            generatedAt: new Date().toISOString(),
            basedOnTerms: 'Calculated from payment terms'
          }
        }
      });
    }
  }

  /**
   * Clear existing projections for a date range to avoid duplicates
   * This clears ALL projections (invoice, recurring, bank facility) to ensure clean regeneration
   */
  private async clearExistingProjections(startDate: Date, endDate: Date) {
    console.log(`🗑️  Clearing ALL existing projections for date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const deleted = await prisma.cashflowProjection.deleteMany({
      where: {
        projectionDate: {
          gte: startDate,
          lte: endDate
        }
        // Removed invoiceId filter - now clears ALL projections (invoice, bank facility, recurring)
      }
    });
    
    if (deleted.count > 0) {
      console.log(`🗑️  Cleared ${deleted.count} existing projections (all types) for date range`);
    } else {
      console.log(`ℹ️  No existing projections found in date range to clear`);
    }
  }

  /**
   * Get projections with filtering and pagination
   */
  async getProjections(
    startDate: Date, 
    endDate: Date, 
    type?: CashflowType[], 
    status?: CashflowStatus[]
  ) {
    const where: any = {
      projectionDate: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (type && type.length > 0) {
      where.type = { in: type };
    }
    
    if (status && status.length > 0) {
      where.status = { in: status };
    }
    
    return await prisma.cashflowProjection.findMany({
      where,
      include: {
        Invoice: {
          include: {
            Customer: { select: { name: true } },
            Supplier: { select: { name: true } }
          }
        },
        RecurringPayment: {
          select: {
            name: true,
            category: true,
            frequency: true,
            isActive: true
          }
        },
        BankStatement: {
          select: {
            id: true,
            bankName: true,
            accountType: true,
            endingBalance: true,
            bank: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { projectionDate: 'asc' }
    });
  }

  /**
   * Get the latest cash balance from bank statements
   * This matches the logic used on the banks page for calculating total cash on hand
   */
  async getLatestCashBalance(): Promise<{ balance: number; date: Date; statementId?: number }> {
    try {
      console.log('🔍 Searching for latest cash balance from bank statements...');
      
      // Get all validated and processed bank statements (matching banks page logic)
      const allStatements = await prisma.bankStatement.findMany({
        where: {
          // validated: true, // REMOVED
          // processingStatus: "processed" // REMOVED
        },
        include: {
          transactions: {
            orderBy: { transactionDate: 'desc' },
            take: 1,
            select: {
              balance: true,
              transactionDate: true
            }
          }
        },
        orderBy: { statementPeriodEnd: 'desc' }
      });

      console.log(`📋 Found ${allStatements.length} validated bank statements`);

      if (allStatements.length === 0) {
        console.warn('⚠️  No bank statements found, using balance of 0');
        return {
          balance: 0,
          date: new Date(),
          statementId: undefined
        };
      }

      // Calculate total cash balance by including all regular account balances (positive and negative)
      let totalCashBalance = 0;
      let latestDate = new Date(0); // Start with earliest possible date
      let latestStatementId

      // Group by account to get latest statement for each account (matching dashboard logic): number | undefined;

      allStatements.forEach(statement => {
        const endingBalance = Number(statement.endingBalance || 0);
        
        // Check if this is a facility account using the utility function
        const isFacility = isFacilityAccount(statement.accountType, endingBalance);
        
        // Only include regular accounts (not facilities) in cash total
        // This includes negative balances from current accounts
        if (!isFacility) {
          totalCashBalance += endingBalance;
          console.log(`💰 Adding statement ${statement.id}: ${endingBalance.toLocaleString()} (${statement.accountType || 'Unknown Type'}) (Period: ${statement.statementPeriodStart.toISOString().split('T')[0]} to ${statement.statementPeriodEnd.toISOString().split('T')[0]})`);
        } else {
          console.log(`🏦 Skipping facility account ${statement.id}: ${endingBalance.toLocaleString()} (${statement.accountType || 'Unknown Type'})`);
        }
        
        // Track the most recent statement end date
        if (statement.statementPeriodEnd > latestDate) {
          latestDate = statement.statementPeriodEnd;
          latestStatementId = statement.id;
        }
      });

      console.log(`💰 Total cash balance calculated: ${totalCashBalance.toLocaleString()}`);
      console.log(`📅 Latest statement date: ${latestDate.toISOString().split('T')[0]}`);
      console.log(`🏦 Most recent statement ID: ${latestStatementId}`);

      // Return the total cash balance (can be negative for current accounts)
      if (allStatements.length > 0) {
        return {
          balance: totalCashBalance,
          date: latestDate,
          statementId: latestStatementId
        };
      }

      // Fallback: if no positive balances, try to use the latest transaction balance from the most recent statement
      const latestStatement = allStatements[0]; // Already sorted by statementPeriodEnd desc
      if (latestStatement && latestStatement.transactions.length > 0) {
        const latestTransaction = latestStatement.transactions[0];
        console.log(`💰 Using latest transaction balance as fallback: ${Number(latestTransaction.balance || 0)} on ${latestTransaction.transactionDate.toISOString().split('T')[0]}`);
        return {
          balance: Number(latestTransaction.balance || 0),
          date: latestTransaction.transactionDate,
          statementId: latestStatement.id
        };
      }

      // Final fallback: use the latest statement's ending balance even if negative
      if (latestStatement) {
        console.log(`💰 Using latest statement ending balance as final fallback: ${Number(latestStatement.endingBalance || 0)} on ${latestStatement.statementPeriodEnd.toISOString().split('T')[0]}`);
        return {
          balance: Number(latestStatement.endingBalance || 0),
          date: latestStatement.statementPeriodEnd,
          statementId: latestStatement.id
        };
      }

      // Absolute fallback
      console.warn('⚠️  No usable bank statements found, using balance of 0');
      return {
        balance: 0,
        date: new Date(),
        statementId: undefined
      };
    } catch (error) {
      console.error('❌ Error getting latest cash balance:', error);
      return {
        balance: 0,
        date: new Date(),
        statementId: undefined
      };
    }
  }

  /**
   * Calculate daily cash position for a date range
   */
  async calculateCashPosition(startDate: Date, endDate: Date) {
    // Get the actual starting balance from latest bank statements
    const { balance: startingBalance, date: latestBalanceDate } = await this.getLatestCashBalance();
    
    console.log(`💰 Starting cash position calculation:`);
    console.log(`   - Starting balance: ${startingBalance.toLocaleString()}`);
    console.log(`   - Latest balance date: ${latestBalanceDate.toISOString().split('T')[0]}`);
    console.log(`   - Projection range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Adjust start date to be at least from the latest balance date
    const effectiveStartDate = startDate < latestBalanceDate ? latestBalanceDate : startDate;
    
    const projections = await this.getProjections(effectiveStartDate, endDate);
    
    // Group projections by date
    const dailyPositions = new Map<string, any>();
    let runningBalance = startingBalance;
    
    // Create a complete date range from effective start to end date
    const currentDate = new Date(effectiveStartDate);
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
        const amount = Number(projection.projectedAmount);
        
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
    
    return {
      positions,
      metadata: {
        startingBalance,
        latestBalanceDate: latestBalanceDate.toISOString().split('T')[0],
        effectiveStartDate: effectiveStartDate.toISOString().split('T')[0],
        projectionRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    };
  }

  /**
   * Generate summary statistics for projections
   */
  async generateSummary(startDate: Date, endDate: Date) {
    const projections = await this.getProjections(startDate, endDate);
    
    const totalInflows = projections.reduce(
      (sum, p) => sum + (Number(p.projectedAmount) > 0 ? Number(p.projectedAmount) : 0), 0
    );
    
    const totalOutflows = projections.reduce(
      (sum, p) => sum + (Number(p.projectedAmount) < 0 ? Math.abs(Number(p.projectedAmount)) : 0), 0
    );
    
    return {
      totalInflows,
      totalOutflows,
      netCashflow: totalInflows - totalOutflows,
      totalItems: projections.length,
      projectedItems: projections.filter(p => p.status === 'PROJECTED').length,
      confirmedItems: projections.filter(p => p.status === 'CONFIRMED').length,
      averageConfidence: projections.length > 0 
        ? projections.reduce((sum, p) => sum + p.confidence, 0) / projections.length 
        : 0,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    };
  }
} 