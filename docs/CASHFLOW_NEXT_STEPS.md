# Cashflow Projection Module - Next Steps

## Overview

This document outlines the immediate next steps to begin implementing the **streamlined 4-phase** cashflow projection module for your financial management system. The implementation builds incrementally on your existing robust foundation and delivers immediate value at each phase.

## Prerequisites Completed ✅

- **System Analysis**: Comprehensive review of existing Prisma schema and payment terms structure
- **Streamlined Implementation Plan**: 4-phase roadmap focused on practical delivery
- **Phase-Specific Schema Design**: Incremental database changes with clear upgrade paths
- **Phase-Organized Type Definitions**: TypeScript interfaces organized by implementation phase
- **Architecture Planning**: Service layer design optimized for incremental development

## Streamlined 4-Phase Approach

### Phase 1: Core Projection Module (Week 1-2) 🎯
**Goal**: Create projection module capturing insights from existing customer/supplier invoices

### Phase 2: User Interface & Adjustments (Week 3-4) 🎨
**Goal**: Build UI for viewing and manually adjusting projections

### Phase 3: Bank Obligations & Recurring Items (Week 5-6) 🏦
**Goal**: Add bank obligations and recurring payment capabilities

### Phase 4: Enhanced Projection Model (Week 7-8) 📈
**Goal**: Advanced analytics, scenario planning, and ML enhancements

## Immediate Next Steps (Phase 1 Priority)

### Step 1: Phase 1 Database Migration 🚀

**Estimated Time**: 1-2 hours

1. **Apply the Phase 1 migration**:
   ```bash
   # Review the Phase 1 migration script
   cat docs/CASHFLOW_SCHEMA_MIGRATION.sql
   
   # Create new Prisma migration for Phase 1
   npx prisma migrate dev --name add_cashflow_phase1_core_projections
   ```

2. **Update your Prisma schema for Phase 1**:
   ```prisma
   // Add to your existing schema.prisma
   
   enum CashflowType {
     CUSTOMER_RECEIVABLE
     SUPPLIER_PAYABLE
     // Phase 3 types will be added later
   }
   
   enum CashflowStatus {
     PROJECTED
     CONFIRMED
     PARTIAL
     COMPLETED
     OVERDUE
     CANCELLED
   }
   
   model CashflowProjection {
     id              Int           @id @default(autoincrement())
     createdAt       DateTime      @default(now())
     updatedAt       DateTime      @updatedAt
     projectionDate  DateTime
     projectedAmount Decimal
     actualAmount    Decimal?
     type            CashflowType
     status          CashflowStatus @default(PROJECTED)
     confidence      Float         @default(1.0)
     description     String?
     
     // Phase 1: Only invoice relationships
     invoiceId       Int?
     Invoice         Invoice?      @relation(fields: [invoiceId], references: [id])
     
     @@index([projectionDate])
     @@index([type, status])
   }
   
   // Add to existing Invoice model
   model Invoice {
     // ... existing fields
     CashflowProjection CashflowProjection[]
     expectedPaymentDates Json?
   }
   ```

3. **Generate and verify**:
   ```bash
   npx prisma generate
   npx prisma db push  # Verify schema is correct
   npx prisma studio   # Visual verification
   ```

### Step 2: Phase 1 Core Services 🛠️

**Estimated Time**: 3-4 hours

