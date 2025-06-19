// === DEBUGGING INFO ===
//
// If you're still encountering empty responses or JSON parsing issues, try these troubleshooting steps:
//
// 1. Check your Gemini API key has access to the model "gemini-2.5-flash-preview-04-17"
// 2. Try a different Gemini model version if available (update MODEL_NAME constant)
// 3. Ensure your API key has not expired or hit rate limits
// 4. Try with a smaller sample of text if the document is very large
// 5. Check server logs for the full response from Gemini
//
// === END DEBUGGING INFO ===

import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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

if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
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

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or code blocks.
`.trim();

// Helper function to split text into chunks based on page markers
function splitIntoChunks(statementText: string): Array<{content: string, pages: string, chunkNumber: number}> {
    console.log("Splitting statement text into chunks based on page markers");
    
    // Split by page markers like "=== PDF PAGES X-Y ==="
    const pageMarkerRegex = /=== PDF PAGES? (\d+(?:-\d+)?) ===/gi;
    const chunks: Array<{content: string, pages: string, chunkNumber: number}> = [];
    
    const parts = statementText.split(pageMarkerRegex);
    
    if (parts.length <= 1) {
        // No page markers found, treat as single chunk
        console.log("No page markers found, treating as single chunk");
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
    
    console.log(`Split into ${chunks.length} chunks`);
    chunks.forEach((chunk, index) => {
        console.log(`Chunk ${index + 1}: Pages ${chunk.pages}, Content length: ${chunk.content.length}`);
    });
    
    return chunks;
}

// Helper function to merge account statements from multiple chunks
function mergeAccountStatements(chunkResults: ChunkData[], fileName?: string): StructuredData {
    console.log("Merging account statements from chunks in order");
    
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
                documentBankName = statement.bank_name;
                console.log(`Found document bank name: "${documentBankName}"`);
                break;
            }
        }
        if (documentBankName) break;
    }
    
    // If no bank name found, use filename or generic fallback
    if (!documentBankName) {
        documentBankName = fallbackBankName;
        console.log(`No bank name detected in document, using fallback: "${documentBankName}"`);
    }
    
    // Second pass: Process statements using account number as primary marker
    for (const chunkResult of sortedChunkResults) {
        console.log(`Processing chunk ${chunkResult.chunk_number} with ${chunkResult.account_statements.length} account statements`);
        
        for (const statement of chunkResult.account_statements) {
            // Skip statements that have no account number at all
            if (!statement.account_number || 
                statement.account_number === "CONTINUATION" || 
                statement.account_number.trim() === "") {
                console.warn(`Skipping statement with missing or invalid account number: "${statement.account_number}"`);
                continue;
            }
            
            // Determine effective bank name for this statement
            let effectiveBankName = statement.bank_name;
            if (!effectiveBankName || 
                effectiveBankName === "CONTINUATION" || 
                effectiveBankName.trim() === "" ||
                effectiveBankName.toLowerCase() === "unknown") {
                effectiveBankName = documentBankName;
            }
            
            // Use account number as the primary key for merging
            const accountKey = statement.account_number.trim();
            
            if (accountMap.has(accountKey)) {
                // Merge transactions with existing account statement
                const existingStatement = accountMap.get(accountKey)!;
                
                console.log(`Merging transactions for account ${accountKey} from chunk ${chunkResult.chunk_number}`);
                
                // Add chunk information to transactions for ordering
                const newTransactions = statement.transactions.map(transaction => ({
                    ...transaction,
                    _chunkNumber: chunkResult.chunk_number
                }));
                
                // Merge transactions and sort by chunk number to maintain document order
                const allTransactions = [
                    ...existingStatement.transactions.map(t => ({ 
                        ...t, 
                        _chunkNumber: (t as any)._chunkNumber || 0 
                    })),
                    ...newTransactions
                ];
                
                // Sort by chunk number first (to maintain document order)
                allTransactions.sort((a, b) => {
                    const chunkDiff = (a as any)._chunkNumber - (b as any)._chunkNumber;
                    if (chunkDiff !== 0) return chunkDiff;
                    // Within the same chunk, maintain original order
                    return 0;
                });
                
                // Remove the temporary _chunkNumber field
                existingStatement.transactions = allTransactions.map(({ _chunkNumber, ...transaction }) => transaction);
                
                // Update statement fields with non-empty values from current chunk
                if (effectiveBankName && effectiveBankName !== "CONTINUATION" && effectiveBankName.trim() !== "") {
                    existingStatement.bank_name = effectiveBankName;
                }
                if (statement.account_type && statement.account_type !== "CONTINUATION" && statement.account_type.trim() !== "") {
                    existingStatement.account_type = statement.account_type;
                }
                if (statement.account_currency && statement.account_currency !== "CONTINUATION" && statement.account_currency.trim() !== "") {
                    existingStatement.account_currency = statement.account_currency;
                }
                if (statement.starting_balance && statement.starting_balance !== "" && statement.starting_balance !== "0" && statement.starting_balance !== "0.00") {
                    existingStatement.starting_balance = statement.starting_balance;
                }
                if (statement.ending_balance && statement.ending_balance !== "" && statement.ending_balance !== "0" && statement.ending_balance !== "0.00") {
                    existingStatement.ending_balance = statement.ending_balance;
                }
                if (statement.statement_period.start_date && statement.statement_period.start_date !== "") {
                    existingStatement.statement_period.start_date = statement.statement_period.start_date;
                }
                if (statement.statement_period.end_date && statement.statement_period.end_date !== "") {
                    existingStatement.statement_period.end_date = statement.statement_period.end_date;
                }
                
                console.log(`Merged ${statement.transactions.length} transactions into existing account ${accountKey}, total transactions: ${existingStatement.transactions.length}`);
            } else {
                // Add new account statement
                const newStatement = {
                    bank_name: effectiveBankName,
                    account_number: statement.account_number,
                    statement_period: statement.statement_period,
                    account_type: statement.account_type || "",
                    account_currency: statement.account_currency || "",
                    starting_balance: statement.starting_balance || "",
                    ending_balance: statement.ending_balance || "",
                    transactions: statement.transactions.map(transaction => ({
                        ...transaction
                    }))
                };
                
                accountMap.set(accountKey, newStatement);
                console.log(`Added new account statement for account ${accountKey} with ${statement.transactions.length} transactions`);
            }
        }
    }
    
    // Final validation and cleanup
    const mergedStatements = Array.from(accountMap.values());
    
    // Ensure all statements have valid bank names
    mergedStatements.forEach(statement => {
        if (!statement.bank_name || statement.bank_name.trim() === "" || statement.bank_name === "CONTINUATION") {
            statement.bank_name = documentBankName;
            console.log(`Applied fallback bank name "${documentBankName}" to account ${statement.account_number}`);
        }
    });
    
    // Find the longest date range among all statements for fallback
    let longestRange: { start_date: string; end_date: string } | null = null;
    let longestDuration = 0;
    
    mergedStatements.forEach(statement => {
        if (statement.statement_period.start_date && statement.statement_period.end_date) {
            try {
                const startDate = new Date(statement.statement_period.start_date);
                const endDate = new Date(statement.statement_period.end_date);
                const duration = endDate.getTime() - startDate.getTime();
                
                if (duration > longestDuration) {
                    longestDuration = duration;
                    longestRange = {
                        start_date: statement.statement_period.start_date,
                        end_date: statement.statement_period.end_date
                    };
                }
            } catch (error) {
                // Invalid dates, skip this statement for range calculation
            }
        }
    });
    
    // Apply longest range to statements with missing date ranges
    if (longestRange) {
        mergedStatements.forEach(statement => {
            if (!statement.statement_period.start_date || !statement.statement_period.end_date) {
                console.log(`Applying longest date range fallback to account ${statement.account_number}: ${longestRange!.start_date} to ${longestRange!.end_date}`);
                statement.statement_period.start_date = longestRange!.start_date;
                statement.statement_period.end_date = longestRange!.end_date;
            }
        });
    }
    
    console.log(`Final result: ${mergedStatements.length} account statements with properly ordered transactions`);
    mergedStatements.forEach(statement => {
        console.log(`Account ${statement.account_number} (${statement.bank_name}): ${statement.transactions.length} transactions`);
    });
    
    return {
        account_statements: mergedStatements
    };
}

// Helper function to normalize the data structure
function normalizeData(data: any): any {
  console.log("Normalizing data structure");
  // If the data is not in the expected format, create a wrapper
  if (!data.account_statements) {
    // If there's an account_statement (singular), wrap it in account_statements array
    if (data.account_statement) {
      return {
        account_statements: [data.account_statement]
      };
    }
    
    // If it looks like a single account directly, wrap it
    if (data.bank_name || data.account_number) {
      return {
        account_statements: [data]
      };
    }
    
    // Fallback with empty array
    return {
      account_statements: []
    };
  }
  
  // If account_statements exists but is not an array, convert it
  if (!Array.isArray(data.account_statements)) {
    return {
      account_statements: [data.account_statements]
    };
  }
  
  // If it's already an array, just return the data
  return data;
}

// Helper function to convert string to Decimal
function convertToDecimal(value: any): Decimal | null {
    // Handle null, undefined, or empty values
    if (!value || value === '') {
        return null;
    }
    
    // Convert to string if not already a string
    const stringValue = String(value);
    
    // Check for 'unknown' keyword
    if (stringValue.toLowerCase() === 'unknown') {
        return null;
    }

    try {
        // Remove any non-numeric characters except decimal points and negative signs
        const cleanedValue = stringValue.replace(/[^0-9.-]/g, '');
        
        // If after cleaning there's nothing left, return null
        if (!cleanedValue || cleanedValue === '' || cleanedValue === '-') {
            return null;
        }
        
        return new Decimal(cleanedValue);
    } catch (error) {
        console.warn(`Could not convert value to Decimal: ${value} (type: ${typeof value})`);
        return null;
    }
}

// Helper function to save problematic responses for debugging
async function saveDebugResponse(responseText: string, fileName: string, error: string): Promise<void> {
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const debugDir = path.join(process.cwd(), 'debug-responses');
        
        // Create debug directory if it doesn't exist
        try {
            await fs.access(debugDir);
        } catch {
            await fs.mkdir(debugDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const debugFileName = `failed-response-${timestamp}-${fileName || 'unknown'}.txt`;
        const debugFilePath = path.join(debugDir, debugFileName);
        
        const debugContent = `
