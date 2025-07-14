import { prisma } from '../prisma';
import { GoogleGenAI } from "@google/genai";
import { Prisma } from '@prisma/client';

// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
// Access API_KEY at runtime instead of module level
const getApiKey = () => process.env.GEMINI_API_KEY;

// --- Define TransactionCategory as string literals ---
const TransactionCategory = {
  CUSTOMER_PAYMENT: 'CUSTOMER_PAYMENT',
  SUPPLIER_PAYMENT: 'SUPPLIER_PAYMENT',
  INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
  BANK_CHARGES: 'BANK_CHARGES',
  BANK_PAYMENTS: 'BANK_PAYMENTS',
  UNKNOWN: 'UNKNOWN',
  OTHER: 'OTHER'
} as const;

type TransactionCategoryType = typeof TransactionCategory[keyof typeof TransactionCategory];

// --- Types for Classification ---
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
function mapCategoryToEnum(categoryString: string): TransactionCategoryType {
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
  const API_KEY = getApiKey();
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
        maxOutputTokens: 45000,
      }
    });

    const responseText = response.text;
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Gemini API');
    }

    console.log(`Raw Gemini batch response for ${transactions.length} transactions:`, responseText);

    // Try to extract JSON from the response
    let jsonText = responseText.trim();
    
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     jsonText.match(/```\s*([\s\S]*?)\s*```/) ||
                     jsonText.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Parse the JSON response
    try {
      const batchResult = JSON.parse(jsonText) as BatchClassificationResponse;
      
      if (!batchResult.results || !Array.isArray(batchResult.results)) {
        throw new Error('Invalid batch response structure from Gemini API');
      }

      if (batchResult.results.length !== transactions.length) {
        console.warn(`Expected ${transactions.length} results, got ${batchResult.results.length}`);
      }

      // Validate and clean up each result
      const cleanedResults = batchResult.results.map((result, index) => {
        result.extractedEntities = result.extractedEntities || [];
        result.extractedReferences = result.extractedReferences || [];
        result.alternativeCategories = result.alternativeCategories || [];
        
        if (!result.transactionId && transactions[index]) {
          result.transactionId = transactions[index].id;
        }

        return result;
      });

      return cleanedResults;
    } catch (parseError) {
      console.error('Failed to parse Gemini batch response:', responseText);
      console.error('Parse error:', parseError);
      
      // Return fallback classifications for all transactions
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

/**
 * Automatically classify transactions for a specific bank statement
 * @param bankStatementId - The ID of the bank statement to classify transactions for
 * @returns Classification result summary
 */
export async function classifyBankStatementTransactions(bankStatementId: number): Promise<{
  success: boolean;
  classifiedCount: number;
  totalTransactions: number;
  errors: string[];
}> {
  const API_KEY = getApiKey();
  if (!API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    console.log(`Starting automatic classification for bank statement ${bankStatementId}`);

    // Fetch transactions for this specific bank statement
    const bankStatement = await prisma.bankStatement.findUnique({
      where: { id: bankStatementId },
      include: {
        transactions: true
      }
    });

    if (!bankStatement) {
      throw new Error('Bank statement not found');
    }

    const transactions = bankStatement.transactions;

    if (transactions.length === 0) {
      console.log(`No transactions found for bank statement ${bankStatementId}`);
      return {
        success: true,
        classifiedCount: 0,
        totalTransactions: 0,
        errors: []
      };
    }

    console.log(`Classifying ${transactions.length} transactions for bank statement ${bankStatementId}`);

    let classifiedCount = 0;
    const errors: string[] = [];

    // Process transactions in batches
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      try {
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.length} transactions`);
        
        // Get batch classification results
        const batchResults = await classifyTransactionsBatch(batch);
        
        // Process each result in the batch
        for (const result of batchResults) {
          try {
            // Map string category to enum
            const categoryEnum = mapCategoryToEnum(result.category);
            
            // Prepare update data
            const updateData: any = {
              category: categoryEnum,
              confidence: result.confidence,
              classificationReason: result.reason,
              extractedEntities: result.extractedEntities,
              extractedReferences: result.extractedReferences,
              alternativeCategories: result.alternativeCategories,
              classifiedAt: new Date(),
              classificationMethod: 'LLM',
              llmModel: MODEL_NAME
            };
            
            // Update the transaction with classification results
            await prisma.transaction.update({
              where: { id: result.transactionId },
              data: updateData
            });

            classifiedCount++;
            console.log(`Classified transaction ${result.transactionId}: ${categoryEnum} (${result.confidence})`);
          } catch (error: any) {
            console.error(`Error updating transaction ${result.transactionId}:`, error);
            errors.push(`Transaction ${result.transactionId}: ${error.message}`);
          }
        }
        
      } catch (error: any) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Add errors for all transactions in the failed batch
        batch.forEach((transaction: any) => {
          errors.push(`Transaction ${transaction.id}: Batch processing failed - ${error.message}`);
        });
      }

      // Add a delay between batches to be respectful to the API
      if (i + batchSize < transactions.length) {
        console.log(`Completed batch. Waiting 2 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Classification complete for bank statement ${bankStatementId}. Classified: ${classifiedCount}, Errors: ${errors.length}`);

    return {
      success: true,
      classifiedCount,
      totalTransactions: transactions.length,
      errors
    };

  } catch (error: any) {
    console.error(`Error classifying bank statement ${bankStatementId}:`, error);
    throw error;
  }
} 