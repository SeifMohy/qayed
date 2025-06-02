// Simple test script for cashflow projections
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCashflowProjections() {
  try {
    console.log('🧪 Testing Cashflow Projection System...');
    
    // Test 1: Check if CashflowProjection table exists
    console.log('\n1. Testing database connection...');
    const projectionsCount = await prisma.cashflowProjection.count();
    console.log(`✅ CashflowProjection table exists with ${projectionsCount} records`);
    
    // Test 2: Check if we have invoices to work with
    console.log('\n2. Checking invoice data...');
    const customerInvoicesCount = await prisma.invoice.count({
      where: { customerId: { not: null } }
    });
    const supplierInvoicesCount = await prisma.invoice.count({
      where: { supplierId: { not: null } }
    });
    console.log(`📄 Found ${customerInvoicesCount} customer invoices and ${supplierInvoicesCount} supplier invoices`);
    
    // Test 3: Check if customers/suppliers have payment terms
    const customersWithTerms = await prisma.customer.count({
      where: { paymentTermsData: { not: null } }
    });
    const suppliersWithTerms = await prisma.supplier.count({
      where: { paymentTermsData: { not: null } }
    });
    console.log(`💳 Found ${customersWithTerms} customers and ${suppliersWithTerms} suppliers with payment terms`);
    
    // Test 4: Sample invoice with payment terms
    const sampleInvoice = await prisma.invoice.findFirst({
      where: { customerId: { not: null } },
      include: {
        Customer: { select: { name: true, paymentTermsData: true } },
        TransactionMatch: {
          where: { status: 'APPROVED' },
          include: { Transaction: { select: { creditAmount: true } } }
        }
      }
    });
    
    if (sampleInvoice) {
      console.log('\n📋 Sample invoice:');
      console.log(`   Invoice: ${sampleInvoice.invoiceNumber}`);
      console.log(`   Customer: ${sampleInvoice.Customer?.name}`);
      console.log(`   Total: $${sampleInvoice.total}`);
      console.log(`   Payment Terms:`, sampleInvoice.Customer?.paymentTermsData);
      
      // Calculate paid amount
      const paidAmount = sampleInvoice.TransactionMatch.reduce(
        (sum, match) => sum + Number(match.Transaction.creditAmount || 0), 0
      );
      const remainingAmount = Number(sampleInvoice.total) - paidAmount;
      console.log(`   Paid: $${paidAmount}, Remaining: $${remainingAmount}`);
    }
    
    console.log('\n✅ Database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCashflowProjections(); 