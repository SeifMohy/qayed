// Cashflow Projection Types
// Comprehensive type definitions for the cashflow projection module
// Organized by implementation phases for streamlined development

import { Decimal } from '@prisma/client/runtime/library';

// ============================================================================
// Phase 1 Enums (Customer & Supplier Receivables/Payables)
// ============================================================================

export enum CashflowType {
  // Phase 1: Core types
  CUSTOMER_RECEIVABLE = 'CUSTOMER_RECEIVABLE',
  SUPPLIER_PAYABLE = 'SUPPLIER_PAYABLE',
  
  // Phase 3: Extended types (to be added later)
  BANK_OBLIGATION = 'BANK_OBLIGATION',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  TAX_PAYMENT = 'TAX_PAYMENT',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  OTHER_INCOME = 'OTHER_INCOME',
  OTHER_EXPENSE = 'OTHER_EXPENSE'
}

export enum CashflowStatus {
  PROJECTED = 'PROJECTED',
  CONFIRMED = 'CONFIRMED',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// ============================================================================
// Phase 3 Enums (Recurring Items & Bank Obligations)
// ============================================================================

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY'
}

export enum BankObligationType {
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  ACCOUNT_FEES = 'ACCOUNT_FEES',
  MAINTENANCE_FEES = 'MAINTENANCE_FEES',
  OVERDRAFT_FEES = 'OVERDRAFT_FEES',
  TRANSFER_FEES = 'TRANSFER_FEES',
  OTHER = 'OTHER'
}

export enum ObligationStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// ============================================================================
// Phase 1 Core Data Interfaces
// ============================================================================

export interface CashflowProjection {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectionDate: Date;
  projectedAmount: number | Decimal;
  actualAmount?: number | Decimal | null;
  type: CashflowType;
  status: CashflowStatus;
  confidence: number; // 0.0 to 1.0
  description?: string | null;
  
  // Phase 1: Invoice relationships
  invoiceId?: number | null;
  
  // Phase 2: Manual adjustment fields (to be added)
  // isManualAdjustment?: boolean;
  // originalProjectionId?: number | null;
  // adjustmentReason?: string | null;
  // createdBy?: string | null;
  
  // Phase 3: Additional relationships (to be added)
  // recurringItemId?: number | null;
  // bankObligationId?: number | null;
  
  // Optional populated relationships
  Invoice?: any; // Invoice type from Prisma
  RecurringItem?: RecurringItem;
  BankObligation?: BankObligation;
}

// ============================================================================
// Phase 2 Interfaces (Manual Adjustments & User Features)
// ============================================================================

export interface ManualCashflowProjection extends CashflowProjection {
  isManualAdjustment: boolean;
  originalProjectionId?: number | null;
  adjustmentReason?: string | null;
  createdBy?: string | null;
}

export interface ProjectionAdjustment {
  id?: number;
  originalProjectionId: number;
  newAmount: number;
  newDate: string; // ISO date string
  reason: string;
  confidence?: number;
}

// ============================================================================
// Phase 3 Interfaces (Recurring Items & Bank Obligations)
// ============================================================================

export interface RecurringItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string | null;
  amount: number | Decimal;
  type: CashflowType;
  frequency: RecurrenceFrequency;
  intervalValue: number; // e.g., every 2 weeks = intervalValue: 2, frequency: WEEKLY
  startDate: Date;
  endDate?: Date | null; // null for indefinite
  nextOccurrenceDate: Date;
  isActive: boolean;
  
  // Relationships
  customerId?: number | null;
  supplierId?: number | null;
  bankId?: number | null;
  
  // Optional populated relationships
  Customer?: any; // Customer type from Prisma
  Supplier?: any; // Supplier type from Prisma
  Bank?: any; // Bank type from Prisma
  CashflowProjection?: CashflowProjection[];
}

export interface BankObligation {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string | null;
  amount: number | Decimal;
  dueDate: Date;
  type: BankObligationType;
  status: ObligationStatus;
  isRecurring: boolean;
  
  // Relationships
  bankId: number;
  
  // Optional populated relationships
  Bank?: any; // Bank type from Prisma
  CashflowProjection?: CashflowProjection[];
}

// ============================================================================
// Expected Payment Structures (for Invoice.expectedPaymentDates JSON field)
// ============================================================================

export interface ExpectedPayment {
  date: string; // ISO date string
  amount: number;
  description?: string;
  type?: 'down_payment' | 'installment' | 'final_payment' | 'full_payment';
  installmentId?: string; // Reference to PaymentTermsInstallment.id
}

export interface ExpectedPaymentDates {
  payments: ExpectedPayment[];
  totalAmount: number;
  generatedAt: string; // ISO date string
  basedOnTerms: string; // Description of payment terms used
}

// ============================================================================
// Phase 1 API Request/Response Types
// ============================================================================