1. **Create Payment Terms Calculator**:
   ```typescript
   // lib/services/paymentTermsCalculator.ts
   import { PaymentTermsData } from '@/types/paymentTerms';
   import { ExpectedPayment } from '@/types/cashflow';
   
   export class PaymentTermsCalculator {
     static calculateExpectedPayments(
       invoiceAmount: number,
       invoiceDate: Date,
       paymentTerms: PaymentTermsData
     ): ExpectedPayment[] {
       const payments: ExpectedPayment[] = [];
       
       // Handle standard payment terms
       const paymentDays = this.extractPaymentDays(paymentTerms.paymentPeriod);
       const dueDate = new Date(invoiceDate);
       dueDate.setDate(dueDate.getDate() + paymentDays);
       
       // Handle down payment
       if (paymentTerms.downPayment?.required) {
         const downPaymentAmount = paymentTerms.downPayment.percentage 
           ? invoiceAmount * (paymentTerms.downPayment.percentage / 100)
           : paymentTerms.downPayment.amount || 0;
           
         payments.push({
           date: this.calculateDownPaymentDate(invoiceDate, paymentTerms.downPayment).toISOString(),
           amount: downPaymentAmount,
           description: 'Down payment',
           type: 'down_payment'
         });
       }
       
       // Handle installments or full payment
       if (paymentTerms.installments && paymentTerms.installments.length > 0) {
         paymentTerms.installments.forEach(installment => {
           const installmentDate = new Date(invoiceDate);
           installmentDate.setDate(installmentDate.getDate() + installment.dueDays);
           
           const installmentAmount = installment.percentage
             ? invoiceAmount * (installment.percentage / 100)
             : installment.amount || 0;
             
           payments.push({
             date: installmentDate.toISOString(),
             amount: installmentAmount,
             description: installment.description || `Installment payment`,
             type: 'installment',
             installmentId: installment.id
           });
         });
       } else {
         // Full payment
         const remainingAmount = invoiceAmount - (payments.reduce((sum, p) => sum + p.amount, 0));
         if (remainingAmount > 0) {
           payments.push({
             date: dueDate.toISOString(),
             amount: remainingAmount,
             description: 'Full payment',
             type: 'full_payment'
           });
         }
       }
       
       return payments;
     }
     
     private static extractPaymentDays(paymentPeriod: string): number {
       if (paymentPeriod === 'Due on receipt') return 0;
       if (paymentPeriod.includes('Net ')) {
         return parseInt(paymentPeriod.replace('Net ', '')) || 30;
       }
       return 30; // Default
     }
     
     private static calculateDownPaymentDate(invoiceDate: Date, downPayment: any): Date {
       const dueDate = new Date(invoiceDate);
       if (downPayment.dueDate === 'Due on signing' || downPayment.dueDate === 'Due on receipt') {
         return dueDate;
       }
       if (downPayment.dueDate.includes('Net ')) {
         const days = parseInt(downPayment.dueDate.replace('Net ', '')) || 0;
         dueDate.setDate(dueDate.getDate() + days);
       }
       return dueDate;
     }
   }
   ```

2. **Create basic Cashflow Projection Service**:
   ```typescript
   // lib/services/cashflowProjectionService.ts
   import { prisma } from '@/lib/prisma';
   import { CashflowType, CashflowStatus } from '@/types/cashflow';
   import { PaymentTermsCalculator } from './paymentTermsCalculator';
   
   export class CashflowProjectionService {
     async generateProjectionsFromInvoices(startDate: Date, endDate: Date) {
       console.log('🔄 Generating cashflow projections from invoices...');
       
       // Clear existing projections for the date range
       await this.clearExistingProjections(startDate, endDate);
       
       // Generate customer receivables
       const customerProjections = await this.generateCustomerReceivables(startDate, endDate);
       
       // Generate supplier payables
       const supplierProjections = await this.generateSupplierPayables(startDate, endDate);
       
       // Insert projections
       const allProjections = [...customerProjections, ...supplierProjections];
       
       if (allProjections.length > 0) {
         await prisma.cashflowProjection.createMany({
           data: allProjections
         });
       }
       
       console.log(`✅ Generated ${allProjections.length} cashflow projections`);
       return allProjections;
     }
     
     async generateCustomerReceivables(startDate: Date, endDate: Date) {
       const unpaidInvoices = await prisma.invoice.findMany({
         where: {
           customerId: { not: null },
           invoiceDate: { gte: new Date('2023-01-01') } // Get recent invoices
         },
         include: {
           Customer: true,
           TransactionMatch: {
             where: { status: 'APPROVED' },
             include: { Transaction: true }
           }
         }
       });
   
       const projections = [];
       
       for (const invoice of unpaidInvoices) {
         const paidAmount = invoice.TransactionMatch.reduce(
           (sum, match) => sum + Number(match.Transaction.creditAmount || 0), 0
         );
         
         const remainingAmount = Number(invoice.total) - paidAmount;
         
         if (remainingAmount > 0.01) { // Small threshold for floating point precision
           const paymentTerms = (invoice.Customer as any)?.paymentTermsData || { paymentPeriod: 'Net 30' };
           
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
                 confidence: 0.8,
                 description: `${payment.description} for invoice ${invoice.invoiceNumber} from ${invoice.receiverName || 'Customer'}`,
                 invoiceId: invoice.id
               });
             }
           }
         }
       }
       
       return projections;
     }
     
     async generateSupplierPayables(startDate: Date, endDate: Date) {
       const unpaidInvoices = await prisma.invoice.findMany({
         where: {
           supplierId: { not: null },
           invoiceDate: { gte: new Date('2023-01-01') }
         },
         include: {
           Supplier: true,
           TransactionMatch: {
             where: { status: 'APPROVED' },
             include: { Transaction: true }
           }
         }
       });
   
       const projections = [];
       
       for (const invoice of unpaidInvoices) {
         const paidAmount = invoice.TransactionMatch.reduce(
           (sum, match) => sum + Number(match.Transaction.debitAmount || 0), 0
         );
         
         const remainingAmount = Number(invoice.total) - paidAmount;
         
         if (remainingAmount > 0.01) {
           const paymentTerms = (invoice.Supplier as any)?.paymentTermsData || { paymentPeriod: 'Net 30' };
           
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
                 confidence: 0.8,
                 description: `${payment.description} for invoice ${invoice.invoiceNumber} to ${invoice.issuerName || 'Supplier'}`,
                 invoiceId: invoice.id
               });
             }
           }
         }
       }
       
       return projections;
     }
     
     private async clearExistingProjections(startDate: Date, endDate: Date) {
       await prisma.cashflowProjection.deleteMany({
         where: {
           projectionDate: {
             gte: startDate,
             lte: endDate
           },
           invoiceId: { not: null } // Only clear invoice-based projections
         }
       });
     }
   }
   ```

