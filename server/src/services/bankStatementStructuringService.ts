import { GoogleGenAI } from "@google/genai";
import { prisma } from '../lib/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { EGYPTIAN_BANKS, findEgyptianBankDisplayName } from '../lib/constants.js';
import { processBankStatementWithConcurrency } from '../lib/services/bankStatementConcurrencyService.js';
import { classifyBankStatementTransactions } from '../lib/services/classificationService.js';
import type { 
  ProcessingResult,
  AccountStatement as ConcurrencyAccountStatement
} from '../lib/services/bankStatementConcurrencyService.js';
import type { SSEMessage } from '../types/api.js';
import { logger } from '../utils/logger.js';

// --- Type definitions ---
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

type ChunkData = {
  chunk_number: number;
  pages: string;
  account_statements: AccountStatement[];
};

// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const FALLBACK_MODEL = "gemini-1.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;

// --- SSE Callback Interface ---
interface SSECallback {
  (data: SSEMessage): void;
}

// --- Updated Prompt for Chunked Bank Statement Structuring ---
const STRUCTURING_PROMPT = `
You are a document parser specialized in bank statement data extraction.

Given a CHUNK of raw text content from a bank statement, your task is to extract and structure the data into JSON format.

IMPORTANT CONTEXT:
- This is chunk {CHUNK_NUMBER} of a larger bank statement document
- The document may span multiple chunks/pages
- Account statements may continue across chunks
- Extract only the data visible in this chunk

For each account statement data you find in this chunk, extract the following:

{
  "chunk_number": {CHUNK_NUMBER},
  "pages": "{PAGES_INFO}",
  "account_statements": [
    {
      "bank_name": "",
      "account_number": "",
      "statement_period": {
        "start_date": "",
        "end_date": ""
      },
      "account_type": "",
      "account_currency": "",
      "starting_balance": "",
      "ending_balance": "",
      "transactions": [
        {
          "date": "",
          "credit_amount": "",
          "debit_amount": "",
          "description": "",
          "balance": "",
          "page_number": "",
        }
      ]
    }
  ]
}

Guidelines:
- Extract all transactions visible in this chunk
- If account information (bank_name, account_number, etc.) is not visible in this chunk but transactions are present, use "CONTINUATION" for missing fields
- Use account_number as the primary key for grouping transactions. Each account_number uniquely identifies a distinct account statement. All transactions that fall under the same account_number must be grouped together.
- If starting/ending balances are not visible in this chunk, use the starting balance
- Dates should be in ISO format (YYYY-MM-DD)
- Credit and debit amounts should be parsed as numerical values without currency symbols
- Page numbers should reflect the exact pdf page number when possible
- maintain the order of transactions as shown in the statement
- account_currency should be one of: USD, EUR, GBP, EGP, CNY, CAD, AUD, JPY based on the extracted currency from the statement
- account_type should be one of: Current Account (an account with clients own money) or Facility Account (an account with a bank's money) based on the extracted account type from the statement

BANK NAME SELECTION:
When extracting the bank name, try to match it with one of these Egyptian banks if possible:
${Object.values(EGYPTIAN_BANKS).map(bank => `- ${bank}`).join('\n')}

If you can identify the bank from the statement text, use the EXACT name from the list above. If you cannot match it to any of the Egyptian banks above, extract the bank name exactly as it appears in the document.

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or code blocks.
`.trim();

// Helper function to split text into chunks based on page markers
function splitIntoChunks(statementText: string): Array<{content: string, pages: string, chunkNumber: number}> {
    logger.info("Splitting statement text into chunks based on page markers");
    
    // Split by page markers like "=== PDF PAGES X-Y ==="
    const pageMarkerRegex = /=== PDF PAGES? (\d+(?:-\d+)?) ===/gi;
    const chunks: Array<{content: string, pages: string, chunkNumber: number}> = [];
    
    const parts = statementText.split(pageMarkerRegex);
    
    if (parts.length <= 1) {
        // No page markers found, treat as single chunk
        logger.info("No page markers found, treating as single chunk");
        return [{
            content: statementText,
            pages: "1-N",
            chunkNumber: 1
        }];
    }
    
    // Process parts - every odd index is a page range, every even index is content
    for (let i = 1; i < parts.length; i += 2) {
        const pages = parts[i]?.trim();
        const content = parts[i + 1]?.trim();
        
        if (content && content.length > 0) {
            chunks.push({
                content: content,
                pages: pages || `chunk-${Math.floor(i/2) + 1}`,
                chunkNumber: Math.floor(i/2) + 1
            });
        }
    }
    
    logger.info(`Split into ${chunks.length} chunks`);
    chunks.forEach((chunk, index) => {
        logger.info(`Chunk ${index + 1}: Pages ${chunk.pages}, Content length: ${chunk.content.length}`);
    });
    
    return chunks;
}

