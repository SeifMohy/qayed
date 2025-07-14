/**
 * Automatically classify transactions for a specific bank statement
 * @param bankStatementId - The ID of the bank statement to classify transactions for
 * @returns Classification result summary
 */
export declare function classifyBankStatementTransactions(bankStatementId: number): Promise<{
    success: boolean;
    classifiedCount: number;
    totalTransactions: number;
    errors: string[];
}>;
