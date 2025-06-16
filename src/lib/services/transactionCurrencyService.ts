import { prisma } from '@/lib/prisma';

export class TransactionCurrencyService {
  /**
   * Sync transaction currencies with their bank statement's accountCurrency
   * This updates ALL transactions to match their statement's currency (force sync)
   */
  static async syncTransactionCurrencies(): Promise<{
    totalTransactions: number;
    transactionsWithCurrency: number;
    transactionsWithoutCurrency: number;
    updatedCount: number;
    skippedCount: number;
    coveragePercentage: number;
  }> {
    console.log('🔄 Starting FORCE transaction currency sync (updating ALL transactions)...');

    // Get ALL transactions (not just ones without currency)
    const transactionsToUpdate = await prisma.transaction.findMany({
      include: {
        bankStatement: true
      }
    });

    console.log(`📊 Found ${transactionsToUpdate.length} total transactions to force sync`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactionsToUpdate.length; i += batchSize) {
      const batch = transactionsToUpdate.slice(i, i + batchSize);

      for (const transaction of batch) {
        const accountCurrency = transaction.bankStatement.accountCurrency;
        
        if (accountCurrency && accountCurrency.trim() !== '') {
          try {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { currency: accountCurrency }
            });
            updatedCount++;
            
            // Log if we're overwriting an existing currency
            if (transaction.currency && transaction.currency !== accountCurrency) {
              console.log(`🔄 Overwriting transaction ${transaction.id} currency from ${transaction.currency} to ${accountCurrency}`);
            }
          } catch (error) {
            console.error(`❌ Failed to update transaction ${transaction.id}:`, error);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  Skipping transaction ${transaction.id} - bank statement has no accountCurrency`);
          skippedCount++;
        }
      }

      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, transactionsToUpdate.length)}/${transactionsToUpdate.length})`);
    }

    // Get final statistics
    const totalTransactions = await prisma.transaction.count();
    const transactionsWithCurrency = await prisma.transaction.count({
      where: {
        currency: {
          not: null,
        },
        AND: {
          currency: {
            not: ''
          }
        }
      }
    });
    const transactionsWithoutCurrency = totalTransactions - transactionsWithCurrency;
    const coveragePercentage = Math.round((transactionsWithCurrency / totalTransactions) * 100);

    console.log('✨ FORCE transaction currency sync completed!');

    return {
      totalTransactions,
      transactionsWithCurrency,
      transactionsWithoutCurrency,
      updatedCount,
      skippedCount,
      coveragePercentage
    };
  }

  /**
   * Sync only transactions that are missing currency (gentle sync)
   */
  static async syncMissingTransactionCurrencies(): Promise<{
    totalTransactions: number;
    transactionsWithCurrency: number;
    transactionsWithoutCurrency: number;
    updatedCount: number;
    skippedCount: number;
    coveragePercentage: number;
  }> {
    console.log('🔄 Starting gentle transaction currency sync (only missing currencies)...');

    // Get all transactions that need currency updates
    const transactionsToUpdate = await prisma.transaction.findMany({
      where: {
        OR: [
          { currency: null },
          { currency: '' }
        ]
      },
      include: {
        bankStatement: true
      }
    });

    console.log(`📊 Found ${transactionsToUpdate.length} transactions without currency`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactionsToUpdate.length; i += batchSize) {
      const batch = transactionsToUpdate.slice(i, i + batchSize);

      for (const transaction of batch) {
        const accountCurrency = transaction.bankStatement.accountCurrency;
        
        if (accountCurrency && accountCurrency.trim() !== '') {
          try {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { currency: accountCurrency }
            });
            updatedCount++;
          } catch (error) {
            console.error(`❌ Failed to update transaction ${transaction.id}:`, error);
            skippedCount++;
          }
        } else {
          console.log(`⚠️  Skipping transaction ${transaction.id} - bank statement has no accountCurrency`);
          skippedCount++;
        }
      }

      console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, transactionsToUpdate.length)}/${transactionsToUpdate.length})`);
    }

    // Get final statistics
    const totalTransactions = await prisma.transaction.count();
    const transactionsWithCurrency = await prisma.transaction.count({
      where: {
        currency: {
          not: null,
        },
        AND: {
          currency: {
            not: ''
          }
        }
      }
    });
    const transactionsWithoutCurrency = totalTransactions - transactionsWithCurrency;
    const coveragePercentage = Math.round((transactionsWithCurrency / totalTransactions) * 100);

    console.log('✨ Gentle transaction currency sync completed!');

    return {
      totalTransactions,
      transactionsWithCurrency,
      transactionsWithoutCurrency,
      updatedCount,
      skippedCount,
      coveragePercentage
    };
  }

  /**
   * Ensure a specific transaction has the correct currency from its bank statement
   */
  static async ensureTransactionCurrency(transactionId: number): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { bankStatement: true }
      });

      if (!transaction) {
        console.error(`Transaction ${transactionId} not found`);
        return false;
      }

      const accountCurrency = transaction.bankStatement.accountCurrency;
      
      if (!accountCurrency || accountCurrency.trim() === '') {
        console.log(`⚠️  Bank statement for transaction ${transactionId} has no accountCurrency`);
        return false;
      }

      if (transaction.currency !== accountCurrency) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { currency: accountCurrency }
        });
        console.log(`🔄 Updated transaction ${transactionId} currency to ${accountCurrency}`);
        return true;
      }

      return false; // No update needed
    } catch (error) {
      console.error(`❌ Failed to ensure currency for transaction ${transactionId}:`, error);
      return false;
    }
  }

  /**
   * Update all transactions for a specific bank statement with the statement's currency
   */
  static async updateTransactionsCurrencyForStatement(bankStatementId: number, newCurrency: string): Promise<number> {
    try {
      const result = await prisma.transaction.updateMany({
        where: { bankStatementId },
        data: { currency: newCurrency }
      });

      console.log(`🔄 Updated ${result.count} transactions for bank statement ${bankStatementId} to currency ${newCurrency}`);
      return result.count;
    } catch (error) {
      console.error(`❌ Failed to update transactions currency for bank statement ${bankStatementId}:`, error);
      return 0;
    }
  }

  /**
   * Get currency statistics for the database
   */
  static async getCurrencyStatistics(): Promise<{
    totalTransactions: number;
    transactionsWithCurrency: number;
    transactionsWithoutCurrency: number;
    coveragePercentage: number;
    currencyBreakdown: Array<{ currency: string | null; count: number }>;
  }> {
    const totalTransactions = await prisma.transaction.count();
    
    const transactionsWithCurrency = await prisma.transaction.count({
      where: {
        currency: {
          not: null,
        },
        AND: {
          currency: {
            not: ''
          }
        }
      }
    });

    const transactionsWithoutCurrency = totalTransactions - transactionsWithCurrency;
    const coveragePercentage = totalTransactions > 0 ? Math.round((transactionsWithCurrency / totalTransactions) * 100) : 0;

    // Get currency breakdown
    const currencyBreakdown = await prisma.transaction.groupBy({
      by: ['currency'],
      _count: {
        currency: true
      },
      orderBy: {
        _count: {
          currency: 'desc'
        }
      }
    });

    return {
      totalTransactions,
      transactionsWithCurrency,
      transactionsWithoutCurrency,
      coveragePercentage,
      currencyBreakdown: currencyBreakdown.map(item => ({
        currency: item.currency,
        count: item._count.currency
      }))
    };
  }
} 