// Helper function to merge account statements from multiple chunks
function mergeAccountStatements(chunkResults: ChunkData[], fileName?: string): StructuredData {
    logger.info("Merging account statements from chunks in order");
    
    const accountMap = new Map<string, AccountStatement>();
    let documentBankName = ""; // Fallback bank name for the entire document
    let fallbackBankName = fileName || "Unknown Bank"; // Use filename as fallback
    
    // Sort chunk results by chunk number to ensure processing in order
    const sortedChunkResults = chunkResults.sort((a, b) => a.chunk_number - b.chunk_number);
    
    // First pass: Find any valid bank name in the document
    for (const chunkResult of sortedChunkResults) {
        for (const statement of chunkResult.account_statements) {
            if (statement.bank_name && 
                statement.bank_name !== "CONTINUATION" && 
                statement.bank_name.trim() !== "" && 
                statement.bank_name.toLowerCase() !== "unknown") {
                
                // Try to match with Egyptian banks first
                const matchedEgyptianBank = findEgyptianBankDisplayName(statement.bank_name);
                if (matchedEgyptianBank) {
                    documentBankName = matchedEgyptianBank;
                    logger.info(`Found and matched document bank name to Egyptian bank: "${documentBankName}"`);
                } else {
                    documentBankName = statement.bank_name;
                    logger.info(`Found document bank name (no Egyptian bank match): "${documentBankName}"`);
                }
                break;
            }
        }
        if (documentBankName) break;
    }
    
    // If no bank name found, use filename or generic fallback
    if (!documentBankName) {
        documentBankName = fallbackBankName;
        logger.info(`No bank name detected in document, using fallback: "${documentBankName}"`);
    }
    
    // Second pass: Process statements using account number as primary marker
    for (const chunkResult of sortedChunkResults) {
        logger.info(`Processing chunk ${chunkResult.chunk_number} with ${chunkResult.account_statements.length} account statements`);
        
        for (const statement of chunkResult.account_statements) {
            // Skip statements that have no account number at all
            if (!statement.account_number || 
                statement.account_number === "CONTINUATION" || 
                statement.account_number.trim() === "") {
                logger.warn(`Skipping statement with missing or invalid account number: "${statement.account_number}"`);
                continue;
            }
            
            // Determine effective bank name for this statement
            let effectiveBankName = statement.bank_name;
            if (!effectiveBankName || 
                effectiveBankName === "CONTINUATION" || 
                effectiveBankName.trim() === "" ||
                effectiveBankName.toLowerCase() === "unknown") {
                effectiveBankName = documentBankName;
            } else {
                // Try to match with Egyptian banks for consistency
                const matchedEgyptianBank = findEgyptianBankDisplayName(effectiveBankName);
                if (matchedEgyptianBank) {
                    effectiveBankName = matchedEgyptianBank;
                    logger.info(`Matched bank name "${statement.bank_name}" to Egyptian bank: "${effectiveBankName}"`);
                }
            }
            
            // Use account number as the primary key for merging
            const accountKey = statement.account_number.trim();
            
            if (accountMap.has(accountKey)) {
                // Merge transactions with existing account statement
                const existingStatement = accountMap.get(accountKey)!;
                existingStatement.transactions.push(...statement.transactions);
                
                // Update other fields if they were empty before
                if (existingStatement.bank_name === "CONTINUATION" && effectiveBankName !== "CONTINUATION") {
                    existingStatement.bank_name = effectiveBankName;
                }
                
                logger.info(`Merged ${statement.transactions.length} transactions into existing account ${accountKey}`);
            } else {
                // Create new account statement entry
                accountMap.set(accountKey, {
                    ...statement,
                    bank_name: effectiveBankName
                });
                
                logger.info(`Created new account statement for ${accountKey} with ${statement.transactions.length} transactions`);
            }
        }
    }
    
    const finalStatements = Array.from(accountMap.values());
    logger.info(`Final merge result: ${finalStatements.length} account statements`);
    
    return { account_statements: finalStatements };
}

