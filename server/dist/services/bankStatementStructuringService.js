import { GoogleGenAI } from "@google/genai";
import { logger } from "../utils/logger.js";
// --- Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const FALLBACK_MODEL = "gemini-1.5-flash";
// --- Prompts ---
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
          "entity_name": ""
        }
      ]
    }
  ]
}

IMPORTANT EXTRACTION RULES:
1. Only extract data from THIS chunk - don't make assumptions about data from other chunks
2. If a transaction row spans multiple lines, combine them into a single transaction
3. For dates, use YYYY-MM-DD format
4. For amounts, extract numbers only (no currency symbols)
5. If account statement header info is not in this chunk, leave those fields empty
6. If starting/ending balance is not in this chunk, leave empty
7. Entity names should be extracted from transaction descriptions when possible
8. Page numbers should reflect the actual PDF page numbers from the chunk

Return only valid JSON. No additional text or explanations.
`;
// --- Helper Functions ---
function splitIntoChunks(statementText) {
    const chunks = [];
    // Split by page markers that were added during PDF parsing
    const pageMarkerRegex = /=== PDF PAGE[S]? (\d+)(?:-(\d+))? ===/g;
    const parts = statementText.split(pageMarkerRegex);
    if (parts.length <= 1) {
        // No page markers found, treat as single chunk
        chunks.push({
            content: statementText,
            pages: "1",
            chunkNumber: 1
        });
        return chunks;
    }
    let chunkNumber = 1;
    for (let i = 1; i < parts.length; i += 3) {
        const startPage = parts[i];
        const endPage = parts[i + 1] || startPage;
        const content = parts[i + 2] || "";
        if (content.trim()) {
            chunks.push({
                content: content.trim(),
                pages: endPage ? `${startPage}-${endPage}` : startPage,
                chunkNumber: chunkNumber++
            });
        }
    }
    return chunks;
}
function mergeAccountStatements(chunkResults, fileName) {
    const mergedStatements = [];
    const statementMap = new Map();
    // Process each chunk result
    for (const chunkResult of chunkResults) {
        for (const statement of chunkResult.account_statements) {
            const key = `${statement.bank_name}_${statement.account_number}`;
            if (statementMap.has(key)) {
                // Merge with existing statement
                const existingStatement = statementMap.get(key);
                // Merge transactions
                existingStatement.transactions = [
                    ...existingStatement.transactions,
                    ...statement.transactions
                ];
                // Update fields if they were empty in the existing statement
                if (!existingStatement.bank_name && statement.bank_name) {
                    existingStatement.bank_name = statement.bank_name;
                }
                if (!existingStatement.account_type && statement.account_type) {
                    existingStatement.account_type = statement.account_type;
                }
                if (!existingStatement.account_currency && statement.account_currency) {
                    existingStatement.account_currency = statement.account_currency;
                }
                if (!existingStatement.starting_balance && statement.starting_balance) {
                    existingStatement.starting_balance = statement.starting_balance;
                }
                if (!existingStatement.ending_balance && statement.ending_balance) {
                    existingStatement.ending_balance = statement.ending_balance;
                }
                // Merge statement periods
                if (statement.statement_period.start_date && statement.statement_period.end_date) {
                    if (!existingStatement.statement_period.start_date) {
                        existingStatement.statement_period.start_date = statement.statement_period.start_date;
                    }
                    if (!existingStatement.statement_period.end_date) {
                        existingStatement.statement_period.end_date = statement.statement_period.end_date;
                    }
                }
            }
            else {
                // Add new statement
                statementMap.set(key, { ...statement });
            }
        }
    }
    // Convert map to array
    mergedStatements.push(...statementMap.values());
    return { account_statements: mergedStatements };
}
function validateAndFixJSON(jsonString) {
    // Remove any non-JSON content before the first {
    const startIndex = jsonString.indexOf('{');
    if (startIndex > 0) {
        jsonString = jsonString.substring(startIndex);
    }
    // Remove any non-JSON content after the last }
    const endIndex = jsonString.lastIndexOf('}');
    if (endIndex >= 0) {
        jsonString = jsonString.substring(0, endIndex + 1);
    }
    // Fix common JSON issues
    jsonString = jsonString
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/:\s*,/g, ': null,') // Fix empty values
        .replace(/:\s*}/g, ': null}'); // Fix empty values at end
    return jsonString;
}
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw error;
            }
            const delay = baseDelay * Math.pow(2, attempt);
            logger.info(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
async function callGeminiAPI(ai, prompt) {
    return await retryWithBackoff(async () => {
        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 32768,
                }
            });
            const text = response.text || '';
            if (!text.trim()) {
                throw new Error('Empty response from Gemini API');
            }
            return text;
        }
        catch (error) {
            logger.error('Gemini API error:', error);
            // Try fallback model if primary fails
            if (error.message?.includes('model')) {
                logger.info('Trying fallback model...');
                const fallbackResponse = await ai.models.generateContent({
                    model: FALLBACK_MODEL,
                    contents: [{ parts: [{ text: prompt }] }],
                    config: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 0.95,
                        maxOutputTokens: 32768,
                    }
                });
                return fallbackResponse.text || '';
            }
            throw error;
        }
    });
}
async function processChunk(ai, chunk) {
    const prompt = STRUCTURING_PROMPT
        .replace('{CHUNK_NUMBER}', chunk.chunkNumber.toString())
        .replace('{PAGES_INFO}', chunk.pages)
        + '\n\nRaw text content:\n' + chunk.content;
    const response = await callGeminiAPI(ai, prompt);
    try {
        const fixedJson = validateAndFixJSON(response);
        const parsedData = JSON.parse(fixedJson);
        return {
            chunk_number: chunk.chunkNumber,
            pages: chunk.pages,
            account_statements: parsedData.account_statements || []
        };
    }
    catch (error) {
        logger.error(`Error parsing JSON for chunk ${chunk.chunkNumber}:`, error);
        logger.error('Raw response:', response);
        return {
            chunk_number: chunk.chunkNumber,
            pages: chunk.pages,
            account_statements: []
        };
    }
}
// --- Main Service Function ---
export async function structureBankStatement(statementText, fileName, sendSSE) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    sendSSE?.({
        type: 'status',
        message: 'Starting bank statement structuring process',
        timestamp: new Date().toISOString()
    });
    // Step 1: Split into chunks
    const chunks = splitIntoChunks(statementText);
    if (chunks.length === 0) {
        throw new Error('No valid chunks found in the statement text');
    }
    logger.info(`Processing ${chunks.length} chunks for structuring`);
    sendSSE?.({
        type: 'status',
        message: `Processing ${chunks.length} chunks`,
        timestamp: new Date().toISOString()
    });
    // Step 2: Process each chunk
    const chunkResults = [];
    for (const chunk of chunks) {
        try {
            sendSSE?.({
                type: 'status',
                message: `Processing chunk ${chunk.chunkNumber} (pages ${chunk.pages})`,
                timestamp: new Date().toISOString()
            });
            const chunkResult = await processChunk(ai, chunk);
            chunkResults.push(chunkResult);
            logger.info(`Chunk ${chunk.chunkNumber} processed: ${chunkResult.account_statements.length} account statements found`);
            // Add delay between chunks
            if (chunks.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        catch (error) {
            logger.error(`Error processing chunk ${chunk.chunkNumber}:`, error);
            // Continue with empty result for this chunk
            chunkResults.push({
                chunk_number: chunk.chunkNumber,
                pages: chunk.pages,
                account_statements: []
            });
        }
    }
    // Step 3: Merge results
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
    sendSSE?.({
        type: 'status',
        message: `Successfully structured ${structuredData.account_statements.length} account statements`,
        timestamp: new Date().toISOString()
    });
    return structuredData;
}
//# sourceMappingURL=bankStatementStructuringService.js.map