### Step 3: Phase 1 Basic API Endpoints 🌐

**Estimated Time**: 2-3 hours

1. **Create API routes**:
   ```bash
   mkdir -p src/app/api/cashflow/projections
   mkdir -p src/app/api/cashflow/position
   ```

2. **Implement projections endpoint**:
   ```typescript
   // src/app/api/cashflow/projections/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { CashflowProjectionService } from '@/lib/services/cashflowProjectionService';
   import { prisma } from '@/lib/prisma';
   
   export async function GET(request: NextRequest) {
     try {
       const searchParams = request.nextUrl.searchParams;
       const startDate = new Date(searchParams.get('startDate') || new Date().toISOString());
       const endDate = new Date(searchParams.get('endDate') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
   
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
           }
         },
         orderBy: { projectionDate: 'asc' }
       });
   
       const summary = {
         totalInflows: projections.reduce((sum, p) => sum + (Number(p.projectedAmount) > 0 ? Number(p.projectedAmount) : 0), 0),
         totalOutflows: projections.reduce((sum, p) => sum + (Number(p.projectedAmount) < 0 ? Math.abs(Number(p.projectedAmount)) : 0), 0),
         netCashflow: projections.reduce((sum, p) => sum + Number(p.projectedAmount), 0),
         totalItems: projections.length,
         projectedItems: projections.filter(p => p.status === 'PROJECTED').length,
         confirmedItems: projections.filter(p => p.status === 'CONFIRMED').length,
         averageConfidence: projections.length > 0 ? projections.reduce((sum, p) => sum + p.confidence, 0) / projections.length : 0,
         dateRange: {
           start: startDate.toISOString(),
           end: endDate.toISOString()
         }
       };
   
       return NextResponse.json({
         projections: projections.map(p => ({
           ...p,
           projectedAmount: Number(p.projectedAmount),
           actualAmount: p.actualAmount ? Number(p.actualAmount) : null
         })),
         summary
       });
     } catch (error) {
       console.error('Cashflow projections API error:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   
   export async function POST(request: NextRequest) {
     try {
       const { startDate, endDate, recalculate } = await request.json();
       
       const start = new Date(startDate || new Date());
       const end = new Date(endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
       
       const service = new CashflowProjectionService();
       const projections = await service.generateProjectionsFromInvoices(start, end);
       
       return NextResponse.json({
         message: `Generated ${projections.length} cashflow projections`,
         projections: projections.length,
         dateRange: { start: start.toISOString(), end: end.toISOString() }
       });
     } catch (error) {
       console.error('Generate projections API error:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   ```

