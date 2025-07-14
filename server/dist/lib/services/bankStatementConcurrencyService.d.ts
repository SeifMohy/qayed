export interface StatementPeriod {
    start_date: string;
    end_date: string;
}
export interface TransactionData {
    date: string;
    credit_amount: string;
    debit_amount: string;
    description: string;
    balance: string;
    page_number: string;
    entity_name: string;
}
export interface AccountStatement {
    bank_name: string;
    account_number: string;
    statement_period: StatementPeriod;
    account_type: string;
    account_currency: string;
    starting_balance: string;
    ending_balance: string;
    transactions: TransactionData[];
}
export interface ConcurrencyCheckResult {
    action: 'CREATE_NEW' | 'SKIP_DUPLICATE' | 'MERGE_DIFFERENT_PERIOD' | 'ADD_TO_EXISTING_BANK';
    existingBankId?: number;
    existingStatementId?: number;
    bankName: string;
    reason: string;
}
export interface ProcessingResult {
    bankStatementId: number;
    action: ConcurrencyCheckResult['action'];
    transactionCount: number;
    message: string;
}
/**
 * Check concurrency for a new bank statement
 */
export declare function checkBankStatementConcurrency(accountNumber: string, bankName: string, statementPeriodStart: Date, statementPeriodEnd: Date, companyId: number): Promise<ConcurrencyCheckResult>;
/**
 * Process a bank statement according to concurrency rules
 */
export declare function processBankStatementWithConcurrency(statement: AccountStatement, supabaseUserId: string, fileName?: string, fileUrl?: string, rawTextContent?: string): Promise<ProcessingResult>;