=== FAILED JSON PARSING DEBUG INFO ===
Timestamp: ${new Date().toISOString()}
Original File: ${fileName || 'unknown'}
Error: ${error}
Response Length: ${responseText.length}

=== RAW RESPONSE ===
${responseText}

=== END DEBUG INFO ===
        `.trim();
        
        await fs.writeFile(debugFilePath, debugContent, 'utf8');
        console.log(`Debug response saved to: ${debugFilePath}`);
    } catch (debugError) {
        console.error('Failed to save debug response:', debugError);
    }
}

// Helper function to validate and potentially fix JSON structure
function validateAndFixJSON(jsonString: string): string {
    console.log("Validating and fixing JSON structure");
    
    let cleaned = jsonString.trim();
    
    // Remove any markdown code block indicators
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7).trim();
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3).trim();
    }
    
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }
    
    // Find the actual JSON content
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart > 0) {
        cleaned = cleaned.substring(jsonStart);
    }
    
    // Try to find the end of the JSON by counting braces
    let braceCount = 0;
    let jsonEnd = -1;
    
    for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') {
            braceCount++;
        } else if (cleaned[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                jsonEnd = i + 1;
                break;
            }
        }
    }
    
    if (jsonEnd > 0 && jsonEnd < cleaned.length) {
        console.log(`Truncating JSON at position ${jsonEnd} (original length: ${cleaned.length})`);
        cleaned = cleaned.substring(0, jsonEnd);
    }
    
    // Clean up common JSON formatting issues
    cleaned = cleaned
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/\n/g, ' ')           // Replace newlines with spaces
        .replace(/\r/g, ' ')           // Replace carriage returns
        .replace(/\t/g, ' ')           // Replace tabs
        .replace(/\s+/g, ' ')          // Collapse multiple spaces
        .trim();
    
    console.log(`JSON validation complete. Original length: ${jsonString.length}, Cleaned length: ${cleaned.length}`);
    
    return cleaned;
}

// Helper function to retry API calls with exponential backoff¬
async function retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            console.warn(`Attempt ${attempt + 1} failed:`, error.message);
            
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// Helper function to make Gemini API call with fallback models
async function callGeminiAPI(ai: any, prompt: string): Promise<string> {
    const models = [MODEL_NAME, FALLBACK_MODEL];
    
    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName}`);
            
            const response = await retryWithBackoff(async () => {
                return await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: {
                        temperature: 0.1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 48000,
                    }
                });
            });
            
            if (!response) {
                throw new Error("Received null response from GenAI API");
            }
            
            const responseText = response.text || '';
            if (!responseText || responseText.trim() === '') {
                throw new Error("GenAI returned empty response");
            }
            
            console.log(`Successfully got response from ${modelName}, length: ${responseText.length}`);
            
            // Additional validation to check if response looks like it might be truncated
            const trimmedResponse = responseText.trim();
            
            // Check if response starts with { but doesn't end with }
            if (trimmedResponse.startsWith('{') && !trimmedResponse.endsWith('}')) {
                console.warn("Warning: Response appears to be truncated - starts with { but doesn't end with }");
                console.log("Response ends with:", trimmedResponse.slice(-100));
            }
            
            // Check if response contains "account_statements" which we expect
            if (!trimmedResponse.includes('account_statements')) {
                console.warn("Warning: Response doesn't contain expected 'account_statements' field");
            }
            
            // Log response structure for debugging
            console.log("Response structure check:");
            console.log("- Starts with '{':", trimmedResponse.startsWith('{'));
            console.log("- Ends with '}':", trimmedResponse.endsWith('}'));
            console.log("- Contains 'account_statements':", trimmedResponse.includes('account_statements'));
            console.log("- First 100 chars:", trimmedResponse.substring(0, 100));
            console.log("- Last 100 chars:", trimmedResponse.substring(Math.max(0, trimmedResponse.length - 100)));
            
            return responseText;
            
        } catch (error: any) {
            console.error(`Model ${modelName} failed:`, error.message);
            
            // If this is the last model, throw the error
            if (modelName === models[models.length - 1]) {
                throw error;
            }
            
            // Otherwise, try the next model
            console.log(`Trying fallback model...`);
        }
    }
    
    throw new Error("All models failed");
}

