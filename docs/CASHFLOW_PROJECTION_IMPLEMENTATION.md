# Cashflow Projection Module - Implementation Plan

## Executive Summary

The Cashflow Projection module aggregates all upcoming customer receipts, supplier payments, and bank obligations—including all recurring items. Users can easily see their projected cash position day-by-day or month-by-month, spot liquidity gaps in advance, and adjust scenarios to stay ahead of cashflow challenges.

This implementation follows a **streamlined 4-phase approach** that builds incrementally on existing data and delivers immediate value at each stage.

## Current System Analysis

### Existing Data Models (Strengths)
- **Comprehensive Invoice System**: Invoices with customer/supplier relationships ✅
- **Advanced Payment Terms**: JSON-based `paymentTermsData` supporting installments, down payments, and flexible terms ✅
- **Transaction Matching**: Sophisticated matching between bank transactions and invoices ✅
- **Bank Integration**: Full bank statement processing with transaction categorization ✅
- **Payment Status Tracking**: Real-time tracking of paid vs. outstanding amounts ✅

### Current Payment Terms Structure
```typescript
interface PaymentTermsData {
  paymentPeriod: string; // "Net 30", "Net 60", "Due on receipt", "Custom"
  downPayment?: {
    required: boolean;
    amount?: number;
    percentage?: number;
    dueDate: string;
  };
  installments?: Array<{
    id: string;
    amount?: number;
    percentage?: number;
    dueDays: number; // Days relative to invoice date
    description?: string;
  }>;
}
```

## Streamlined Implementation Plan

### Phase 1: Core Projection Module (Week 1-2)
**Goal**: Create projection module and tables capturing already generated insights from customers and suppliers

#### 1.1 Minimal Database Schema

```prisma
model CashflowProjection {
  id              Int                    @id @default(autoincrement())
  createdAt       DateTime               @default(now())
  updatedAt       DateTime               @updatedAt
  projectionDate  DateTime               // Date this projection is for
  projectedAmount Decimal                // Positive for inflows, negative for outflows
  actualAmount    Decimal?               // Actual amount when it occurs
  type            CashflowType
  status          CashflowStatus         @default(PROJECTED)
  confidence      Float                  @default(1.0) // 0.0 to 1.0
  description     String?
  
  // Start with invoice relationships only
  invoiceId       Int?
  
  Invoice         Invoice?         @relation(fields: [invoiceId], references: [id])
  
  @@index([projectionDate])
  @@index([type, status])
}

// Initial enums - start simple
enum CashflowType {
  CUSTOMER_RECEIVABLE
  SUPPLIER_PAYABLE
  // Bank obligations and others added in Phase 3
}

enum CashflowStatus {
  PROJECTED
  CONFIRMED
  PARTIAL
  COMPLETED
  OVERDUE
  CANCELLED
}
```

#### 1.2 Core Services

```typescript
// lib/services/cashflowProjectionService.ts
export class CashflowProjectionService {
  // Phase 1: Focus on invoice-based projections
  async generateCustomerReceivables(startDate: Date, endDate: Date): Promise<CashflowProjection[]>
  async generateSupplierPayables(startDate: Date, endDate: Date): Promise<CashflowProjection[]>
  async calculateCashPosition(date: Date): Promise<CashPosition>
}

// lib/services/paymentTermsCalculator.ts
export class PaymentTermsCalculator {
  static calculateExpectedPayments(
    invoice: Invoice, 
    paymentTerms: PaymentTermsData
  ): ExpectedPayment[]
}
```

#### 1.3 Basic API Endpoints

```typescript
// Phase 1 APIs - Invoice-based projections only
GET /api/cashflow/projections
POST /api/cashflow/projections/generate
GET /api/cashflow/position
```

### Phase 2: User Interface & Adjustments (Week 3-4)
**Goal**: Generate UI that displays and allows user to adjust projections

#### 2.1 Dashboard Components

```typescript
// app/dashboard/cashflow/page.tsx
- Cash position overview (current, 30-day, 90-day)
- Customer receivables timeline
- Supplier payables timeline
- Projection adjustment tools
```

#### 2.2 Projection Management

```typescript
// app/dashboard/cashflow/projections/page.tsx
- List view of all projections
- Manual adjustment capabilities
- Confidence level editing
- Status updates
- Bulk operations
```

#### 2.3 Adjustment APIs

