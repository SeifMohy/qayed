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

// Helper function to convert string to Decimal
function convertToDecimal(value: string): Decimal | null {
    if (!value || value === '' || value.toLowerCase() === 'unknown') {
        return null;
    }

    try {
        // Remove any non-numeric characters except decimal points and negative signs
        const cleanedValue = value.replace(/[^0-9.-]/g, '');
        return new Decimal(cleanedValue);
    } catch (error) {
        console.warn(`Could not convert value to Decimal: ${value}`);
        return null;
    }
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
        const truncatedText = statementText.length > 150000 
          ? statementText.substring(0, 150000) + "..." 
          : statementText;

        try {
            console.log("Sending request to Gemini API");
            // Create the request
            const prompt = `${STRUCTURING_PROMPT}\n\nHere is the bank statement text to parse:\n${truncatedText}`;
            
            // Make the API call with the new SDK format
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    temperature: 0.1,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 48000,
                }
            });
            
            // Check if the response exists
            if (!response) {
                console.error('API response object is null or undefined');
                throw new Error("Received null response from GenAI API");
            }
            
            // Get the text from the response
            let responseText = response.text || '';
            console.log('Response received, length:', responseText.length);
            
            if (!responseText || responseText.trim() === '') {
                console.error('Empty text returned from API');
                throw new Error("GenAI returned empty response for statement structuring.");
            }
            
            // Clean the response text - remove any backticks, markdown formatting, etc.
            responseText = responseText.trim();
            
            // Remove any markdown code block indicators or backticks
            if (responseText.startsWith('```json')) {
                responseText = responseText.substring(7).trim();
            }
            else if (responseText.startsWith('```')) {
                responseText = responseText.substring(3).trim();
            }
            
            if (responseText.endsWith('```')) {
                responseText = responseText.substring(0, responseText.length - 3).trim();
            }
            
            console.log("Parsing JSON response");
            
            // Try to parse the response as JSON
            let parsedData;
            try {
                parsedData = JSON.parse(responseText);
                console.log("JSON parsing successful");
            } catch (parseError) {
                console.error("Failed to parse JSON:", parseError);
                console.log("First 100 characters of response:", responseText.substring(0, 100));
                
                // Try to find the start of the JSON (if there's text before it)
                const jsonStartIndex = responseText.indexOf('{');
                if (jsonStartIndex > 0) {
                    try {
                        console.log(`Found JSON starting at position ${jsonStartIndex}, attempting to parse`);
                        parsedData = JSON.parse(responseText.substring(jsonStartIndex));
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

                    // Create the bank statement record
                    const bankStatement = await prisma.bankStatement.create({
                        data: {
                            fileName,
                            bankName: statement.bank_name,
                            accountNumber: statement.account_number,
                            statementPeriodStart: new Date(statement.statement_period.start_date),
                            statementPeriodEnd: new Date(statement.statement_period.end_date),
                            accountType: statement.account_type,
                            accountCurrency: statement.account_currency,
                            startingBalance: startingBalance || new Decimal(0),
                            endingBalance: endingBalance || new Decimal(0),
                            rawTextContent: statementText,
                            // Create transactions in the same operation
                            transactions: {
                                create: statement.transactions.map((transaction: TransactionData) => ({
                                    transactionDate: new Date(transaction.date),
                                    creditAmount: convertToDecimal(transaction.credit_amount) || null,
                                    debitAmount: convertToDecimal(transaction.debit_amount) || null,
                                    description: transaction.description,
                                    balance: convertToDecimal(transaction.balance) || null,
                                    pageNumber: transaction.page_number,
                                    entityName: transaction.entity_name,
                                }))
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
            return NextResponse.json({
                success: false,
                error: error.message || 'An unexpected error occurred during processing.'
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