// Helper function to perform balance validation
function performAutoValidation(statement: any): {
  status: 'passed' | 'failed';
  notes: string;
} {
  const startingBalance = Number(statement.startingBalance);
  const endingBalance = Number(statement.endingBalance);
  const transactions = statement.transactions;

  // Calculate totals
  let totalCredits = 0;
  let totalDebits = 0;

  transactions.forEach((transaction: any) => {
    if (transaction.creditAmount) {
      totalCredits += Number(transaction.creditAmount);
    }
    if (transaction.debitAmount) {
      totalDebits += Number(transaction.debitAmount);
    }
  });

  // Calculate expected ending balance
  const calculatedBalance = startingBalance + totalCredits - totalDebits;
  const discrepancy = Math.abs(calculatedBalance - endingBalance);

  // Determine validation status
  const tolerance = 0.01; // Allow 1 cent tolerance for rounding
  const status = discrepancy <= tolerance ? 'passed' : 'failed';

  // Generate notes
  let notes = '';
  if (status === 'passed') {
    notes = `Auto-validation passed during processing. Starting balance (${startingBalance.toFixed(2)}) + Credits (${totalCredits.toFixed(2)}) - Debits (${totalDebits.toFixed(2)}) = Ending balance (${endingBalance.toFixed(2)})`;
  } else {
    notes = `Auto-validation failed during processing. Expected ending balance: ${calculatedBalance.toFixed(2)}, Actual: ${endingBalance.toFixed(2)}, Discrepancy: ${discrepancy.toFixed(2)}`;
  }

  return {
    status,
    notes
  };
}

