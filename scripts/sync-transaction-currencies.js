const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TransactionCurrencyService {
  static async syncTransactionCurrencies() {
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
          not: ''
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

  static async getCurrencyStatistics() {
    const totalTransactions = await prisma.transaction.count();
    
    const transactionsWithCurrency = await prisma.transaction.count({
      where: {
        currency: {
          not: null,
          not: ''
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

async function main() {
  console.log('🚀 Starting FORCE Transaction Currency Sync Script...\n');
  console.log('⚠️  This will update ALL transactions to match their bank statement currency!\n');

  try {
    // Get initial statistics
    console.log('📊 Getting initial statistics...');
    const initialStats = await TransactionCurrencyService.getCurrencyStatistics();
    
    console.log('\n📈 Initial Statistics:');
    console.log(`   Total Transactions: ${initialStats.totalTransactions}`);
    console.log(`   With Currency: ${initialStats.transactionsWithCurrency} (${initialStats.coveragePercentage}%)`);
    console.log(`   Without Currency: ${initialStats.transactionsWithoutCurrency}`);
    
    console.log('\n💰 Currency Breakdown:');
    initialStats.currencyBreakdown.forEach(item => {
      const currency = item.currency || 'NULL';
      console.log(`   ${currency}: ${item.count} transactions`);
    });

    // Always run the sync since we're doing a force sync
    console.log('\n🔄 Running FORCE currency sync...');
    const syncResults = await TransactionCurrencyService.syncTransactionCurrencies();

    // Get final statistics
    console.log('\n📊 Getting final statistics...');
    const finalStats = await TransactionCurrencyService.getCurrencyStatistics();

    console.log('\n📈 Final Statistics:');
    console.log(`   Total Transactions: ${finalStats.totalTransactions}`);
    console.log(`   With Currency: ${finalStats.transactionsWithCurrency} (${finalStats.coveragePercentage}%)`);
    console.log(`   Without Currency: ${finalStats.transactionsWithoutCurrency}`);

    console.log('\n💰 Final Currency Breakdown:');
    finalStats.currencyBreakdown.forEach(item => {
      const currency = item.currency || 'NULL';
      console.log(`   ${currency}: ${item.count} transactions`);
    });

    console.log('\n📋 Sync Summary:');
    console.log(`   Updated: ${syncResults.updatedCount} transactions`);
    console.log(`   Skipped: ${syncResults.skippedCount} transactions`);
    console.log(`   Coverage improved: ${initialStats.coveragePercentage}% → ${finalStats.coveragePercentage}%`);

    console.log('\n✅ FORCE currency sync completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during currency sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
} 