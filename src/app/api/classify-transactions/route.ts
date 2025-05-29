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

// --- Classification Types ---
type ClassificationResult = {
  category: string;
  confidence: number;
  reason: string;
  extractedEntities: string[];
  extractedReferences: string[];
  currency: string | null;
  alternativeCategories: string[];
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
    case 'OTHER':
      return TransactionCategory.OTHER;
    default:
      console.warn(`Unknown category: ${categoryString}, defaulting to UNKNOWN`);
      return TransactionCategory.UNKNOWN;
  }
}

// --- Helper function to map enum array to string array ---
function mapAlternativeCategories(categories: string[]): TransactionCategory[] {
  return categories.map(cat => mapCategoryToEnum(cat));
}

// --- Helper Function for Gemini API Call ---
async function classifyTransaction(transaction: any): Promise<ClassificationResult> {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a financial transaction classifier. Analyze this bank transaction and classify it into one of these categories:

CATEGORIES:
- CUSTOMER_PAYMENT: Incoming payment from a customer/client
- SUPPLIER_PAYMENT: Outgoing payment to a supplier/vendor
- INTERNAL_TRANSFER: Transfer between own accounts or bank-to-bank transfers
- BANK_CHARGES: Bank fees, interest, penalties, charges
- OTHER: Other legitimate business transactions

TRANSACTION DETAILS:
- Date: ${transaction.transactionDate}
- Credit Amount: ${transaction.creditAmount || 'N/A'}
- Debit Amount: ${transaction.debitAmount || 'N/A'}
- Description: ${transaction.description || 'N/A'}
- Entity Name: ${transaction.entityName || 'N/A'}

INSTRUCTIONS:
1. Analyze the transaction description and entity name
2. Consider the credit/debit amounts to determine direction
3. Extract any company/person names mentioned
4. Extract any invoice numbers, reference numbers, or IDs
5. Determine currency if mentioned
6. Assign a confidence score (0.0 to 1.0)
7. List alternative classifications if uncertain

RESPONSE FORMAT (JSON only, no other text):
{
  "category": "CATEGORY_NAME",
  "confidence": 0.85,
  "reason": "Brief explanation of classification reasoning",
  "extractedEntities": ["entity1", "entity2"],
  "extractedReferences": ["ref1", "ref2"],
  "currency": "USD",
  "alternativeCategories": ["CATEGORY2", "CATEGORY3"]
}

RULES:
- Be conservative with confidence scores
- If unsure, use OTHER category
- extractedEntities should contain company/person names
- extractedReferences should contain invoice numbers, reference numbers, or IDs
- currency should be detected from description if mentioned, otherwise null
- alternativeCategories should list other possible categories if uncertain`;

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
        maxOutputTokens: 20000,
      }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(responseText) as ClassificationResult;
      
      // Validate the response structure
      if (!result.category || typeof result.confidence !== 'number') {
        throw new Error('Invalid response structure from Gemini API');
      }

      return result;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      throw new Error('Failed to parse classification result from Gemini API');
    }
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
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
    const { bankStatementId } = await request.json();

    if (!bankStatementId) {
      return NextResponse.json({
        success: false,
        error: 'Bank statement ID is required'
      }, { status: 400 });
    }

    // Fetch the bank statement and its transactions
    const bankStatement = await prisma.bankStatement.findUnique({
      where: { id: bankStatementId },
      include: {
        transactions: {
          where: {
            // Only classify transactions that haven't been classified yet
            category: null
          }
        }
      }
    });

    if (!bankStatement) {
      return NextResponse.json({
        success: false,
        error: 'Bank statement not found'
      }, { status: 404 });
    }

    if (bankStatement.transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No unclassified transactions found in this bank statement'
      }, { status: 400 });
    }

    console.log(`Starting classification for ${bankStatement.transactions.length} transactions`);

    let classifiedCount = 0;
    const errors: string[] = [];

    // Process transactions in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < bankStatement.transactions.length; i += batchSize) {
      const batch = bankStatement.transactions.slice(i, i + batchSize);
      
      // Process batch concurrently but with reasonable limits
      const batchPromises = batch.map(async (transaction) => {
        try {
          const classificationResult = await classifyTransaction(transaction);
          
          // Map string category to enum
          const categoryEnum = mapCategoryToEnum(classificationResult.category);
          
          // Update the transaction with classification results
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              category: categoryEnum,
              confidence: classificationResult.confidence,
              classificationReason: classificationResult.reason,
              extractedEntities: classificationResult.extractedEntities,
              extractedReferences: classificationResult.extractedReferences,
              currency: classificationResult.currency,
              alternativeCategories: classificationResult.alternativeCategories,
              classifiedAt: new Date(),
              classificationMethod: 'LLM',
              llmModel: MODEL_NAME
            }
          });

          classifiedCount++;
          console.log(`Classified transaction ${transaction.id}: ${categoryEnum} (${classificationResult.confidence})`);
        } catch (error: any) {
          console.error(`Error classifying transaction ${transaction.id}:`, error);
          errors.push(`Transaction ${transaction.id}: ${error.message}`);
        }
      });

      await Promise.all(batchPromises);

      // Add a small delay between batches to be respectful to the API
      if (i + batchSize < bankStatement.transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Classification complete. Classified: ${classifiedCount}, Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      classifiedCount,
      totalTransactions: bankStatement.transactions.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error in classify-transactions route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during classification'
    }, { status: 500 });
  }
} 