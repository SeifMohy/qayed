// Common application types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
  lastUpdated?: Date;
}

export interface KeyFigure {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
} 

type StatementPeriod = {
  start_date: string;
  end_date: string;
};

type TransactionData = {
  date: string;
  credit_amount: string;
  debit_amount: string;
  description: string;
  balance: string;
  page_number: string;
  entity_name: string;
};

type AccountStatement = {
  bank_name: string;
  account_number: string;
  statement_period: StatementPeriod;
  account_type: string;
  account_currency: string;
  starting_balance: string;
  ending_balance: string;
  transactions: TransactionData[];
};

type StructuredData = {
  account_statements: AccountStatement[];
};
