import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MatchType, MatchStatus, TransactionCategory } from '@prisma/client';
import { CURRENT_CUSTOMER_NAMES } from '@/lib/constants';

// Initialize Gemini AI with error checking
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface InvoiceForMatching {
  id: number;
  invoiceNumber: string;
  invoiceDate: Date;
  issuerName: string;
  receiverName: string;
  total: number;
  currency: string;
  customerId?: number | null;
  supplierId?: number | null;
}

interface TransactionForMatching {
  id: number;
  transactionDate: Date;
  creditAmount?: number | null;
  debitAmount?: number | null;
  description?: string | null;
  entityName?: string | null;
  bankStatementId: number;
  category?: string | null;
  classificationReason?: string | null;
  confidence?: number | null;
  extractedEntities?: string[];
  extractedReferences?: string[];
  currency?: string | null;
}

interface InvoiceGroup {
  entityName: string;
  invoiceType: 'CUSTOMER' | 'SUPPLIER';
  invoices: InvoiceForMatching[];
}

interface MatchResult {
  invoiceId: number;
  transactionId: number;
  matchScore: number;
  matchReason: string[];
  passedStrictCriteria: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Starting AI-powered invoice-transaction matching...');

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.'
      }, { status: 500 });
    }

    // Get unmatched invoices (limit for processing efficiency)
    const rawInvoices = await prisma.invoice.findMany({
      where: {
        // Include invoices that have no matches OR only rejected/disputed matches
        OR: [
          {
            TransactionMatch: {
              none: {}
            }
          },
          {
            TransactionMatch: {
              every: {
                status: {
                  in: ['REJECTED', 'DISPUTED']
                }
              }
            }
          }
        ]
      },
      take: 100, // Process in batches for efficiency
      orderBy: {
        invoiceDate: 'desc'
      }
    });

    // Convert Decimal to number for processing
    const invoices: InvoiceForMatching[] = rawInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      issuerName: invoice.issuerName,
      receiverName: invoice.receiverName,
      total: Number(invoice.total),
      currency: invoice.currency,
      customerId: invoice.customerId,
      supplierId: invoice.supplierId
    }));

    // Group invoices by entity name and type
    const invoiceGroups = groupInvoicesByEntity(invoices);
    console.log(`📊 Grouped ${invoices.length} invoices into ${invoiceGroups.length} entity groups`);

    // Get unmatched transactions with category filtering and classification info
    const rawTransactions = await prisma.transaction.findMany({
      where: {
        AND: [
          {
            // Include transactions that have no matches OR only rejected/disputed matches
            OR: [
              {
                TransactionMatch: {
                  none: {}
                }
              },
              {
                TransactionMatch: {
                  every: {
                    status: {
                      in: ['REJECTED', 'DISPUTED']
                    }
                  }
                }
              }
            ]
          },
          {
            // Only include transactions that have amounts and relevant categories
            OR: [
              { creditAmount: { not: null } },
              { debitAmount: { not: null } }
            ]
          },
          {
            category: {
              in: ['CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT']
            }
          }
        ]
      },
      take: 500, // Increase limit since we're filtering by category
      orderBy: {
        transactionDate: 'desc'
      }
    });

    // Convert Decimal to number for processing and include classification info
    const transactions: TransactionForMatching[] = rawTransactions.map(transaction => ({
      id: transaction.id,
      transactionDate: transaction.transactionDate,
      creditAmount: transaction.creditAmount ? Number(transaction.creditAmount) : null,
      debitAmount: transaction.debitAmount ? Number(transaction.debitAmount) : null,
      description: transaction.description,
      entityName: transaction.entityName,
      bankStatementId: transaction.bankStatementId,
      category: transaction.category,
      classificationReason: transaction.classificationReason,
      confidence: transaction.confidence,
      extractedEntities: transaction.extractedEntities,
      extractedReferences: transaction.extractedReferences,
      currency: transaction.currency
    }));

    console.log(`📊 Found ${transactions.length} categorized transactions`);

    if (invoiceGroups.length === 0 || transactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unmatched invoices or categorized transactions found',
        totalMatches: 0
      });
    }

    const matches: MatchResult[] = [];
    let processedGroups = 0;
    let totalProcessedInvoices = 0;

    // Process invoice groups in batches of 3 simultaneously
    const batchSize = 5;
    const groupBatches = [];
    
    for (let i = 0; i < invoiceGroups.length; i += batchSize) {
      groupBatches.push(invoiceGroups.slice(i, i + batchSize));
    }

    console.log(`🚀 Processing ${invoiceGroups.length} invoice groups in ${groupBatches.length} batches of ${batchSize}`);

    for (const batch of groupBatches) {
      console.log(`🏢 Processing batch of ${batch.length} groups: ${batch.map(g => `${g.entityName} (${g.invoiceType})`).join(', ')}`);
      
      // Process each group in the batch in parallel
      const batchPromises = batch.map(async (group) => {
        try {
          // Filter transactions by category based on invoice type
          const relevantTransactions = transactions.filter(t => {
            const categoryMatch = group.invoiceType === 'CUSTOMER' 
              ? t.category === 'CUSTOMER_PAYMENT'
              : t.category === 'SUPPLIER_PAYMENT';
            
            if (!categoryMatch) return false;

            // Filter by currency - transaction currency must match any invoice currency in the group
            const groupCurrencies = [...new Set(group.invoices.map(inv => inv.currency))];
            const currencyMatch = t.currency && groupCurrencies.includes(t.currency);
            
            if (!currencyMatch) return false;

            // Additional filtering for date range (within 90 days of any invoice in group)
            const groupDateRange = getGroupDateRange(group.invoices);
            const transactionDate = new Date(t.transactionDate);
            const daysDiff = Math.min(
              Math.abs(transactionDate.getTime() - groupDateRange.earliest.getTime()),
              Math.abs(transactionDate.getTime() - groupDateRange.latest.getTime())
            ) / (1000 * 60 * 60 * 24);

            return daysDiff <= 90; // Extended range for grouped analysis
          });

          console.log(`📋 Found ${relevantTransactions.length} relevant ${group.invoiceType} transactions for ${group.entityName}`);

          if (relevantTransactions.length === 0) {
            return {
              group,
              matches: [],
              error: null
            };
          }

          // Use Gemini to analyze the group of invoices against relevant transactions
          const analysisResult = await analyzeGroupWithGemini(group, relevantTransactions);
          
          if (analysisResult.matches && analysisResult.matches.length > 0) {
            console.log(`✨ Found ${analysisResult.matches.length} AI matches for ${group.entityName} group`);
            return {
              group,
              matches: analysisResult.matches,
              error: null
            };
          } else {
            console.log(`❓ No AI matches found for ${group.entityName} group`);
            return {
              group,
              matches: [],
              error: null
            };
          }
        } catch (error) {
          console.error(`❌ Error analyzing ${group.entityName} group:`, error);
          return {
            group,
            matches: [],
            error: error as Error
          };
        }
      });

      // Wait for all groups in the batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Process results from the batch
      for (const result of batchResults) {
        if (result.matches.length > 0) {
          matches.push(...result.matches);
        }
        processedGroups++;
        totalProcessedInvoices += result.group.invoices.length;
      }
      
      // Add delay between batches to respect rate limits
      if (groupBatches.indexOf(batch) < groupBatches.length - 1) {
        console.log('⏳ Waiting 500ms before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`🎯 Found ${matches.length} total potential matches from ${processedGroups} groups`);

    // Save matches to database
    let savedMatches = 0;
    let duplicateMatches = 0;
    let errorMatches = 0;

    for (const match of matches) {
      try {
        // Determine transaction category based on invoice
        const invoice = invoices.find(inv => inv.id === match.invoiceId);
        const transactionCategory = invoice?.customerId ? 'CUSTOMER_PAYMENT' : 'SUPPLIER_PAYMENT';

        // First check if there's an existing approved match - don't overwrite those
        const existingMatch = await prisma.transactionMatch.findUnique({
          where: {
            transactionId_invoiceId: {
              transactionId: match.transactionId,
              invoiceId: match.invoiceId
            }
          }
        });

        if (existingMatch && existingMatch.status === 'APPROVED') {
          console.log(`⏭️  Approved match already exists for transaction ${match.transactionId} and invoice ${match.invoiceId} - skipping`);
          duplicateMatches++;
          continue;
        }

        // Use upsert to handle the unique constraint gracefully
        const result = await prisma.transactionMatch.upsert({
          where: {
            transactionId_invoiceId: {
              transactionId: match.transactionId,
              invoiceId: match.invoiceId
            }
          },
          update: {
            // Only update if the existing match is still PENDING
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            passedStrictCriteria: match.passedStrictCriteria,
            updatedAt: new Date()
          },
          create: {
            transactionId: match.transactionId,
            invoiceId: match.invoiceId,
            matchType: MatchType.SUGGESTED,
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            passedStrictCriteria: match.passedStrictCriteria,
            status: MatchStatus.PENDING,
            isEligible: true,
            transactionCategory: transactionCategory === 'CUSTOMER_PAYMENT' 
              ? TransactionCategory.CUSTOMER_PAYMENT 
              : TransactionCategory.SUPPLIER_PAYMENT,
            updatedAt: new Date()
          }
        });

        // Check if this was an existing match that we updated vs a new one we created
        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasCreated) {
          savedMatches++;
          console.log(`✅ Created new match for transaction ${match.transactionId} and invoice ${match.invoiceId} (score: ${match.matchScore})`);
        } else {
          duplicateMatches++;
          console.log(`🔄 Updated existing match for transaction ${match.transactionId} and invoice ${match.invoiceId} (score: ${match.matchScore})`);
        }
      } catch (error) {
        console.error(`❌ Error saving match for transaction ${match.transactionId} and invoice ${match.invoiceId}:`, error);
        errorMatches++;
        continue;
      }
    }

    console.log(`📊 Final results: ${savedMatches} saved, ${duplicateMatches} duplicates, ${errorMatches} errors`);

    return NextResponse.json({
      success: true,
      message: `AI matching completed successfully!`,
      totalMatches: savedMatches,
      processedInvoices: totalProcessedInvoices,
      processedTransactions: transactions.length,
      processedGroups: processedGroups,
      duplicateMatches,
      errorMatches,
      details: {
        invoicesProcessed: totalProcessedInvoices,
        transactionsAnalyzed: transactions.length,
        groupsProcessed: processedGroups,
        matchesFound: matches.length,
        matchesSaved: savedMatches
      }
    });

  } catch (error: any) {
    console.error('❌ Major error in AI matching:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform AI matching: ' + error.message,
      details: error.stack
    }, { status: 500 });
  }
}