// Helper function to process a single chunk
async function processChunk(
    ai: any, 
    chunk: {content: string, pages: string, chunkNumber: number}
): Promise<ChunkData> {
    console.log(`Processing chunk ${chunk.chunkNumber} (pages ${chunk.pages})`);
    
    // Create chunk-specific prompt
    const chunkPrompt = STRUCTURING_PROMPT
        .replace('{CHUNK_NUMBER}', chunk.chunkNumber.toString())
        .replace('{PAGES_INFO}', chunk.pages);
    
    const prompt = `${chunkPrompt}\n\nHere is chunk ${chunk.chunkNumber} of the bank statement text to parse:\n${chunk.content}`;
    
    const responseText = await callGeminiAPI(ai, prompt);
    const cleanedText = validateAndFixJSON(responseText);
    
    let parsedData;
    try {
        parsedData = JSON.parse(cleanedText);
        console.log(`Successfully parsed JSON for chunk ${chunk.chunkNumber}`);
    } catch (parseError: any) {
        console.error(`Failed to parse JSON for chunk ${chunk.chunkNumber}:`, parseError);
        
        // Try manual fix approach
        try {
            let manualFix = cleanedText;
            
            if (!manualFix.startsWith('{')) {
                const startIndex = manualFix.indexOf('{');
                if (startIndex > -1) {
                    manualFix = manualFix.substring(startIndex);
                }
            }
            
            if (!manualFix.endsWith('}')) {
                const openBraces = (manualFix.match(/\{/g) || []).length;
                const closeBraces = (manualFix.match(/\}/g) || []).length;
                const missingBraces = openBraces - closeBraces;
                
                if (missingBraces > 0) {
                    manualFix += '}'.repeat(missingBraces);
                }
            }
            
            parsedData = JSON.parse(manualFix);
            console.log(`Successfully parsed JSON for chunk ${chunk.chunkNumber} after manual fix`);
        } catch (finalParseError: any) {
            throw new Error(`Failed to parse JSON from chunk ${chunk.chunkNumber}. Parse error: ${finalParseError.message}`);
        }
    }
    
    // Normalize the data structure
    // const normalizedData = normalizeData(parsedData);
    
    return {
        chunk_number: chunk.chunkNumber,
        pages: chunk.pages,
        account_statements: parsedData.account_statements || []
    };
}