```typescript
// Phase 2 APIs - Manual adjustments
PUT /api/cashflow/projections/[id]
POST /api/cashflow/projections/manual
POST /api/cashflow/scenarios (basic)
```

### Phase 3: Bank Obligations & Recurring Items (Week 5-6)
**Goal**: Implement required changes to capture cashflow of bank obligations and recurring payments

#### 3.1 Extended Database Schema

```prisma
// Add to existing schema
model RecurringItem {
  id                 Int                   @id @default(autoincrement())
  createdAt          DateTime              @default(now())
  updatedAt          DateTime              @updatedAt
  name               String
  description        String?
  amount             Decimal
  type               CashflowType
  frequency          RecurrenceFrequency
  intervalValue      Int                   @default(1)
  startDate          DateTime
  endDate            DateTime?
  nextOccurrenceDate DateTime
  isActive           Boolean               @default(true)
  
  // Relationships
  customerId         Int?
  supplierId         Int?
  bankId             Int?
  
  Customer           Customer?       @relation(fields: [customerId], references: [id])
  Supplier           Supplier?       @relation(fields: [supplierId], references: [id])
  Bank               Bank?           @relation(fields: [bankId], references: [id])
  CashflowProjection CashflowProjection[]
  
  @@index([nextOccurrenceDate, isActive])
}

model BankObligation {
  id                 Int                   @id @default(autoincrement())
  createdAt          DateTime              @default(now())
  updatedAt          DateTime              @updatedAt
  name               String
  description        String?
  amount             Decimal
  dueDate            DateTime
  type               BankObligationType
  status             ObligationStatus      @default(PENDING)
  isRecurring        Boolean               @default(false)
  
  bankId             Int
  Bank               Bank                  @relation(fields: [bankId], references: [id])
  CashflowProjection CashflowProjection[]
  
  @@index([dueDate, status])
}

// Extended enums
enum CashflowType {
  CUSTOMER_RECEIVABLE
  SUPPLIER_PAYABLE
  BANK_OBLIGATION      // Added in Phase 3
  INTERNAL_TRANSFER    // Added in Phase 3
  TAX_PAYMENT         // Added in Phase 3
  LOAN_PAYMENT        // Added in Phase 3
  OTHER_INCOME        // Added in Phase 3
  OTHER_EXPENSE       // Added in Phase 3
}

enum RecurrenceFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
}

enum BankObligationType {
  LOAN_PAYMENT
  ACCOUNT_FEES
  MAINTENANCE_FEES
  OVERDRAFT_FEES
  TRANSFER_FEES
  OTHER
}

enum ObligationStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

#### 3.2 Extended Services

```typescript
// lib/services/recurringItemsProcessor.ts
export class RecurringItemsProcessor {
  async generateFutureOccurrences(recurringItem: RecurringItem, endDate: Date): Promise<Date[]>
  async updateNextOccurrences(): Promise<void>
}

// lib/services/bankObligationService.ts
export class BankObligationService {
  async calculateBankObligations(startDate: Date, endDate: Date): Promise<CashflowProjection[]>
}
```

#### 3.3 Management APIs

```typescript
// Phase 3 APIs
GET /api/cashflow/recurring
POST /api/cashflow/recurring
PUT /api/cashflow/recurring/[id]
DELETE /api/cashflow/recurring/[id]

GET /api/cashflow/bank-obligations
POST /api/cashflow/bank-obligations
PUT /api/cashflow/bank-obligations/[id]
DELETE /api/cashflow/bank-obligations/[id]
```

### Phase 4: Enhanced Projection Model (Week 7-8)
**Goal**: Adjust projection model to accommodate new adjustments and advanced features

#### 4.1 Enhanced Projection Service

```typescript
// lib/services/cashflowProjectionService.ts (Enhanced)
export class CashflowProjectionService {
  // Comprehensive projection generation
  async generateProjections(startDate: Date, endDate: Date): Promise<CashflowProjection[]>
  async calculateCustomerReceivables(startDate: Date, endDate: Date): Promise<ProjectionItem[]>
  async calculateSupplierPayables(startDate: Date, endDate: Date): Promise<ProjectionItem[]>
  async calculateBankObligations(startDate: Date, endDate: Date): Promise<ProjectionItem[]>
  async processRecurringItems(startDate: Date, endDate: Date): Promise<ProjectionItem[]>
  
