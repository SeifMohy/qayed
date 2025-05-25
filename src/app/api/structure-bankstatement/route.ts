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

// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const FALLBACK_MODEL = "gemini-1.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
}

// --- Prompt for Bank Statement Structuring ---
const STRUCTURING_PROMPT = `
You are a document parser specialized in bank statement data extraction.

Given the raw text content of a bank statement, your task is to extract and structure the data into JSON format.

The document may contain MULTIPLE account statements. For each unique account statement you find, extract the following:

{
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
          "entity_name": "",
        }
      ]
    }
  ]
}

Guidelines:
- An account statement changes when the account number or statement period changes
- Add each distinct account statement as a separate object in the account_statements array
- Dates should be in ISO format (YYYY-MM-DD) if possible
- Credit and debit amounts should be parsed as numerical values without currency symbols
- If the amount is ambiguous, leave it blank or return "unknown" rather than guessing
- Entity name is the name of the person or company that the transaction is for

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or code blocks.
`.trim(); // TODO: Improve prompt to handle all the required fields better. 

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

// Helper function to safely convert dates
function convertToDate(dateValue: any): Date {
    if (!dateValue) {
        throw new Error('Date value is required');
    }
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date value: ${dateValue}`);
    }
    
    return date;
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

// Helper function to retry API calls with exponential backoff
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

// --- API Route Handler ---
export async function POST(request: Request) {
    console.log("=== BANK STATEMENT PROCESSING STARTED ===");
    if (!API_KEY) {
        return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
    }

    try {
        const data = await request.json();
        const { statementText, fileName } = data;
        
        console.log(`Request received with filename: ${fileName || 'unnamed'}`);
        console.log(`Statement text length: ${statementText ? statementText.length : 0} characters`);

        if (!statementText) {
            return NextResponse.json({ error: 'No statement text provided for processing.' }, { status: 400 });
        }

        // Initialize the GenAI client
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('Initialized GenAI model for statement structuring');

        // Truncate text if too long (prevent token limit issues)

        try {
            console.log("Sending request to Gemini API");
            // Create the request
            const prompt = `${STRUCTURING_PROMPT}\n\nHere is the bank statement text to parse:\n${statementText}`;
            
            // Make the API call with the new SDK format
            const responseText = await callGeminiAPI(ai, prompt);
            
            // Clean the response text - remove any backticks, markdown formatting, etc.
            let cleanedText = responseText.trim();
            
            // Remove any markdown code block indicators or backticks
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.substring(7).trim();
            }
            else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.substring(3).trim();
            }
            
            if (cleanedText.endsWith('```')) {
                cleanedText = cleanedText.substring(0, cleanedText.length - 3).trim();
            }
            
            console.log("Parsing JSON response");
            
            // Try to parse the response as JSON
            let parsedData;
            try {
                parsedData = JSON.parse(cleanedText);
                console.log("JSON parsing successful");
            } catch (parseError) {
                console.error("Failed to parse JSON:", parseError);
                console.log("First 100 characters of response:", cleanedText.substring(0, 100));
                
                // Try to find the start of the JSON (if there's text before it)
                const jsonStartIndex = cleanedText.indexOf('{');
                if (jsonStartIndex > 0) {
                    try {
                        console.log(`Found JSON starting at position ${jsonStartIndex}, attempting to parse`);
                        parsedData = JSON.parse(cleanedText.substring(jsonStartIndex));
                        console.log("JSON parsing successful after trimming prefix");
                    } catch (e) {
                        throw new Error("Failed to parse JSON from response even after cleanup");
                    }
                } else {
                    throw new Error("Failed to parse JSON from response");
                }
            }
            
            // Normalize the data structure to ensure it matches our expected format
            const structuredData = normalizeData(parsedData);
            console.log(`Found ${structuredData.account_statements.length} account statements to save`);

            // Save the structured data to the database
            const savedStatements = [];
            console.log('Saving to database');

            // Process each account statement and save to database
            for (let i = 0; i < structuredData.account_statements.length; i++) {
                const statement = structuredData.account_statements[i];
                console.log(`Processing statement ${i + 1}: ${statement.bank_name} / ${statement.account_number}`);

                try {
                    // Convert string values to appropriate types
                    const startingBalance = convertToDecimal(statement.starting_balance);
                    const endingBalance = convertToDecimal(statement.ending_balance);

                    // Find or create the bank
                    let bank = await prisma.bank.findUnique({
                        where: { name: statement.bank_name }
                    });

                    if (!bank) {
                        bank = await prisma.bank.create({
                            data: { name: statement.bank_name }
                        });
                        console.log(`Created new bank: ${bank.name} with ID: ${bank.id}`);
                    } else {
                        console.log(`Found existing bank: ${bank.name} with ID: ${bank.id}`);
                    }

                    // Create the bank statement record
                    const bankStatement = await prisma.bankStatement.create({
                        data: {
                            fileName,
                            bankName: statement.bank_name,
                            accountNumber: statement.account_number,
                            statementPeriodStart: convertToDate(statement.statement_period.start_date),
                            statementPeriodEnd: convertToDate(statement.statement_period.end_date),
                            accountType: statement.account_type,
                            accountCurrency: statement.account_currency,
                            startingBalance: startingBalance || new Decimal(0),
                            endingBalance: endingBalance || new Decimal(0),
                            rawTextContent: statementText,
                            bankId: bank.id, // Link to the bank
                            // Create transactions in the same operation
                            transactions: {
                                create: statement.transactions.map((transaction: TransactionData, index: number) => {
                                    try {
                                        return {
                                            transactionDate: convertToDate(transaction.date),
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
                    console.error('Error saving bank statement:', error);
                    throw error;
                }
            }

            console.log(`Successfully saved ${savedStatements.length} bank statements`);

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

            return NextResponse.json({
                success: true,
                fileName: fileName || "statement",
                structuredData,
                savedStatements: statementsWithCounts
            });

        } catch (error: any) {
            console.error('Error in statement structuring:', error);
            
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
            } else if (error.message?.includes('Failed to parse JSON')) {
                errorMessage = 'The AI service returned an invalid response. Please try again or try with a different document.';
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