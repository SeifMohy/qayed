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
      "starting_balance": "",
      "ending_balance": "",
      "transactions": [
        {
          "date": "",
          "credit_amount": "",
          "debit_amount": "",
          "description": ""
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

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or code blocks.
`.trim();

// Helper function to normalize the data structure
function normalizeData(data: any): any {
  // If the data is not in the expected format, create a wrapper
  if (!data.account_statements) {
    // If there's an account_statement (singular), wrap it in account_statements array
    if (data.account_statement) {
      return {
        account_statements: [normalizeAccountData(data.account_statement, 0)]
      };
    }
    
    // If it looks like a single account directly, wrap it
    if (data.bank_name || data.account_number) {
      return {
        account_statements: [normalizeAccountData(data, 0)]
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
      account_statements: [normalizeAccountData(data.account_statements, 0)]
    };
  }
  
  // If it's already an array, normalize each item
  return {
    account_statements: data.account_statements.map((account: any, index: number) => 
      normalizeAccountData(account, index)
    )
  };
}

// Helper function to normalize individual account data structure
function normalizeAccountData(data: any, index: number): any {
  if (!data || typeof data !== 'object') {
    return {
      bank_name: `Unknown Bank (Account ${index})`,
      account_number: "Unknown",
      statement_period: {
        start_date: "",
        end_date: ""
      },
      starting_balance: "0.00",
      ending_balance: "0.00",
      transactions: []
    };
  }
  
  // Create a normalized structure with defaults for missing fields
  return {
    bank_name: data.bank_name || `Bank (Account ${index})`,
    account_number: data.account_number || "Unknown",
    statement_period: {
      start_date: data.statement_period?.start_date || "",
      end_date: data.statement_period?.end_date || ""
    },
    starting_balance: data.starting_balance || "0.00",
    ending_balance: data.ending_balance || "0.00",
    transactions: Array.isArray(data.transactions) 
      ? data.transactions.map((t: any) => ({
          date: t.date || "",
          credit_amount: t.credit_amount || "",
          debit_amount: t.debit_amount || "",
          description: t.description || ""
        }))
      : []
  };
}

// --- API Route Handler ---
export async function POST(request: Request) {
    if (!API_KEY) {
        return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
    }

    try {
        const data = await request.json();
        const { statementText, fileName } = data;

        if (!statementText) {
            return NextResponse.json({ error: 'No statement text provided for processing.' }, { status: 400 });
        }

        // Initialize the GenAI client
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('Initialized GenAI model for statement structuring using', MODEL_NAME);

        // Truncate text if too long (prevent token limit issues)
        const truncatedText = statementText.length > 150000 
          ? statementText.substring(0, 150000) + "..." 
          : statementText;
        
        console.log('Processing statement, text length:', truncatedText.length);

        try {
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
            const responseText = response.text;
            console.log('Response received, length:', responseText ? responseText.length : 0);
            
            if (!responseText || responseText.trim() === '') {
                console.error('Empty text returned from API');
                throw new Error("GenAI returned empty response for statement structuring.");
            }
            
            // Try to parse the response as JSON
            let parsedData;
            try {
                parsedData = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Failed to parse direct response as JSON:", parseError);
                
                // Try to extract JSON from the response using regex if direct parsing fails
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedData = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error("Failed to extract valid JSON with regex:", e);
                        throw new Error("Failed to extract valid JSON from GenAI response.");
                    }
                } else {
                    console.log("Full response for debugging:", responseText);
                    throw new Error("Failed to extract valid JSON from GenAI response.");
                }
            }
            
            // Normalize the data structure to ensure it matches our expected format
            const structuredData = normalizeData(parsedData);

            return NextResponse.json({
                success: true,
                fileName: fileName || "statement",
                structuredData
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