  // Advanced features
  async runScenarioAnalysis(scenario: ScenarioParams): Promise<ScenarioResult>
  async generateAlerts(): Promise<CashflowAlert[]>
  async calculateWorkingCapitalMetrics(): Promise<WorkingCapitalMetrics>
}
```

#### 4.2 Advanced Analytics

```typescript
// app/dashboard/cashflow/analytics/page.tsx
- Payment pattern analysis
- Seasonal trend identification
- Cash conversion cycle metrics
- Prediction accuracy tracking
```

#### 4.3 Scenario Planning

```typescript
// app/dashboard/cashflow/scenarios/page.tsx
- "What if" modeling interface
- Scenario comparison views
- Stress testing tools
- Export/import capabilities
```

## Phase-by-Phase Deliverables

### Phase 1 Deliverables (Immediate Value)
- ✅ Basic cashflow projections from existing invoices
- ✅ Simple dashboard showing cash position
- ✅ Customer receivables and supplier payables visibility
- ✅ Manual projection adjustments

### Phase 2 Deliverables (User Control)
- ✅ Interactive projection management UI
- ✅ Manual adjustment capabilities
- ✅ Basic scenario modeling
- ✅ Export functionality

### Phase 3 Deliverables (Complete Coverage)
- ✅ Recurring items management
- ✅ Bank obligations tracking
- ✅ Automated recurring processing
- ✅ Enhanced projection types

### Phase 4 Deliverables (Advanced Features)
- ✅ Comprehensive analytics
- ✅ Advanced scenario planning
- ✅ ML-enhanced confidence scoring
- ✅ Integration with external systems

## Technical Implementation Strategy

### Database Migration Approach
1. **Phase 1**: Create basic `CashflowProjection` table with invoice relationships
2. **Phase 2**: Add manual adjustment fields and user preferences
3. **Phase 3**: Add `RecurringItem` and `BankObligation` tables
4. **Phase 4**: Add analytics tables and optimization indexes

### Service Layer Development
1. **Phase 1**: Core projection generation from invoices
2. **Phase 2**: User adjustment and scenario services
3. **Phase 3**: Recurring and bank obligation services
4. **Phase 4**: Advanced analytics and ML services

### API Development Approach
1. **Phase 1**: Basic CRUD operations for projections
2. **Phase 2**: Adjustment and manual entry endpoints
3. **Phase 3**: Recurring items and bank obligations APIs
4. **Phase 4**: Advanced analytics and integration APIs

## Key Integration Points

### Phase 1 Integration
- Hook into existing invoice creation/update workflows
- Leverage existing transaction matching system
- Use existing payment terms calculations

### Phase 2 Integration
- Add cashflow widgets to existing dashboard
- Integrate with existing user permission system
- Connect to existing notification system

### Phase 3 Integration
- Connect with bank statement processing
- Integrate with existing bank management
- Hook into existing recurring transaction detection

### Phase 4 Integration
- Connect with external accounting systems
- Integrate with calendar systems
- Add to existing reporting infrastructure

## Success Metrics by Phase

### Phase 1 Success Metrics
- Accurate projection generation from existing invoices
- Basic cash position visibility
- User adoption of projection views

### Phase 2 Success Metrics
- User engagement with adjustment features
- Improved cash position accuracy through adjustments
- Regular use of scenario planning

### Phase 3 Success Metrics
- Comprehensive coverage of all cashflow types
- Automated detection and processing of recurring items
- Complete bank obligation tracking

### Phase 4 Success Metrics
- High prediction accuracy
- Advanced analytics adoption
- Integration with business planning processes

## Risk Mitigation

### Phase 1 Risks
- **Risk**: Inaccurate payment term calculations
- **Mitigation**: Extensive testing with existing invoice data

### Phase 2 Risks
- **Risk**: User interface complexity
- **Mitigation**: Incremental UI rollout with user feedback

### Phase 3 Risks
- **Risk**: Over-complexity in recurring item detection
- **Mitigation**: Start with manual entry, add automation gradually

### Phase 4 Risks
- **Risk**: Feature bloat
- **Mitigation**: Focus on core business value, avoid unnecessary complexity

This phased approach ensures that each stage delivers immediate business value while building toward a comprehensive cashflow projection system. The foundation of your existing invoice and payment terms system provides an excellent starting point for rapid initial value delivery. 