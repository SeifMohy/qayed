-- Cashflow Projection Module - Phase 1 Database Schema Migration
-- This migration creates the foundational tables for cashflow projections
-- Additional features will be added in subsequent phases

-- =============================================================================
-- Phase 1: Core Projection System (Customer & Supplier Receivables/Payables)
-- =============================================================================

-- Create initial enums for Phase 1 - start simple
CREATE TYPE "CashflowType" AS ENUM (
  'CUSTOMER_RECEIVABLE',
  'SUPPLIER_PAYABLE'
  -- Additional types will be added in Phase 3:
  -- 'BANK_OBLIGATION', 'INTERNAL_TRANSFER', 'TAX_PAYMENT', 
  -- 'LOAN_PAYMENT', 'OTHER_INCOME', 'OTHER_EXPENSE'
);

CREATE TYPE "CashflowStatus" AS ENUM (
  'PROJECTED',
  'CONFIRMED',
  'PARTIAL',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
);

-- Create basic CashflowProjection table for Phase 1
CREATE TABLE "CashflowProjection" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectionDate" TIMESTAMP(3) NOT NULL,
    "projectedAmount" DECIMAL(65,30) NOT NULL,
    "actualAmount" DECIMAL(65,30),
    "type" "CashflowType" NOT NULL,
    "status" "CashflowStatus" NOT NULL DEFAULT 'PROJECTED',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "description" TEXT,
    
    -- Phase 1: Only invoice relationships
    "invoiceId" INTEGER,
    
    -- Phase 2: Manual adjustments and user data (to be added)
    -- "isManualAdjustment" BOOLEAN DEFAULT false,
    -- "originalProjectionId" INTEGER,
    -- "adjustmentReason" TEXT,
    -- "createdBy" TEXT,
    
    -- Phase 3: Additional relationships (to be added)
    -- "recurringItemId" INTEGER,
    -- "bankObligationId" INTEGER,

    CONSTRAINT "CashflowProjection_pkey" PRIMARY KEY ("id")
);

-- Add expectedPaymentDates to Invoice table for complex payment schedules
ALTER TABLE "Invoice" ADD COLUMN "expectedPaymentDates" JSONB;

-- Create indexes for Phase 1 performance optimization
CREATE INDEX "CashflowProjection_projectionDate_idx" ON "CashflowProjection"("projectionDate");
CREATE INDEX "CashflowProjection_type_status_idx" ON "CashflowProjection"("type", "status");
CREATE INDEX "CashflowProjection_invoiceId_idx" ON "CashflowProjection"("invoiceId");

-- Add foreign key constraints for Phase 1
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create view for current cash position summary (Phase 1)
CREATE VIEW "CurrentCashPosition" AS
SELECT 
    DATE(cp."projectionDate") as projection_date,
    SUM(CASE WHEN cp."projectedAmount" > 0 THEN cp."projectedAmount" ELSE 0 END) as total_inflows,
    SUM(CASE WHEN cp."projectedAmount" < 0 THEN ABS(cp."projectedAmount") ELSE 0 END) as total_outflows,
    SUM(cp."projectedAmount") as net_cashflow,
    COUNT(*) as total_items,
    COUNT(CASE WHEN cp."status" = 'PROJECTED' THEN 1 END) as projected_items,
    COUNT(CASE WHEN cp."status" = 'CONFIRMED' THEN 1 END) as confirmed_items,
    AVG(cp."confidence") as average_confidence
FROM "CashflowProjection" cp
WHERE cp."projectionDate" >= CURRENT_DATE
GROUP BY DATE(cp."projectionDate")
ORDER BY projection_date;

-- Create materialized view for 30-day summary (Phase 1)
CREATE MATERIALIZED VIEW "CashflowSummary30Days" AS
SELECT 
    cp."type",
    COUNT(*) as item_count,
    SUM(cp."projectedAmount") as total_amount,
    AVG(cp."confidence") as avg_confidence,
    MIN(cp."projectionDate") as earliest_date,
    MAX(cp."projectionDate") as latest_date
FROM "CashflowProjection" cp
WHERE cp."projectionDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND cp."status" IN ('PROJECTED', 'CONFIRMED')
GROUP BY cp."type";

-- Add comments for Phase 1 documentation
COMMENT ON TABLE "CashflowProjection" IS 'Central table for cashflow projections - Phase 1: Invoice-based projections only';
COMMENT ON COLUMN "CashflowProjection"."confidence" IS 'Confidence level (0.0-1.0) in the projection accuracy';
COMMENT ON COLUMN "CashflowProjection"."projectedAmount" IS 'Positive for inflows (receivables), negative for outflows (payables)';
COMMENT ON COLUMN "Invoice"."expectedPaymentDates" IS 'JSON array of expected payment dates based on payment terms: [{date, amount, description, type}]';

-- =============================================================================
-- Phase 1 Data Migration: Generate initial projections from existing invoices
-- =============================================================================

