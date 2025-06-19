import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { prisma } from '@/lib/prisma';
import { TransactionCategory } from '@prisma/client';

// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is not set.');
}

// --- Updated Types for Batch Processing ---
type BatchClassificationResult = {
  transactionId: number;
  category: string;
  confidence: number;
  reason: string;
  extractedEntities: string[];
  extractedReferences: string[];
  alternativeCategories: string[];
};

type BatchClassificationResponse = {
  results: BatchClassificationResult[];
};

// --- Helper function to map string category to enum ---
function mapCategoryToEnum(categoryString: string): TransactionCategory {
  // Normalize the category string
  const normalizedCategory = categoryString.toUpperCase().trim();
  
  switch (normalizedCategory) {
    case 'CUSTOMER_PAYMENT':
      return TransactionCategory.CUSTOMER_PAYMENT;
    case 'SUPPLIER_PAYMENT':
      return TransactionCategory.SUPPLIER_PAYMENT;
    case 'INTERNAL_TRANSFER':
      return TransactionCategory.INTERNAL_TRANSFER;
    case 'BANK_CHARGES':
      return TransactionCategory.BANK_CHARGES;
    case 'BANK_PAYMENTS':
      return TransactionCategory.BANK_PAYMENTS;
    case 'OTHER':
      return TransactionCategory.OTHER;
    default:
      console.warn(`Unknown category: ${categoryString}, defaulting to UNKNOWN`);
      return TransactionCategory.UNKNOWN;
  }
}

// --- Helper Function for Batch Gemini API Call ---
async function classifyTransactionsBatch(transactions: any[]): Promise<BatchClassificationResult[]> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Format transactions for the prompt
  const transactionsList = transactions.map((transaction, index) => {
    return `Transaction ${index + 1} (ID: ${transaction.id}):
- Date: ${transaction.transactionDate}
- Credit Amount: ${transaction.creditAmount || 'N/A'}
- Debit Amount: ${transaction.debitAmount || 'N/A'}
- Description: ${transaction.description || 'N/A'}
- Entity Name: ${transaction.entityName || 'N/A'}`;
  }).join('\n\n');

  const prompt = `You are a financial transaction classifier. Analyze these bank transactions and classify each into one of these categories:

CATEGORIES:
- CUSTOMER_PAYMENT: Incoming payment from a customer/client
- SUPPLIER_PAYMENT: Outgoing payment to a supplier/vendor
- INTERNAL_TRANSFER: Transfer between own accounts or bank-to-bank transfers
- BANK_CHARGES: Bank fees, interest, penalties, charges
- BANK_PAYMENTS: Disbursement or collection of funds by the bank
- OTHER: Other legitimate business transactions

TRANSACTIONS TO CLASSIFY:
${transactionsList}

INSTRUCTIONS:
1. Analyze each transaction's description and entity name
2. Consider the credit/debit amounts to determine direction
3. Extract any company/person names mentioned
4. Extract any invoice numbers, reference numbers, or IDs
5. Assign a confidence score (0.0 to 1.0)
6. List alternative classifications if uncertain

RESPONSE FORMAT (JSON only, no other text):
{
  "results": [
    {
      "transactionId": ${transactions[0]?.id},
      "category": "CATEGORY_NAME",
      "confidence": 0.85,
      "reason": "Brief explanation of classification reasoning",
      "extractedEntities": ["entity1", "entity2"],
      "extractedReferences": ["ref1", "ref2"],
      "alternativeCategories": ["CATEGORY2", "CATEGORY3"]
    }
    // ... repeat for each transaction
  ]
}

RULES:
- Be conservative with confidence scores
- extractedEntities should contain company/person names
- extractedReferences should contain invoice numbers, reference numbers, or IDs
- alternativeCategories should list other possible categories if uncertain
- IMPORTANT: Return results for ALL ${transactions.length} transactions in the exact same order
- IMPORTANT: Use the exact transactionId provided for each transaction`;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        temperature: 0.1,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 45000, // Increased for batch responses
      }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }

    console.log(`Raw Gemini batch response for ${transactions.length} transactions:`, responseText);

    // Try to extract JSON from the response
    let jsonText = responseText.trim();
    
    // Look for JSON content between ```json and ``` or just find the JSON object
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     jsonText.match(/```\s*([\s\S]*?)\s*```/) ||
                     jsonText.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Parse the JSON response
    try {
      const batchResult = JSON.parse(jsonText) as BatchClassificationResponse;
      
      // Validate the response structure
      if (!batchResult.results || !Array.isArray(batchResult.results)) {
        throw new Error('Invalid batch response structure from Gemini API');
      }

      // Ensure we have results for all transactions
      if (batchResult.results.length !== transactions.length) {
        console.warn(`Expected ${transactions.length} results, got ${batchResult.results.length}`);
      }

      // Validate and clean up each result
      const cleanedResults = batchResult.results.map((result, index) => {
        // Ensure arrays are properly initialized
        result.extractedEntities = result.extractedEntities || [];
        result.extractedReferences = result.extractedReferences || [];
        result.alternativeCategories = result.alternativeCategories || [];
        
        // Ensure we have the correct transaction ID
        if (!result.transactionId && transactions[index]) {
          result.transactionId = transactions[index].id;
        }

        return result;
      });

      return cleanedResults;
    } catch (parseError) {
      console.error('Failed to parse Gemini batch response:', responseText);
      console.error('Extracted JSON text:', jsonText);
      console.error('Parse error:', parseError);
      
      // Return fallback classifications for all transactions
      // Currency is completely removed from AI classification
      return transactions.map(transaction => ({
        transactionId: transaction.id,
        category: 'OTHER',
        confidence: 0.1,
        reason: 'Failed to parse AI response, defaulting to OTHER category',
        extractedEntities: [],
        extractedReferences: [],
        alternativeCategories: []
      }));
    }
  } catch (error: any) {
    console.error('Error calling Gemini API for batch:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

// --- Main API Route Handler ---
export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server configuration error: Gemini API key not found.' 
    }, { status: 500 });
  }

  try {
    const { bankId } = await request.json();

    if (!bankId) {
      return NextResponse.json({
        success: false,
        error: 'Bank ID is required'
      }, { status: 400 });
    }

    console.log(`Manual classification request for bank ${bankId}`);

    // Import and use the new classification service
    const { classifyBankTransactions } = await import('@/lib/services/classificationService');
    
    const result = await classifyBankTransactions(bankId);

    return NextResponse.json({
      success: result.success,
      classifiedCount: result.classifiedCount,
      totalTransactions: result.totalTransactions,
      bankStatementsProcessed: result.bankStatementsProcessed,
      errors: result.errors.length > 0 ? result.errors : undefined
    });

  } catch (error: any) {
    console.error('Error in classify-bank route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during classification'
    }, { status: 500 });
  }
} 
