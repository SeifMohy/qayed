import type { ProcessingResult } from '../lib/services/bankStatementConcurrencyService.js';
import type { SSEMessage } from '../types/api.js';
interface SSECallback {
    (data: SSEMessage): void;
}
/**
 * Main function to structure bank statement text using the Express server
 */
export declare function structureBankStatement(statementText: string, fileName?: string, fileUrl?: string, supabaseUserId?: string, sendSSE?: SSECallback): Promise<{
    success: boolean;
    savedStatements?: any[];
    processingResults?: ProcessingResult[];
    classificationResults?: any[];
    error?: string;
}>;
export {};