-- Create initial cashflow projections from unpaid customer invoices
INSERT INTO "CashflowProjection" (
    "projectionDate", "projectedAmount", "type", "description", "invoiceId", "confidence"
)
SELECT 
    -- Calculate due date based on payment terms or default to 30 days
    CASE 
        WHEN c."paymentTermsData"->>'paymentPeriod' LIKE 'Net %' 
        THEN i."invoiceDate" + INTERVAL '1 day' * CAST(SUBSTRING(c."paymentTermsData"->>'paymentPeriod' FROM 'Net (\d+)') AS INTEGER)
        WHEN c."paymentTermsData"->>'paymentPeriod' = 'Due on receipt'
        THEN i."invoiceDate"
        ELSE i."invoiceDate" + INTERVAL '30 days'
    END as projection_date,
    GREATEST(i."total" - COALESCE(SUM(t."creditAmount"), 0), 0) as projected_amount,
    'CUSTOMER_RECEIVABLE' as type,
    'Customer payment for invoice ' || i."invoiceNumber" as description,
    i."id" as invoice_id,
    0.8 as confidence
FROM "Invoice" i
LEFT JOIN "Customer" c ON i."customerId" = c."id"
LEFT JOIN "TransactionMatch" tm ON tm."invoiceId" = i."id" AND tm."status" = 'APPROVED'
LEFT JOIN "Transaction" t ON tm."transactionId" = t."id"
WHERE i."customerId" IS NOT NULL
    AND i."invoiceDate" >= CURRENT_DATE - INTERVAL '1 year'  -- Only recent invoices
GROUP BY i."id", c."paymentTermsData", i."invoiceDate", i."invoiceNumber", i."total"
HAVING GREATEST(i."total" - COALESCE(SUM(t."creditAmount"), 0), 0) > 0.01;

-- Create initial cashflow projections from unpaid supplier invoices
INSERT INTO "CashflowProjection" (
    "projectionDate", "projectedAmount", "type", "description", "invoiceId", "confidence"
)
SELECT 
    -- Calculate due date based on supplier payment terms or default to 30 days
    CASE 
        WHEN s."paymentTermsData"->>'paymentPeriod' LIKE 'Net %' 
        THEN i."invoiceDate" + INTERVAL '1 day' * CAST(SUBSTRING(s."paymentTermsData"->>'paymentPeriod' FROM 'Net (\d+)') AS INTEGER)
        WHEN s."paymentTermsData"->>'paymentPeriod' = 'Due on receipt'
        THEN i."invoiceDate"
        ELSE i."invoiceDate" + INTERVAL '30 days'
    END as projection_date,
    -1 * GREATEST(i."total" - COALESCE(SUM(t."debitAmount"), 0), 0) as projected_amount, -- Negative for outflows
    'SUPPLIER_PAYABLE' as type,
    'Payment to supplier for invoice ' || i."invoiceNumber" as description,
    i."id" as invoice_id,
    0.8 as confidence
FROM "Invoice" i
LEFT JOIN "Supplier" s ON i."supplierId" = s."id"
LEFT JOIN "TransactionMatch" tm ON tm."invoiceId" = i."id" AND tm."status" = 'APPROVED'
LEFT JOIN "Transaction" t ON tm."transactionId" = t."id"
WHERE i."supplierId" IS NOT NULL
    AND i."invoiceDate" >= CURRENT_DATE - INTERVAL '1 year'  -- Only recent invoices
GROUP BY i."id", s."paymentTermsData", i."invoiceDate", i."invoiceNumber", i."total"
HAVING GREATEST(i."total" - COALESCE(SUM(t."debitAmount"), 0), 0) > 0.01;

-- =============================================================================
-- FUTURE PHASES - Migration Scripts (To be run in subsequent phases)
-- =============================================================================

-- Phase 2 Migration Script (Manual Adjustments & User Features)
-- =============================================================================
/*
-- Add Phase 2 columns
ALTER TABLE "CashflowProjection" ADD COLUMN "isManualAdjustment" BOOLEAN DEFAULT false;
ALTER TABLE "CashflowProjection" ADD COLUMN "originalProjectionId" INTEGER;
ALTER TABLE "CashflowProjection" ADD COLUMN "adjustmentReason" TEXT;
ALTER TABLE "CashflowProjection" ADD COLUMN "createdBy" TEXT;

-- Add foreign key for manual adjustments
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_originalProjectionId_fkey" 
    FOREIGN KEY ("originalProjectionId") REFERENCES "CashflowProjection"("id") ON DELETE SET NULL;

-- Add indexes for Phase 2
CREATE INDEX "CashflowProjection_isManualAdjustment_idx" ON "CashflowProjection"("isManualAdjustment");
CREATE INDEX "CashflowProjection_createdBy_idx" ON "CashflowProjection"("createdBy");
*/

