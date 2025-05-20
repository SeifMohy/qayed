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
// Change to a more stable model version
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
}

// --- Prompt for Bank Statement Identification ---
const IDENTIFICATION_PROMPT = `
You are a document parser specialized in bank statement identification.

Given a bank statement text, identify where each individual account statement begins and ends.
Return the start positions (line numbers) where you believe each account statement begins.

An account statement typically change when the following information changes:
1. Account number
2. Starting Balance
3. Ending Balance
4. Statement period dates

Return a JSON object with the following format:
{
  "account_sections": [
    {
      "start_line": 10,
      "bank_name": "Bank of Example"
      "account_number: "2302301031203012" 
    },
    {
      "start_line": 245,
      "bank_name": "Second Bank Example",
      "account_number: "230230103124412" 
    }
  ]
}

Only return valid JSON with no additional text or explanations.
`.trim();

// --- Prompt for Bank Statement Structuring ---
const STRUCTURING_PROMPT = `
You are a document parser specialized in bank statement data extraction.

Given the raw text content of a SINGLE bank statement section, extract and structure the data into JSON format.

Extract the following information:
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

Guidelines:
- Dates should be in ISO format (YYYY-MM-DD) if possible
- Credit and debit amounts should be parsed as numerical values without currency symbols
- If the amount is ambiguous, leave it blank or return "unknown" rather than guessing

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or code blocks.
`.trim();

// Function to split text into lines
function splitIntoLines(text: string): string[] {
  return text.split('\n');
}

// Function to extract account sections
async function identifyAccountSections(ai: any, text: string): Promise<any[]> {
  try {
    console.log('Identifying account sections...');
    const lines = splitIntoLines(text);
    
    // Use maximum of first 50,000 characters for section identification
    const truncatedTextForIdentification = lines.slice(0, 1000).join('\n');
    
    const prompt = `${IDENTIFICATION_PROMPT}\n\nHere is the bank statement text to analyze:\n${truncatedTextForIdentification}`;
    
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
    
    if (!response) {
      throw new Error("Received null response for account section identification");
    }
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      throw new Error("Empty response for account section identification");
    }
    
    // Extract JSON
    try {
      const sections = JSON.parse(responseText);
      return sections.account_sections || [];
    } catch (parseError) {
      console.error("Failed to parse account sections:", parseError);
      
      // Attempt to extract JSON with regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const sections = JSON.parse(jsonMatch[0]);
          return sections.account_sections || [];
        } catch (e) {
          console.error("Failed to extract valid JSON with regex:", e);
        }
      }
      
      // Fallback to processing as a single section
      console.log("Falling back to processing entire document as a single section");
      return [{ start_line: 0, bank_name: "Unknown Bank" }];
    }
  } catch (error) {
    console.error("Error identifying account sections:", error);
    // Fallback to processing as a single section
    return [{ start_line: 0, bank_name: "Unknown Bank" }];
  }
}

// Function to process each account section
async function processAccountSection(ai: any, text: string, sectionIndex: number): Promise<any> {
  try {
    console.log(`Processing account section ${sectionIndex}...`);
    
    // Limit each section to max 30,000 characters
    const truncatedSection = text.length > 30000 
      ? text.substring(0, 30000) + "..." 
      : text;
    
    const prompt = `${STRUCTURING_PROMPT}\n\nHere is the bank statement section to parse:\n${truncatedSection}`;
    
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
    
    if (!response) {
      throw new Error(`Received null response for section ${sectionIndex}`);
    }
    
    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      throw new Error(`Empty response for section ${sectionIndex}`);
    }
    
    // Try to parse as JSON
    try {
      const parsedData = JSON.parse(responseText);
      
      // Normalize the data structure to ensure it matches expected format
      return normalizeAccountData(parsedData, sectionIndex);
    } catch (parseError) {
      console.error(`Failed to parse section ${sectionIndex} as JSON:`, parseError);
      
      // Try to extract JSON using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0]);
          return normalizeAccountData(extractedData, sectionIndex);
        } catch (e) {
          console.error(`Failed to extract valid JSON for section ${sectionIndex}:`, e);
          throw new Error(`Failed to extract valid JSON for section ${sectionIndex}`);
        }
      } else {
        console.log(`Full response for section ${sectionIndex}:`, responseText);
        throw new Error(`Failed to extract valid JSON for section ${sectionIndex}`);
      }
    }
  } catch (error: any) {
    console.error(`Error processing section ${sectionIndex}:`, error);
    // Return a fallback structure with error information
    return {
      bank_name: `Unknown Bank (Section ${sectionIndex})`,
      account_number: "Unknown",
      statement_period: {
        start_date: "",
        end_date: ""
      },
      starting_balance: "",
      ending_balance: "",
      transactions: [],
      error: error.message || `Failed to process section ${sectionIndex}`,
      partial_data: true
    };
  }
}

// Helper function to normalize account data structure
function normalizeAccountData(data: any, sectionIndex: number): any {
  // If data already has the right structure, use it
  if (data && typeof data === 'object') {
    // Check if the data is wrapped in an account_statement property
    const accountData = data.account_statement || data;
    
    // Create a normalized structure with defaults for missing fields
    return {
      bank_name: accountData.bank_name || `Bank from Section ${sectionIndex}`,
      account_number: accountData.account_number || "Unknown",
      statement_period: {
        start_date: accountData.statement_period?.start_date || "",
        end_date: accountData.statement_period?.end_date || ""
      },
      starting_balance: accountData.starting_balance || "0.00",
      ending_balance: accountData.ending_balance || "0.00",
      transactions: Array.isArray(accountData.transactions) 
        ? accountData.transactions.map((t: any) => ({
            date: t.date || "",
            credit_amount: t.credit_amount || "",
            debit_amount: t.debit_amount || "",
            description: t.description || ""
          }))
        : []
    };
  }
  
  // Return a fallback structure if data is invalid
  return {
    bank_name: `Unknown Bank (Section ${sectionIndex})`,
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

        // Identify account sections
        const lines = splitIntoLines(statementText);
        console.log('Total lines in document:', lines.length);
        
        // Get account sections
        const sections = await identifyAccountSections(ai, statementText);
        console.log('Identified sections:', sections);
        
        let accountStatements = [];
        
        if (sections.length === 0) {
            // Process the entire document as one section
            console.log('No sections identified, processing entire document');
            const result = await processAccountSection(ai, statementText, 0);
            accountStatements.push(result);
        } else {
            // Process each identified section
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const startLine = section.start_line;
                const endLine = i < sections.length - 1 ? sections[i + 1].start_line : lines.length;
                
                const sectionText = lines.slice(startLine, endLine).join('\n');
                console.log(`Processing section ${i} (lines ${startLine}-${endLine})`);
                
                const result = await processAccountSection(ai, sectionText, i);
                accountStatements.push(result);
            }
        }
        
        // Combine results
        const structuredData = {
            account_statements: accountStatements
        };

        return NextResponse.json({
            success: true,
            fileName: fileName || "statement",
            structuredData
        });

    } catch (error: any) {
        console.error('Error in structure-bankstatement route:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'An unexpected error occurred during processing.',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
} 