// --- API Route Handler ---
export async function POST(request: Request) {
    console.log("=== BANK STATEMENT PROCESSING STARTED (CHUNKED) ===");
    if (!API_KEY) {
        return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
    }

    try {
        const data = await request.json();
        const { statementText, fileName, fileUrl } = data;
        
        console.log(`Request received with filename: ${fileName || 'unnamed'}`);
        console.log(`File URL: ${fileUrl || 'not provided'}`);
        console.log(`Statement text length: ${statementText ? statementText.length : 0} characters`);

        if (!statementText) {
            return NextResponse.json({ error: 'No statement text provided for processing.' }, { status: 400 });
        }

        // Initialize the GenAI client
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('Initialized GenAI model for statement structuring');

        try {
            console.log("Starting chunked processing approach");
            
            // Step 1: Split the statement text into chunks
            const chunks = splitIntoChunks(statementText);
            
            if (chunks.length === 0) {
                throw new Error('No valid chunks found in the statement text');
            }
            
            console.log(`Processing ${chunks.length} chunks`);
            
            // Step 2: Process each chunk separately
            const chunkResults: ChunkData[] = [];
            
            for (const chunk of chunks) {
                try {
                    const chunkResult = await processChunk(ai, chunk);
                    chunkResults.push(chunkResult);
                    
                    console.log(`Chunk ${chunk.chunkNumber} processed: ${chunkResult.account_statements.length} account statements found`);
                    
                    // Add a small delay between chunks to avoid rate limiting
                    if (chunks.length > 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (chunkError: any) {
                    console.error(`Error processing chunk ${chunk.chunkNumber}:`, chunkError);
                    
                    // Continue processing other chunks even if one fails
                    chunkResults.push({
                        chunk_number: chunk.chunkNumber,
                        pages: chunk.pages,
                        account_statements: []
                    });
                }
            }
            
            // Step 3: Merge the results from all chunks
            console.log("Merging results from all chunks");
            const structuredData = mergeAccountStatements(chunkResults, fileName);
            
            if (structuredData.account_statements.length === 0) {
                throw new Error('No account statements found in any of the processed chunks');
            }
            
            console.log(`Final merged result: ${structuredData.account_statements.length} account statements`);

            // Step 4: Save the structured data to the database
            const savedStatements = [];
            console.log('Saving merged data to database');

            // Process each account statement and save to database
            for (let i = 0; i < structuredData.account_statements.length; i++) {
                const statement = structuredData.account_statements[i];
                console.log(`Processing statement ${i + 1}: ${statement.bank_name} / ${statement.account_number}`);

                try {
                    // Validate that we have required fields - account_number is mandatory, bank_name should have fallback
                    if (!statement.account_number || statement.account_number.trim() === "") {
                        console.warn(`Skipping statement ${i + 1} with missing account_number`);
                        continue;
                    }

                    // Ensure we have a bank name (should be handled by merging function, but double-check)
                    const effectiveBankName = statement.bank_name && statement.bank_name.trim() !== "" 
                        ? statement.bank_name 
                        : (fileName || "Unknown Bank");

                    console.log(`Saving statement with bank name: "${effectiveBankName}" and account: "${statement.account_number}"`);

                    // Convert string values to appropriate types
                    const startingBalance = convertToDecimal(statement.starting_balance);
                    const endingBalance = convertToDecimal(statement.ending_balance);

                    // Find or create the bank
                    let bank = await prisma.bank.findUnique({
                        where: { name: effectiveBankName }
                    });

                    if (!bank) {
                        bank = await prisma.bank.create({
                            data: { name: effectiveBankName }
                        });
                        console.log(`Created new bank: ${bank.name} with ID: ${bank.id}`);
                    } else {
                        console.log(`Found existing bank: ${bank.name} with ID: ${bank.id}`);
                    }

                    // Prepare statement period dates - let LLM handle formatting, simple fallbacks only
                    let statementPeriodStart: Date;
                    let statementPeriodEnd: Date;

                    try {
                        if (statement.statement_period.start_date && statement.statement_period.start_date.trim() !== "") {
                            statementPeriodStart = new Date(statement.statement_period.start_date);
                        } else {
                            // Simple fallback - use current date
                            statementPeriodStart = new Date();
                        }
                    } catch (dateError) {
                        console.warn(`Invalid start date for statement ${i + 1}, using current date`);
                        statementPeriodStart = new Date();
                    }

                    try {
                        if (statement.statement_period.end_date && statement.statement_period.end_date.trim() !== "") {
                            statementPeriodEnd = new Date(statement.statement_period.end_date);
                        } else {
                            // Simple fallback - use current date
                            statementPeriodEnd = new Date();
                        }
                    } catch (dateError) {
                        console.warn(`Invalid end date for statement ${i + 1}, using current date`);
                        statementPeriodEnd = new Date();
                    }

                    // Create the bank statement record
                    const bankStatement = await prisma.bankStatement.create({
                        data: {
                            fileName,
                            fileUrl,
                            bankName: effectiveBankName,
                            accountNumber: statement.account_number,
                            statementPeriodStart,
                            statementPeriodEnd,
                            accountType: statement.account_type || null,
                            accountCurrency: statement.account_currency || null,
                            startingBalance: startingBalance || new Decimal(0),
                            endingBalance: endingBalance || new Decimal(0),
                            rawTextContent: statementText,
                            bankId: bank.id, // Link to the bank
                            // New annotation fields
                            parsed: true, // Mark as parsed since we just processed it
                            validated: false, // Not yet validated
                            validationStatus: 'pending', // Pending validation
                            // Create transactions in the same operation
                            transactions: {
                                create: statement.transactions.map((transaction: TransactionData, index: number) => {
                                    try {
                                        // Prepare transaction date - let LLM handle formatting
                                        let transactionDate: Date;
                                        try {
                                            if (transaction.date && transaction.date.trim() !== "") {
                                                transactionDate = new Date(transaction.date);
                                            } else {
                                                // Use statement period start as fallback
                                                transactionDate = statementPeriodStart;
                                            }
                                        } catch {
                                            // Use statement period start as fallback
                                            transactionDate = statementPeriodStart;
                                            console.warn(`Invalid transaction date for transaction ${index + 1}, using statement start date`);
                                        }

                                        return {
                                            transactionDate,
                                            creditAmount: convertToDecimal(transaction.credit_amount) || null,
                                            debitAmount: convertToDecimal(transaction.debit_amount) || null,
                                            description: String(transaction.description || ''),
                                            balance: convertToDecimal(transaction.balance) || null,
                                            pageNumber: String(transaction.page_number || ''),
                                            entityName: String(transaction.entity_name || ''),
                                        };
                                    } catch (transactionError: any) {
                                        console.error(`Error processing transaction ${index + 1}:`, transactionError);
                                        console.error('Transaction data:', transaction);
                                        throw new Error(`Failed to process transaction ${index + 1}: ${transactionError.message}`);
                                    }
                                })
                            }
                        }
                    });

                    console.log(`Saved bank statement ID: ${bankStatement.id} with ${statement.transactions.length} transactions`);
                    savedStatements.push(bankStatement);
                } catch (error) {
                    console.error(`Error saving bank statement ${i + 1}:`, error);
                    // Don't throw error - continue processing other statements
                    console.warn(`Continuing with remaining statements after error with statement ${i + 1}`);
                }
            }

            // Step 5: Perform automatic validation on all saved statements
            for (const statement of savedStatements) {
                try {
                    // Get the statement with transactions for validation
                    const statementWithTransactions = await prisma.bankStatement.findUnique({
                        where: { id: statement.id },
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
                            where: { id: statement.id },
                            data: {
                                validated: validationResult.status === 'passed',
                                validationStatus: validationResult.status,
                                validationNotes: validationResult.notes,
                                validatedAt: validationResult.status === 'passed' ? new Date() : null
                            }
                        });

                        console.log(`Auto-validation for statement ${statement.id}: ${validationResult.status}`);
                    }
                } catch (validationError) {
                    console.error(`Error during auto-validation for statement ${statement.id}:`, validationError);
                    // Don't fail the entire process if validation fails
                }
            }

            console.log(`Successfully saved ${savedStatements.length} bank statements from ${chunks.length} chunks`);

            // Get transaction counts for each saved statement
            const statementsWithCounts = await Promise.all(
                savedStatements.map(async (statement) => {
                    const count = await prisma.transaction.count({
                        where: { bankStatementId: statement.id }
                    });
                    return {
                        id: statement.id,
                        bankName: statement.bankName,
                        accountNumber: statement.accountNumber,
                        transactionCount: count
                    };
                })
            );

            // Trigger automatic classification for each saved statement
            const classificationResults = [];
            for (const statement of savedStatements) {
                try {
                    console.log(`Triggering automatic classification for bank statement ${statement.id}`);
                    
                    // Import the classification service
                    const { classifyBankStatementTransactions } = await import('@/lib/services/classificationService');
                    
                    // Trigger classification asynchronously (don't wait for it to complete)
                    classifyBankStatementTransactions(statement.id)
                        .then((result) => {
                            console.log(`Classification completed for statement ${statement.id}: ${result.classifiedCount}/${result.totalTransactions} transactions classified`);
                        })
                        .catch((error) => {
                            console.error(`Classification failed for statement ${statement.id}:`, error);
                        });
                    
                    classificationResults.push({
                        statementId: statement.id,
                        status: 'triggered'
                    });
                } catch (error) {
                    console.error(`Failed to trigger classification for statement ${statement.id}:`, error);
                    classificationResults.push({
                        statementId: statement.id,
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            return NextResponse.json({
                success: true,
                fileName: fileName || "statement",
                chunksProcessed: chunks.length,
                structuredData,
                savedStatements: statementsWithCounts,
                classificationResults
            });

        } catch (error: any) {
            console.error('Error in chunked statement structuring:', error);
            
            // Provide more specific error messages for different types of failures
            let errorMessage = 'An unexpected error occurred during chunked processing.';
            
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
            
            return NextResponse.json({
                success: false,
                error: errorMessage,
                technicalError: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error in structure-bankstatement route:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'An unexpected error occurred during processing.',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
} 