-- Phase 3 Migration Script (Recurring Items & Bank Obligations)
-- =============================================================================
/*
-- Extend CashflowType enum
ALTER TYPE "CashflowType" ADD VALUE 'BANK_OBLIGATION';
ALTER TYPE "CashflowType" ADD VALUE 'INTERNAL_TRANSFER';
ALTER TYPE "CashflowType" ADD VALUE 'TAX_PAYMENT';
ALTER TYPE "CashflowType" ADD VALUE 'LOAN_PAYMENT';
ALTER TYPE "CashflowType" ADD VALUE 'OTHER_INCOME';
ALTER TYPE "CashflowType" ADD VALUE 'OTHER_EXPENSE';

-- Create additional enums for Phase 3
CREATE TYPE "RecurrenceFrequency" AS ENUM (
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'ANNUALLY'
);

CREATE TYPE "BankObligationType" AS ENUM (
  'LOAN_PAYMENT',
  'ACCOUNT_FEES',
  'MAINTENANCE_FEES',
  'OVERDRAFT_FEES',
  'TRANSFER_FEES',
  'OTHER'
);

CREATE TYPE "ObligationStatus" AS ENUM (
  'PENDING',
  'PAID',
  'OVERDUE',
  'CANCELLED'
);

-- Create RecurringItem table
CREATE TABLE "RecurringItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "CashflowType" NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "intervalValue" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextOccurrenceDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customerId" INTEGER,
    "supplierId" INTEGER,
    "bankId" INTEGER,

    CONSTRAINT "RecurringItem_pkey" PRIMARY KEY ("id")
);

-- Create BankObligation table
CREATE TABLE "BankObligation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" "BankObligationType" NOT NULL,
    "status" "ObligationStatus" NOT NULL DEFAULT 'PENDING',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "bankId" INTEGER NOT NULL,

    CONSTRAINT "BankObligation_pkey" PRIMARY KEY ("id")
);

-- Add Phase 3 relationships to CashflowProjection
ALTER TABLE "CashflowProjection" ADD COLUMN "recurringItemId" INTEGER;
ALTER TABLE "CashflowProjection" ADD COLUMN "bankObligationId" INTEGER;

-- Add foreign key constraints for Phase 3
ALTER TABLE "RecurringItem" ADD CONSTRAINT "RecurringItem_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL;
ALTER TABLE "RecurringItem" ADD CONSTRAINT "RecurringItem_supplierId_fkey" 
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL;
ALTER TABLE "RecurringItem" ADD CONSTRAINT "RecurringItem_bankId_fkey" 
    FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL;

ALTER TABLE "BankObligation" ADD CONSTRAINT "BankObligation_bankId_fkey" 
    FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT;

ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_recurringItemId_fkey" 
    FOREIGN KEY ("recurringItemId") REFERENCES "RecurringItem"("id") ON DELETE SET NULL;
ALTER TABLE "CashflowProjection" ADD CONSTRAINT "CashflowProjection_bankObligationId_fkey" 
    FOREIGN KEY ("bankObligationId") REFERENCES "BankObligation"("id") ON DELETE SET NULL;

-- Add Phase 3 indexes
CREATE INDEX "RecurringItem_nextOccurrenceDate_isActive_idx" ON "RecurringItem"("nextOccurrenceDate", "isActive");
CREATE INDEX "BankObligation_dueDate_status_idx" ON "BankObligation"("dueDate", "status");
CREATE INDEX "CashflowProjection_recurringItemId_idx" ON "CashflowProjection"("recurringItemId");
CREATE INDEX "CashflowProjection_bankObligationId_idx" ON "CashflowProjection"("bankObligationId");
*/

-- Phase 4 Migration Script (Advanced Analytics & ML Features)
-- =============================================================================
/*
-- Create analytics tables for Phase 4
CREATE TABLE "CashflowAnalytics" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL,
    "actualVsProjected" JSONB,
    "confidenceAccuracy" DOUBLE PRECISION,
    "paymentPatterns" JSONB,
    "seasonalTrends" JSONB,

    CONSTRAINT "CashflowAnalytics_pkey" PRIMARY KEY ("id")
);

-- Add ML-enhanced fields to CashflowProjection
ALTER TABLE "CashflowProjection" ADD COLUMN "mlConfidenceScore" DOUBLE PRECISION;
ALTER TABLE "CashflowProjection" ADD COLUMN "seasonalAdjustment" DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE "CashflowProjection" ADD COLUMN "paymentPatternScore" DOUBLE PRECISION;

-- Create indexes for analytics
CREATE INDEX "CashflowAnalytics_date_idx" ON "CashflowAnalytics"("date");
CREATE INDEX "CashflowProjection_mlConfidenceScore_idx" ON "CashflowProjection"("mlConfidenceScore");
*/

-- =============================================================================
-- Refresh materialized views (run after any data changes)
-- =============================================================================
-- REFRESH MATERIALIZED VIEW "CashflowSummary30Days"; 