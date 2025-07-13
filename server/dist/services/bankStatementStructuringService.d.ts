import type { SSEMessage } from "../types/api.js";
interface SSECallback {
    (data: SSEMessage): void;
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
export declare function structureBankStatement(statementText: string, fileName?: string, sendSSE?: SSECallback): Promise<StructuredData>;
export {};
