#!/usr/bin/env tsx

import { TransactionCurrencyService } from '../src/lib/services/transactionCurrencyService';

async function main() {
  console.log('🚀 Starting Transaction Currency Sync Script...\n');

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

    if (initialStats.transactionsWithoutCurrency === 0) {
      console.log('\n✅ All transactions already have currency! No sync needed.');
      return;
    }

    // Run the sync
    console.log('\n🔄 Running currency sync...');
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

    console.log('\n✅ Currency sync completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during currency sync:', error);
    process.exit(1);
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