function normalizeData(data: any): any {
    if (typeof data === 'string') {
        return data.trim();
    }
    if (Array.isArray(data)) {
        return data.map(normalizeData);
    }
    if (data && typeof data === 'object') {
        const normalized: any = {};
        for (const [key, value] of Object.entries(data)) {
            normalized[key] = normalizeData(value);
        }
        return normalized;
    }
    return data;
}

function convertToDecimal(value: any): Decimal | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // If it's already a Decimal, return as is
    if (value instanceof Decimal) {
        return value;
    }

    // Convert to string and clean up
    const stringValue = String(value)
        .replace(/,/g, '') // Remove commas
        .replace(/[^\d.-]/g, '') // Remove non-numeric characters except dots and dashes
        .trim();

    if (stringValue === '' || stringValue === '-') {
        return null;
    }

    try {
        const decimal = new Decimal(stringValue);
        return decimal;
    } catch (error) {
        logger.warn(`Failed to convert "${value}" to Decimal:`, error);
        return null;
    }
}

async function saveDebugResponse(responseText: string, fileName: string, error: string): Promise<void> {
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const debugDir = path.join(process.cwd(), 'debug-responses');
        
        // Ensure debug directory exists
        try {
            await fs.access(debugDir);
        } catch {
            await fs.mkdir(debugDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const debugFileName = `failed-response-${timestamp}-${fileName}.txt`;
        const debugFilePath = path.join(debugDir, debugFileName);
        
        const debugContent = `Error: ${error}\n\nTimestamp: ${new Date().toISOString()}\n\nRaw Response:\n${responseText}`;
        
        await fs.writeFile(debugFilePath, debugContent, 'utf-8');
        logger.info(`Debug response saved to: ${debugFilePath}`);
    } catch (saveError) {
        logger.error('Failed to save debug response:', saveError);
    }
}

function validateAndFixJSON(jsonString: string): string {
    // Remove any potential markdown code blocks
    let cleaned = jsonString.replace(/```json\s*|\s*```/g, '');
    cleaned = cleaned.replace(/```\s*|\s*```/g, '');
    
    // Try to find JSON-like content
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }
    
    // Basic JSON fixes
    cleaned = cleaned
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double quotes
        .replace(/\n|\r/g, ' ') // Remove line breaks
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    return cleaned;
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                break;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}

async function callGeminiAPI(ai: any, prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            temperature: 0.1,
            topK: 1,
            topP: 0.95,
            maxOutputTokens: 32768,
        }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
        // Try fallback model
        try {
            logger.warn(`Empty response from ${MODEL_NAME}, trying fallback model ${FALLBACK_MODEL}`);
            
            const fallbackResponse = await ai.models.generateContent({
                model: FALLBACK_MODEL,
                contents: {
                    parts: [{ text: prompt }]
                },
                config: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 32768,
                }
            });

            const fallbackText = fallbackResponse.text;
            if (!fallbackText || fallbackText.trim() === '') {
                throw new Error('Empty response from both primary and fallback models');
            }
            return fallbackText;
        } catch (fallbackError) {
            logger.error('Fallback model also failed:', fallbackError);
            throw new Error(`Both ${MODEL_NAME} and ${FALLBACK_MODEL} returned empty responses`);
        }
    }

    return responseText;
}

