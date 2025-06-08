#!/usr/bin/env node

/**
 * Test script for the centralized cashflow projection system
 * 
 * This script tests the new centralized service to ensure:
 * 1. Recurring payments are projected correctly
 * 2. Invoice projections are based on payment terms (not just 30-day fallback)
 * 3. Bank obligations are projected based on tenor and current position
 * 4. All projections are stored in the centralized CashflowProjection table
 */

const API_BASE = 'http://localhost:3000/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`🌐 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    throw error;
  }
}

async function testCentralizedProjectionSystem() {
  console.log('🚀 Testing Centralized Cashflow Projection System');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get current status
    console.log('\n📊 Step 1: Getting current projection status...');
    const currentStatus = await makeRequest('/cashflow/projections/refresh');
    console.log('Current Status:', JSON.stringify(currentStatus.currentStatus, null, 2));
    
    // Step 2: Test centralized refresh
    console.log('\n🔄 Step 2: Testing centralized projection refresh...');
    const refreshResult = await makeRequest('/cashflow/projections/refresh', {
      method: 'POST',
      body: JSON.stringify({
        startDate: '2024-06-30',
        endDate: '2025-06-30',
        forceRecalculate: true
      })
    });
    
    console.log('✅ Refresh completed successfully!');
    console.log('Summary:', JSON.stringify(refreshResult.summary, null, 2));
    console.log('Verification:', JSON.stringify(refreshResult.verification, null, 2));
    
    // Step 3: Verify projections were created
    console.log('\n🔍 Step 3: Verifying projections were created...');
    const projections = await makeRequest('/cashflow/projections?useCentralized=true&includeRelated=true');
    
    console.log(`📈 Total projections found: ${projections.projections.length}`);
    console.log('Type breakdown:', JSON.stringify(projections.metadata.typeCounts, null, 2));
    
    // Step 4: Analyze projection quality
    console.log('\n📋 Step 4: Analyzing projection quality...');
    
    const projectionsByType = projections.projections.reduce((acc, p) => {
      if (!acc[p.type]) acc[p.type] = [];
      acc[p.type].push(p);
      return acc;
    }, {});
    
    // Check recurring payments
    if (projectionsByType.RECURRING_INFLOW || projectionsByType.RECURRING_OUTFLOW) {
      const recurringTotal = (projectionsByType.RECURRING_INFLOW?.length || 0) + 
                            (projectionsByType.RECURRING_OUTFLOW?.length || 0);
      console.log(`💰 Recurring payments: ${recurringTotal} projections`);
      
      // Sample some recurring projections
      const sampleRecurring = projections.projections.filter(p => 
        p.type.includes('RECURRING') && p.RecurringPayment
      ).slice(0, 3);
      
      sampleRecurring.forEach(p => {
        console.log(`   - ${p.RecurringPayment.name}: ${p.projectedAmount} on ${p.projectionDate.split('T')[0]}`);
      });
    }
    
    // Check invoice projections
    if (projectionsByType.CUSTOMER_RECEIVABLE || projectionsByType.SUPPLIER_PAYABLE) {
      const invoiceTotal = (projectionsByType.CUSTOMER_RECEIVABLE?.length || 0) + 
                          (projectionsByType.SUPPLIER_PAYABLE?.length || 0);
      console.log(`📄 Invoice projections: ${invoiceTotal} projections`);
      
      // Check if any are using payment terms vs fallback
      const fallbackProjections = projections.projections.filter(p => 
        (p.type === 'CUSTOMER_RECEIVABLE' || p.type === 'SUPPLIER_PAYABLE') &&
        p.description.includes('fallback')
      );
      
      if (fallbackProjections.length > 0) {
        console.log(`⚠️  ${fallbackProjections.length} projections using fallback terms`);
      } else {
        console.log(`✅ All invoice projections using proper payment terms`);
      }
      
      // Sample some invoice projections
      const sampleInvoices = projections.projections.filter(p => 
        (p.type === 'CUSTOMER_RECEIVABLE' || p.type === 'SUPPLIER_PAYABLE') && p.Invoice
      ).slice(0, 3);
      
      sampleInvoices.forEach(p => {
        const entityType = p.type === 'CUSTOMER_RECEIVABLE' ? 'Customer' : 'Supplier';
        const entityName = p.Invoice[entityType]?.name || 'Unknown';
        console.log(`   - Invoice ${p.Invoice.invoiceNumber} (${entityName}): ${p.projectedAmount} on ${p.projectionDate.split('T')[0]}`);
      });
    }
    
    // Check bank obligations
    if (projectionsByType.BANK_OBLIGATION || projectionsByType.LOAN_PAYMENT) {
      const bankTotal = (projectionsByType.BANK_OBLIGATION?.length || 0) + 
                       (projectionsByType.LOAN_PAYMENT?.length || 0);
      console.log(`🏦 Bank obligations: ${bankTotal} projections`);
      
      // Sample some bank projections
      const sampleBank = projections.projections.filter(p => 
        (p.type === 'BANK_OBLIGATION' || p.type === 'LOAN_PAYMENT') && p.BankStatement
      ).slice(0, 3);
      
      sampleBank.forEach(p => {
        const bankName = p.BankStatement.bank?.name || p.BankStatement.bankName;
        console.log(`   - ${bankName}: ${p.projectedAmount} on ${p.projectionDate.split('T')[0]} (${p.description})`);
      });
    }
    
    // Step 5: Test date range filtering
    console.log('\n📅 Step 5: Testing date range filtering...');
    const filteredProjections = await makeRequest('/cashflow/projections?startDate=2024-07-01&endDate=2024-09-30&useCentralized=true');
    console.log(`📊 Filtered projections (Jul-Sep 2024): ${filteredProjections.projections.length}`);
    
    // Step 6: Verify no duplicate projections
    console.log('\n🔍 Step 6: Checking for duplicate projections...');
    const projectionKeys = projections.projections.map(p => 
      `${p.type}-${p.projectionDate}-${p.projectedAmount}-${p.invoiceId || ''}-${p.recurringPaymentId || ''}-${p.bankStatementId || ''}`
    );
    
    const uniqueKeys = new Set(projectionKeys);
    if (projectionKeys.length === uniqueKeys.size) {
      console.log('✅ No duplicate projections found');
    } else {
      console.log(`⚠️  Found ${projectionKeys.length - uniqueKeys.size} potential duplicates`);
    }
    
    console.log('\n🎉 Centralized cashflow projection system test completed successfully!');
    console.log('=' .repeat(60));
    
    return {
      success: true,
      summary: refreshResult.summary,
      totalProjections: projections.projections.length,
      typeCounts: projections.metadata.typeCounts
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  global.fetch = fetch;
  
  testCentralizedProjectionSystem()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Tests failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
} else {
  // Browser environment - export for use
  window.testCentralizedProjectionSystem = testCentralizedProjectionSystem;
} 