export interface PaymentTermsInstallment {
  id: string;
  amount?: number;
  percentage?: number;
  dueDays: number; // Days relative to invoice date
  description?: string;
}

export interface PaymentTermsDownPayment {
  required: boolean;
  amount?: number;
  percentage?: number;
  dueDate: string; // "Due on signing" or "Due on receipt" or specific days
}

export interface PaymentTermsData {
  paymentPeriod: string; // "Net 30", "Net 60", "Due on receipt", "Custom", etc.
  downPayment?: PaymentTermsDownPayment;
  installments?: PaymentTermsInstallment[];
}

export const PAYMENT_PERIOD_OPTIONS = [
  "Due on receipt",
  "Net 15", 
  "Net 30",
  "Net 45", 
  "Net 60",
  "Net 90",
  "Custom"
] as const;

export const DOWN_PAYMENT_DUE_OPTIONS = [
  "Due on signing",
  "Due on receipt",
  "Net 7",
  "Net 15",
  "Net 30"
] as const;

export type PaymentPeriodOption = typeof PAYMENT_PERIOD_OPTIONS[number];
export type DownPaymentDueOption = typeof DOWN_PAYMENT_DUE_OPTIONS[number]; 