function performAutoValidation(statement: any): {
  status: 'passed' | 'failed';
  notes: string;
} {
    try {
        const transactions = statement.transactions || [];
        
        if (transactions.length === 0) {
            return {
                status: 'failed',
                notes: 'No transactions found for validation'
            };
        }

        let validationIssues: string[] = [];
        let transactionsWithBalance = 0;
        let balanceConsistencyIssues = 0;

        // Check balance consistency
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            
            if (transaction.balance !== null && transaction.balance !== undefined) {
                transactionsWithBalance++;
                
                // For transactions with balance, check if it makes mathematical sense
                const creditAmount = Number(transaction.creditAmount) || 0;
                const debitAmount = Number(transaction.debitAmount) || 0;
                const currentBalance = Number(transaction.balance) || 0;
                
                if (i > 0) {
                    const prevTransaction = transactions[i - 1];
                    const prevBalance = Number(prevTransaction.balance) || 0;
                    
                    // Expected balance calculation
                    const expectedBalance = prevBalance + creditAmount - debitAmount;
                    const balanceDifference = Math.abs(currentBalance - expectedBalance);
                    
                    // Allow for small rounding differences (up to 0.01)
                    if (balanceDifference > 0.01) {
                        balanceConsistencyIssues++;
                    }
                }
            }
        }

        // Determine validation status
        if (transactionsWithBalance === 0) {
            validationIssues.push('No balance information available for validation');
        }

        if (balanceConsistencyIssues > 0) {
            validationIssues.push(`${balanceConsistencyIssues} balance consistency issues found`);
        }

        // Check for basic data completeness
        const transactionsWithDates = transactions.filter((t: any) => t.transactionDate).length;
        const transactionsWithAmounts = transactions.filter((t: any) => 
            (t.creditAmount && Number(t.creditAmount) > 0) || 
            (t.debitAmount && Number(t.debitAmount) > 0)
        ).length;

        if (transactionsWithDates < transactions.length * 0.9) {
            validationIssues.push('Missing dates in more than 10% of transactions');
        }

        if (transactionsWithAmounts < transactions.length * 0.9) {
            validationIssues.push('Missing amounts in more than 10% of transactions');
        }

        const status: 'passed' | 'failed' = validationIssues.length === 0 ? 'passed' : 'failed';
        const notes = validationIssues.length === 0 
            ? `Validation passed for ${transactions.length} transactions with ${transactionsWithBalance} balance records`
            : validationIssues.join('; ');

        return { status, notes };

    } catch (error) {
        logger.error('Error during auto-validation:', error);
        return {
            status: 'failed',
            notes: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

async function processChunk(
    ai: any, 
    chunk: {content: string, pages: string, chunkNumber: number}
): Promise<ChunkData> {
    
    const prompt = STRUCTURING_PROMPT
        .replace(/{CHUNK_NUMBER}/g, chunk.chunkNumber.toString())
        .replace(/{PAGES_INFO}/g, chunk.pages);

    const finalPrompt = `${prompt}\n\nCHUNK CONTENT:\n${chunk.content}`;

    try {
        const responseText = await retryWithBackoff(() => callGeminiAPI(ai, finalPrompt));

        logger.info(`Raw Gemini response for chunk ${chunk.chunkNumber}:`, responseText.substring(0, 200) + '...');

        // Clean and validate JSON
        const cleanedJson = validateAndFixJSON(responseText);
        
        let parsedData;
        try {
            parsedData = JSON.parse(cleanedJson);
        } catch (parseError) {
            logger.error(`JSON parse error for chunk ${chunk.chunkNumber}:`, parseError);
            await saveDebugResponse(responseText, `chunk-${chunk.chunkNumber}`, `Parse error: ${parseError}`);
            throw new Error(`Failed to parse JSON response for chunk ${chunk.chunkNumber}: ${parseError}`);
        }

        // Normalize the data
        const normalizedData = normalizeData(parsedData);

        // Validate structure
        if (!normalizedData.account_statements || !Array.isArray(normalizedData.account_statements)) {
            logger.warn(`Invalid structure in chunk ${chunk.chunkNumber}, creating empty result`);
            return {
                chunk_number: chunk.chunkNumber,
                pages: chunk.pages,
                account_statements: []
            };
        }

        logger.info(`Successfully processed chunk ${chunk.chunkNumber}: ${normalizedData.account_statements.length} account statements`);

        return {
            chunk_number: normalizedData.chunk_number || chunk.chunkNumber,
            pages: normalizedData.pages || chunk.pages,
            account_statements: normalizedData.account_statements
        };

    } catch (error: any) {
        logger.error(`Error processing chunk ${chunk.chunkNumber}:`, error);
        await saveDebugResponse('', `chunk-${chunk.chunkNumber}`, error.message);
        throw error;
    }
}

/**
 * Main function to structure bank statement text using the Express server
 */
export async function structureBankStatement(
    statementText: string,
    fileName?: string,
    fileUrl?: string,
    supabaseUserId?: string,
    sendSSE?: SSECallback
): Promise<{
    success: boolean;
    savedStatements?: any[];
    processingResults?: ProcessingResult[];
    classificationResults?: any[];
    error?: string;
}> {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    if (!statementText) {
        throw new Error('Statement text is required');
    }

    if (!supabaseUserId) {
        throw new Error('User authentication required');
    }

    try {
        sendSSE?.({
            type: 'status',
            message: 'Starting bank statement structuring process',
            timestamp: new Date().toISOString()
        });

        // Initialize the GenAI client
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        logger.info('Initialized GenAI model for statement structuring');

        sendSSE?.({
            type: 'status',
            message: 'Initialized GenAI model for statement structuring',
            timestamp: new Date().toISOString()
        });

        logger.info("Starting chunked processing approach");
        
        sendSSE?.({
            type: 'status',
            message: 'Starting chunked processing approach',
            timestamp: new Date().toISOString()
        });
        
        // Step 1: Split the statement text into chunks
        const chunks = splitIntoChunks(statementText);
        
        if (chunks.length === 0) {
            throw new Error('No valid chunks found in the statement text');
        }
        
        logger.info(`Processing ${chunks.length} chunks`);
        
        sendSSE?.({
            type: 'chunks_prepared',
            totalChunks: chunks.length,
            timestamp: new Date().toISOString()
        });
        
        // Step 2: Process each chunk separately
        const chunkResults: ChunkData[] = [];
        
        for (const chunk of chunks) {
            try {
                sendSSE?.({
                    type: 'chunk_start',
                    chunkIndex: chunk.chunkNumber,
                    pages: chunk.pages,
                    totalChunks: chunks.length,
                    timestamp: new Date().toISOString()
                });

                const chunkResult = await processChunk(ai, chunk);
                chunkResults.push(chunkResult);
                
                logger.info(`Chunk ${chunk.chunkNumber} processed: ${chunkResult.account_statements.length} account statements found`);
                
                sendSSE?.({
                    type: 'chunk_complete',
                    chunkIndex: chunk.chunkNumber,
                    pages: chunk.pages,
                    totalChunks: chunks.length,
                    timestamp: new Date().toISOString()
                });
                
                // Add a small delay between chunks to avoid rate limiting
                if (chunks.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (chunkError: any) {
                logger.error(`Error processing chunk ${chunk.chunkNumber}:`, chunkError);
                
                sendSSE?.({
                    type: 'chunk_error',
                    chunkIndex: chunk.chunkNumber,
                    pages: chunk.pages,
                    error: chunkError.message,
                    timestamp: new Date().toISOString()
                });
                
                // Continue processing other chunks even if one fails
                chunkResults.push({
                    chunk_number: chunk.chunkNumber,
                    pages: chunk.pages,
                    account_statements: []
                });
            }
        }
        
        // Step 3: Merge the results from all chunks
        logger.info("Merging results from all chunks");
        
        sendSSE?.({
            type: 'status',
            message: 'Merging results from all chunks',
            timestamp: new Date().toISOString()
        });
        
        const structuredData = mergeAccountStatements(chunkResults, fileName);
        
        if (structuredData.account_statements.length === 0) {
            throw new Error('No account statements found in any of the processed chunks');
        }
        
        logger.info(`Final merged result: ${structuredData.account_statements.length} account statements`);

        // Step 4: Save the structured data to the database with concurrency handling
        const processingResults: ProcessingResult[] = [];
        const savedStatementIds: number[] = [];
        logger.info('Processing merged data with concurrency handling');

        sendSSE?.({
            type: 'status',
            message: 'Processing merged data with concurrency handling',
            timestamp: new Date().toISOString()
        });

        // Process each account statement with concurrency checks
        for (let i = 0; i < structuredData.account_statements.length; i++) {
            const statement = structuredData.account_statements[i];
            logger.info(`Processing statement ${i + 1}: ${statement.bank_name} / ${statement.account_number}`);

            try {
                // Validate that we have required fields - account_number is mandatory, bank_name should have fallback
                if (!statement.account_number || statement.account_number.trim() === "") {
                    logger.warn(`Skipping statement ${i + 1} with missing account_number`);
                    continue;
                }

                // Ensure we have a bank name (should be handled by merging function, but double-check)
                const effectiveBankName = statement.bank_name && statement.bank_name.trim() !== "" 
                    ? statement.bank_name 
                    : (fileName || "Unknown Bank");

                logger.info(`Processing statement with bank name: "${effectiveBankName}" and account: "${statement.account_number}"`);

                // Create a statement compatible with the concurrency service
                const concurrencyStatement: ConcurrencyAccountStatement = {
                    bank_name: effectiveBankName,
                    account_number: statement.account_number,
                    statement_period: statement.statement_period,
                    account_type: statement.account_type || '',
                    account_currency: statement.account_currency || '',
                    starting_balance: statement.starting_balance || '0',
                    ending_balance: statement.ending_balance || '0',
                    transactions: statement.transactions
                };

                // Process with concurrency handling - now with supabaseUserId
                const result = await processBankStatementWithConcurrency(
                    concurrencyStatement,
                    supabaseUserId,
                    fileName,
                    fileUrl,
                    statementText
                );

                processingResults.push(result);
                if (result.action !== 'SKIP_DUPLICATE') {
                    savedStatementIds.push(result.bankStatementId);
                }

                logger.info(`Statement ${i + 1} processed: ${result.action} - ${result.message}`);
                
            } catch (error) {
                logger.error(`Error processing bank statement ${i + 1}:`, error);
                // Don't throw error - continue processing other statements
                logger.warn(`Continuing with remaining statements after error with statement ${i + 1}`);
            }
        }

        // Step 5: Perform automatic validation on all saved statements
        sendSSE?.({
            type: 'status',
            message: 'Performing automatic validation on saved statements',
            timestamp: new Date().toISOString()
        });

        for (const statementId of savedStatementIds) {
            try {
                // Get the statement with transactions for validation
                const statementWithTransactions = await prisma.bankStatement.findUnique({
                    where: { id: statementId },
                    include: {
                        transactions: {
                            orderBy: {
                                transactionDate: 'asc'
                            }
                        }
                    }
                });

                if (statementWithTransactions) {
                    // Perform balance validation
                    const validationResult = performAutoValidation(statementWithTransactions);

                    // Update statement with validation result
                    await prisma.bankStatement.update({
                        where: { id: statementId },
                        data: {
                            validated: validationResult.status === 'passed',
                            validationStatus: validationResult.status,
                            validationNotes: validationResult.notes,
                            validatedAt: validationResult.status === 'passed' ? new Date() : null
                        }
                    });

                    logger.info(`Auto-validation for statement ${statementId}: ${validationResult.status}`);
                }
            } catch (validationError) {
                logger.error(`Error during auto-validation for statement ${statementId}:`, validationError);
                // Don't fail the entire process if validation fails
            }
        }

        // Get transaction counts for each saved statement
        const statementsWithCounts = await Promise.all(
            savedStatementIds.map(async (statementId) => {
                const count = await prisma.transaction.count({
                    where: { bankStatementId: statementId }
                });
                
                // Get the full statement details
                const statement = await prisma.bankStatement.findUnique({
                    where: { id: statementId },
                    select: {
                        id: true,
                        fileName: true,
                        bankName: true,
                        accountNumber: true
                    }
                });
                
                return {
                    id: statementId,
                    fileName: statement?.fileName || 'Unknown',
                    bankName: statement?.bankName || 'Unknown',
                    accountNumber: statement?.accountNumber || 'Unknown',
                    transactionCount: count
                };
            })
        );

        // Trigger automatic classification for each saved statement
        sendSSE?.({
            type: 'status',
            message: 'Triggering automatic classification for saved statements',
            timestamp: new Date().toISOString()
        });

        const classificationResults = [];
        for (const statementId of savedStatementIds) {
            try {
                logger.info(`Triggering automatic classification for bank statement ${statementId}`);
                
                // Trigger classification asynchronously (don't wait for it to complete)
                classifyBankStatementTransactions(statementId)
                    .then((result) => {
                        logger.info(`Classification completed for statement ${statementId}: ${result.classifiedCount}/${result.totalTransactions} transactions classified`);
                    })
                    .catch((error) => {
                        logger.error(`Classification failed for statement ${statementId}:`, error);
                    });
                
                classificationResults.push({
                    statementId: statementId,
                    status: 'triggered'
                });
                
            } catch (error) {
                logger.error(`Failed to trigger classification for statement ${statementId}:`, error);
                classificationResults.push({
                    statementId: statementId,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: true,
            savedStatements: statementsWithCounts,
            processingResults: processingResults.map(result => ({
                action: result.action,
                bankStatementId: result.bankStatementId,
                transactionCount: result.transactionCount,
                message: result.message
            })),
            classificationResults
        };

    } catch (error: any) {
        logger.error('Error in bank statement structuring:', error);
        
        // Provide more specific error messages for different types of failures
        let errorMessage = 'An unexpected error occurred during processing.';
        
        if (error.message?.includes('INTERNAL') || error.message?.includes('500')) {
            errorMessage = 'The AI service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429')) {
            errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message?.includes('INVALID_ARGUMENT') || error.message?.includes('400')) {
            errorMessage = 'The document format is not supported or the content is too complex to process.';
        } else if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('403')) {
            errorMessage = 'API access is denied. Please check the server configuration.';
        } else if (error.message?.includes('No valid chunks found')) {
            errorMessage = 'The document format is not supported. Please ensure the document has proper page markers.';
        } else if (error.message?.includes('No account statements found')) {
            errorMessage = 'No valid account statements could be extracted from the document.';
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
} 