3. **Implement cash position endpoint**:
   ```typescript
   // src/app/api/cashflow/position/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';
   
   export async function GET(request: NextRequest) {
     try {
       const searchParams = request.nextUrl.searchParams;
       const date = new Date(searchParams.get('date') || new Date().toISOString());
       const range = searchParams.get('range') || '30d';
       
       let endDate = new Date(date);
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
           endDate.setDate(endDate.getDate() + 30);
       }
   
       // Get projections for the period
       const projections = await prisma.cashflowProjection.findMany({
         where: {
           projectionDate: {
             gte: date,
             lte: endDate
           }
         },
         orderBy: { projectionDate: 'asc' }
       });
   
       // Group by date and calculate daily positions
       const dailyPositions: Record<string, any> = {};
       let runningBalance = 0; // You might want to get actual current balance here
   
       projections.forEach(projection => {
         const dateKey = projection.projectionDate.toISOString().split('T')[0];
         
         if (!dailyPositions[dateKey]) {
           dailyPositions[dateKey] = {
             date: dateKey,
             openingBalance: runningBalance,
             totalInflows: 0,
             totalOutflows: 0,
             netCashflow: 0,
             projectionCount: 0,
             confidenceSum: 0
           };
         }
         
         const amount = Number(projection.projectedAmount);
         dailyPositions[dateKey].projectionCount++;
         dailyPositions[dateKey].confidenceSum += projection.confidence;
         
         if (amount > 0) {
           dailyPositions[dateKey].totalInflows += amount;
         } else {
           dailyPositions[dateKey].totalOutflows += Math.abs(amount);
         }
         
         dailyPositions[dateKey].netCashflow += amount;
       });
   
       // Calculate closing balances and format response
       const positions = Object.values(dailyPositions).map((day: any) => {
         const closingBalance = day.openingBalance + day.netCashflow;
         return {
           ...day,
           closingBalance,
           averageConfidence: day.projectionCount > 0 ? day.confidenceSum / day.projectionCount : 1.0
         };
       });
   
       const summary = {
         averageDailyBalance: positions.length > 0 ? positions.reduce((sum, p) => sum + p.closingBalance, 0) / positions.length : 0,
         lowestProjectedBalance: Math.min(...positions.map(p => p.closingBalance)),
         lowestBalanceDate: positions.find(p => p.closingBalance === Math.min(...positions.map(p => p.closingBalance)))?.date || '',
         highestProjectedBalance: Math.max(...positions.map(p => p.closingBalance)),
         highestBalanceDate: positions.find(p => p.closingBalance === Math.max(...positions.map(p => p.closingBalance)))?.date || '',
         cashPositiveDays: positions.filter(p => p.closingBalance > 0).length,
         cashNegativeDays: positions.filter(p => p.closingBalance < 0).length,
         totalDays: positions.length
       };
   
       // Generate basic alerts
       const alerts = [];
       const negativeDays = positions.filter(p => p.closingBalance < 0);
       if (negativeDays.length > 0) {
         alerts.push({
           id: 'negative-balance-alert',
           type: 'negative_balance',
           severity: 'high',
           title: 'Negative Cash Balance Projected',
           description: `${negativeDays.length} days with negative cash balance projected`,
           date: negativeDays[0].date,
           actionRequired: true
         });
       }
   
       return NextResponse.json({
         currentDate: date.toISOString(),
         positions,
         summary,
         alerts
       });
     } catch (error) {
       console.error('Cash position API error:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   ```

### Step 4: Test Phase 1 Implementation ✅

**Estimated Time**: 1-2 hours

1. **Generate initial projections**:
   ```bash
   # Test the API endpoint
   curl -X POST "http://localhost:3000/api/cashflow/projections" \
     -H "Content-Type: application/json" \
     -d '{"startDate": "2024-01-01", "endDate": "2024-03-31"}'
   ```

2. **Verify projections**:
   ```bash
   # Check the projections were created
   curl "http://localhost:3000/api/cashflow/projections?startDate=2024-01-01&endDate=2024-03-31"
   ```

3. **Check cash position**:
   ```bash
   # Test cash position endpoint
   curl "http://localhost:3000/api/cashflow/position?range=90d"
   ```

## Week 1-2 Goals (Phase 1)

### ✅ Week 1 Deliverables
- [ ] Database migration completed
- [ ] Core services implemented and tested
- [ ] Basic API endpoints working
- [ ] Initial projections generated from existing invoices

### ✅ Week 2 Deliverables
- [ ] Payment terms calculations working correctly
- [ ] Cash position calculations accurate
- [ ] API endpoints optimized for performance
- [ ] Phase 1 documentation complete

## Next Phase Preview

### Phase 2 (Week 3-4): User Interface
- Basic dashboard showing cash position
- Projection management interface
- Manual adjustment capabilities
- Simple scenario planning

### Phase 3 (Week 5-6): Extended Coverage
- Recurring items management
- Bank obligations tracking
- Enhanced projection types

### Phase 4 (Week 7-8): Advanced Features
- Advanced analytics dashboard
- ML-enhanced projections
- Comprehensive scenario planning

## Key Success Factors

### Phase 1 Success Metrics
- ✅ Accurate projection generation from existing invoices
- ✅ Proper payment terms calculation
- ✅ API endpoints responding correctly
- ✅ Database migration successful

### Testing Approach
1. **Data Validation**: Verify projections match payment terms
2. **Edge Cases**: Test with partial payments, overdue invoices
3. **Performance**: Ensure good performance with large datasets
4. **Integration**: Verify with existing invoice workflow

### Next Steps After Phase 1
Once Phase 1 is complete and tested:
1. Move to Phase 2 UI development
2. Add manual adjustment capabilities
3. Build basic dashboard widgets
4. Plan Phase 3 recurring items feature

This streamlined approach ensures you get immediate value from your existing invoice data while building a solid foundation for more advanced features. Each phase delivers business value independently while contributing to the larger cashflow management system. 