export interface CashflowProjectionRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  type?: CashflowType[];
  status?: CashflowStatus[];
  groupBy?: 'daily' | 'weekly' | 'monthly';
  includeRelated?: boolean;
}

export interface CashflowProjectionResponse {
  projections: CashflowProjection[];
  summary: CashflowSummary;
  pagination?: PaginationInfo;
}

export interface CashflowSummary {
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  totalItems: number;
  projectedItems: number;
  confirmedItems: number;
  averageConfidence: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface CashPositionRequest {
  date?: string; // ISO date string, defaults to today
  range?: '30d' | '90d' | '1y' | 'custom';
  customEndDate?: string; // Required if range = 'custom'
}

export interface CashPositionResponse {
  currentDate: string;
  positions: DailyCashPosition[];
  summary: CashPositionSummary;
  alerts: CashflowAlert[];
}

export interface DailyCashPosition {
  date: string;
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  closingBalance: number;
  projectionCount: number;
  averageConfidence: number;
}

export interface CashPositionSummary {
  averageDailyBalance: number;
  lowestProjectedBalance: number;
  lowestBalanceDate: string;
  highestProjectedBalance: number;
  highestBalanceDate: string;
  cashPositiveDays: number;
  cashNegativeDays: number;
  totalDays: number;
}

export interface CashflowAlert {
  id: string;
  type: 'negative_balance' | 'large_outflow' | 'overdue_payment' | 'low_confidence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
  amount?: number;
  projectionId?: number;
  actionRequired?: boolean;
}

// ============================================================================
// Phase 2 Scenario Planning Types
// ============================================================================

export interface ScenarioParams {
  name: string;
  description?: string;
  adjustments: ScenarioAdjustment[];
  baseDate: string; // ISO date string
}

export interface ScenarioAdjustment {
  type: 'delay_payment' | 'change_amount' | 'add_payment' | 'remove_payment';
  targetId?: number; // CashflowProjection ID for existing items
  delayDays?: number; // For delay_payment
  newAmount?: number; // For change_amount or add_payment
  newDate?: string; // For add_payment
  cashflowType?: CashflowType; // For add_payment
  description?: string;
}

export interface ScenarioResult {
  scenarioName: string;
  originalSummary: CashflowSummary;
  adjustedSummary: CashflowSummary;
  impact: ScenarioImpact;
  adjustedProjections: CashflowProjection[];
  adjustedPositions: DailyCashPosition[];
  newAlerts: CashflowAlert[];
}

export interface ScenarioImpact {
  netCashflowChange: number;
  balanceImpact: {
    worstCase: number;
    bestCase: number;
    averageChange: number;
  };
  riskFactors: string[];
  recommendations: string[];
}

// ============================================================================
// Phase 3 Recurring Items Management Types
// ============================================================================

export interface CreateRecurringItemRequest {
  name: string;
  description?: string;
  amount: number;
  type: CashflowType;
  frequency: RecurrenceFrequency;
  intervalValue?: number;
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string or null for indefinite
  customerId?: number | null;
  supplierId?: number | null;
  bankId?: number | null;
}

export interface UpdateRecurringItemRequest extends Partial<CreateRecurringItemRequest> {
  id: number;
  isActive?: boolean;
}

export interface RecurringItemOccurrence {
  recurringItemId: number;
  occurrenceDate: string; // ISO date string
  projectedAmount: number;
  actualAmount?: number | null;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  completedAt?: string | null; // ISO date string
}

// ============================================================================
// Phase 3 Bank Obligations Management Types
// ============================================================================

export interface CreateBankObligationRequest {
  name: string;
  description?: string;
  amount: number;
  dueDate: string; // ISO date string
  type: BankObligationType;
  bankId: number;
  isRecurring?: boolean;
}

export interface UpdateBankObligationRequest extends Partial<CreateBankObligationRequest> {
  id: number;
  status?: ObligationStatus;
}

// ============================================================================
// Phase 4 Dashboard and Analytics Types
// ============================================================================

export interface CashflowDashboardData {
  currentPosition: {
    date: string;
    balance: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  upcomingHighlights: {
    nextMajorInflow: CashflowProjection | null;
    nextMajorOutflow: CashflowProjection | null;
    overdueItems: CashflowProjection[];
  };
  summaries: {
    next30Days: CashflowSummary;
    next90Days: CashflowSummary;
    next12Months: CashflowSummary;
  };
  alerts: CashflowAlert[];
  recentActivity: {
    completedProjections: CashflowProjection[];
    newProjections: CashflowProjection[];
    statusChanges: CashflowProjection[];
  };
}

export interface CashflowAnalytics {
  paymentPatterns: {
    averageCustomerPaymentDays: number;
    averageSupplierPaymentDays: number;
    onTimePaymentRate: number;
    seasonalTrends: SeasonalTrend[];
  };
  forecasting: {
    confidenceAccuracy: number; // How accurate our confidence scores are
    projectionAccuracy: number; // How close projections are to actuals
    improvementSuggestions: string[];
  };
  workingCapital: {
    currentRatio: number;
    cashConversionCycle: number;
    daysOutstanding: number;
    daysPayable: number;
  };
}

export interface SeasonalTrend {
  period: string; // 'Q1', 'Q2', 'January', etc.
  averageInflows: number;
  averageOutflows: number;
  netCashflow: number;
  confidenceLevel: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

export interface AmountRange {
  min?: number;
  max?: number;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

export interface CashflowFilters {
  dateRange?: DateRange;
  amountRange?: AmountRange;
  types?: CashflowType[];
  statuses?: CashflowStatus[];
  confidenceRange?: { min: number; max: number };
  customerIds?: number[];
  supplierIds?: number[];
  bankIds?: number[];
  search?: string; // Free text search in descriptions
}

export interface CashflowSortOptions {
  field: 'projectionDate' | 'projectedAmount' | 'confidence' | 'createdAt' | 'type';
  direction: 'asc' | 'desc';
}

// ============================================================================
// Constants and Configuration (Phase-organized)
// ============================================================================

// Phase 1 constants
export const PHASE_1_CASHFLOW_TYPES: CashflowType[] = [
  CashflowType.CUSTOMER_RECEIVABLE,
  CashflowType.SUPPLIER_PAYABLE
];

// Phase 3 constants
export const PHASE_3_CASHFLOW_TYPES: CashflowType[] = [
  CashflowType.BANK_OBLIGATION,
  CashflowType.INTERNAL_TRANSFER,
  CashflowType.TAX_PAYMENT,
  CashflowType.LOAN_PAYMENT,
  CashflowType.OTHER_INCOME,
  CashflowType.OTHER_EXPENSE
];

export const CASHFLOW_TYPE_LABELS: Record<CashflowType, string> = {
  [CashflowType.CUSTOMER_RECEIVABLE]: 'Customer Payment',
  [CashflowType.SUPPLIER_PAYABLE]: 'Supplier Payment',
  [CashflowType.BANK_OBLIGATION]: 'Bank Obligation',
  [CashflowType.INTERNAL_TRANSFER]: 'Internal Transfer',
  [CashflowType.TAX_PAYMENT]: 'Tax Payment',
  [CashflowType.LOAN_PAYMENT]: 'Loan Payment',
  [CashflowType.OTHER_INCOME]: 'Other Income',
  [CashflowType.OTHER_EXPENSE]: 'Other Expense'
};

export const CASHFLOW_STATUS_LABELS: Record<CashflowStatus, string> = {
  [CashflowStatus.PROJECTED]: 'Projected',
  [CashflowStatus.CONFIRMED]: 'Confirmed',
  [CashflowStatus.PARTIAL]: 'Partially Paid',
  [CashflowStatus.COMPLETED]: 'Completed',
  [CashflowStatus.OVERDUE]: 'Overdue',
  [CashflowStatus.CANCELLED]: 'Cancelled'
};

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  [RecurrenceFrequency.DAILY]: 'Daily',
  [RecurrenceFrequency.WEEKLY]: 'Weekly',
  [RecurrenceFrequency.BIWEEKLY]: 'Bi-weekly',
  [RecurrenceFrequency.MONTHLY]: 'Monthly',
  [RecurrenceFrequency.QUARTERLY]: 'Quarterly',
  [RecurrenceFrequency.ANNUALLY]: 'Annually'
};

export const BANK_OBLIGATION_TYPE_LABELS: Record<BankObligationType, string> = {
  [BankObligationType.LOAN_PAYMENT]: 'Loan Payment',
  [BankObligationType.ACCOUNT_FEES]: 'Account Fees',
  [BankObligationType.MAINTENANCE_FEES]: 'Maintenance Fees',
  [BankObligationType.OVERDRAFT_FEES]: 'Overdraft Fees',
  [BankObligationType.TRANSFER_FEES]: 'Transfer Fees',
  [BankObligationType.OTHER]: 'Other'
};

// Default values
export const DEFAULT_CONFIDENCE_LEVEL = 0.8;
export const DEFAULT_PROJECTION_RANGE_DAYS = 90;
export const HIGH_AMOUNT_THRESHOLD = 10000; // For alerts
export const LOW_CONFIDENCE_THRESHOLD = 0.5; // For alerts

// Phase-specific feature flags
export const FEATURE_FLAGS = {
  PHASE_1_ENABLED: true, // Basic projections from invoices
  PHASE_2_ENABLED: false, // Manual adjustments and scenarios
  PHASE_3_ENABLED: false, // Recurring items and bank obligations
  PHASE_4_ENABLED: false, // Advanced analytics and ML
} as const; 