function groupInvoicesByEntity(invoices: InvoiceForMatching[]): InvoiceGroup[] {
  const groups: { [key: string]: InvoiceGroup } = {};

  for (const invoice of invoices) {
    // Determine if this is a customer or supplier invoice
    const isCustomerInvoice = invoice.customerId !== null;
    const entityName = isCustomerInvoice ? invoice.receiverName : invoice.issuerName;
    const invoiceType: 'CUSTOMER' | 'SUPPLIER' = isCustomerInvoice ? 'CUSTOMER' : 'SUPPLIER';
    
    const groupKey = `${invoiceType}:${entityName}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        entityName,
        invoiceType,
        invoices: []
      };
    }
    
    groups[groupKey].invoices.push(invoice);
  }

  return Object.values(groups);
}

function getGroupDateRange(invoices: InvoiceForMatching[]): { earliest: Date; latest: Date } {
  const dates = invoices.map(inv => new Date(inv.invoiceDate));
  return {
    earliest: new Date(Math.min(...dates.map(d => d.getTime()))),
    latest: new Date(Math.max(...dates.map(d => d.getTime())))
  };
}

async function analyzeGroupWithGemini(group: InvoiceGroup, transactions: TransactionForMatching[]): Promise<{ matches: MatchResult[] }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

  const prompt = `
You are an expert financial analyst matching ${group.invoiceType} invoices to bank transactions.

ENTITY: ${group.entityName}
INVOICE TYPE: ${group.invoiceType}
CURRENT CUSTOMER NAMES: ${CURRENT_CUSTOMER_NAMES.join(', ')}
INVOICES (${group.invoices.length} total):
${group.invoices.map((inv, idx) => `
Invoice ${idx + 1}:
- ID: ${inv.id}
- Number: ${inv.invoiceNumber}
- Date: ${inv.invoiceDate.toISOString().split('T')[0]}
- Amount: ${inv.total} ${inv.currency}
- Issuer: ${inv.issuerName}
- Receiver: ${inv.receiverName}
`).join('')}

RELEVANT ${group.invoiceType} TRANSACTIONS (${transactions.length} total):
${transactions.map((t, idx) => `
Transaction ${idx + 1}:
- ID: ${t.id}
- Date: ${t.transactionDate.toISOString().split('T')[0]}
- Credit: ${t.creditAmount || 'N/A'}
- Debit: ${t.debitAmount || 'N/A'}
- Description: ${t.description || 'N/A'}
- Category: ${t.category}
- Classification Reason: ${t.classificationReason || 'N/A'}
- Extracted Entities: ${t.extractedEntities?.join(', ') || 'N/A'}
- Extracted References: ${t.extractedReferences?.join(', ') || 'N/A'}
`).join('')}

MATCHING CRITERIA:
1. **Entity Match**: If the transaction entity name matches the invoice counterparty — that is, the issuer for supplier invoices or the receiver for customer invoices — include it as a match regardless of amount or date.
 - ⚠️ Do **not** consider matches to the the current customer names (${CURRENT_CUSTOMER_NAMES.join(', ')}) as valid entity matches, even if they appear in the transaction description.
2. **Exact Amount Match**: If the invoice amount is **exactly equal** to the transaction amount (credit or debit depending on invoice type), consider it a match, even if other signals are weaker.
3. **Contextual Match**: If the transaction is consistent with the context of the invoice (e.g., similar amount, date, or description), include it as a potential match.


RESPONSE FORMAT:
{
  "matches": [
    {
      "invoiceId": <invoice_id>,
      "transactionId": <transaction_id>,
      "matchScore": <score_0_to_1>,
      "matchReason": ["reason1", "reason2"],
      "passedStrictCriteria": <true_or_false>
    }
  ]
}

*make sure you return the invoiceId and transactionId in the matches array as as without any other text*

SCORING GUIDELINES:
provide a score for each match between 0 and 1.

Focus on entity correlation with ${group.entityName}, amount patterns, classification reasoning, and business payment patterns.


`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in Gemini response');
      return { matches: [] };
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!analysisResult.matches || !Array.isArray(analysisResult.matches)) {
      console.log('Invalid response structure from Gemini');
      return { matches: [] };
    }

    // Filter and validate matches
    const validMatches = analysisResult.matches.filter((match: any) => {
      return match.invoiceId && 
             match.transactionId && 
             typeof match.matchScore === 'number' && 
             match.matchScore >= 0.5 &&
             Array.isArray(match.matchReason);
    });

    return { matches: validMatches };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { matches: [] };
  }
} 