// Service for matching logic migrated from Next.js API
import { prisma } from '../prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CURRENT_CUSTOMER_NAMES } from '../../../src/lib/constants';

// Types
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
  paymentTerms?: PaymentTermsData | null;
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

interface PaymentTermsInstallment {
  id: string;
  amount?: number;
  percentage?: number;
  dueDays: number;
  description?: string;
}
interface PaymentTermsDownPayment {
  required: boolean;
  amount?: number;
  percentage?: number;
  dueDate?: string;
}
interface PaymentTermsData {
  paymentPeriod: string;
  downPayment?: PaymentTermsDownPayment;
  installments?: PaymentTermsInstallment[];
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function aiGeminiMatching(companyId: string) {
  try {
    console.log('🤖 [Express] Starting AI-powered invoice-transaction matching for companyId:', companyId);

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY environment variable is not set!');
      return {
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.'
      };
    }

    // Get unmatched invoices for the company
    const rawInvoices = await prisma.invoice.findMany({
      where: {
        companyId: Number(companyId),
        OR: [
          { TransactionMatch: { none: {} } },
          { TransactionMatch: { every: { status: { in: ['REJECTED', 'DISPUTED'] } } } }
        ]
      },
      include: {
        Customer: { select: { paymentTermsData: true } },
        Supplier: { select: { paymentTermsData: true } }
      },
      take: 100,
      orderBy: { invoiceDate: 'desc' }
    });

    console.log(`📊 [Express] Found ${rawInvoices.length} invoices for company ${companyId}`);

    const invoices: InvoiceForMatching[] = rawInvoices.map(invoice => {
      const paymentTerms = invoice.customerId
        ? invoice.Customer?.paymentTermsData as PaymentTermsData | null
        : invoice.Supplier?.paymentTermsData as PaymentTermsData | null;
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        issuerName: invoice.issuerName,
        receiverName: invoice.receiverName,
        total: Number(invoice.total),
        currency: invoice.currency,
        customerId: invoice.customerId,
        supplierId: invoice.supplierId,
        paymentTerms
      };
    });

    const invoiceGroups = groupInvoicesByEntity(invoices);
    console.log(`📊 [Express] Grouped ${invoices.length} invoices into ${invoiceGroups.length} entity groups`);

    // Get unmatched transactions for the company
    const rawTransactions = await prisma.transaction.findMany({
      where: {
        bankStatement: { bank: { companyId: Number(companyId) } },
        AND: [
          {
            OR: [
              { TransactionMatch: { none: {} } },
              { TransactionMatch: { every: { status: { in: ['REJECTED', 'DISPUTED'] } } } }
            ]
          },
          {
            OR: [ { creditAmount: { not: null } }, { debitAmount: { not: null } } ]
          },
          {
            category: { in: ['CUSTOMER_PAYMENT', 'SUPPLIER_PAYMENT'] }
          }
        ]
      },
      take: 500,
      orderBy: { transactionDate: 'desc' }
    });

    console.log(`📊 [Express] Found ${rawTransactions.length} categorized transactions for company ${companyId}`);

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

    if (invoiceGroups.length === 0 || transactions.length === 0) {
      console.log('[Express] No unmatched invoices or categorized transactions found');
      return {
        success: true,
        message: 'No unmatched invoices or categorized transactions found',
        totalMatches: 0
      };
    }

    const matches: MatchResult[] = [];
    let processedGroups = 0;
    let totalProcessedInvoices = 0;
    const batchSize = 5;
    const groupBatches = [];
    for (let i = 0; i < invoiceGroups.length; i += batchSize) {
      groupBatches.push(invoiceGroups.slice(i, i + batchSize));
    }
    console.log(`🚀 [Express] Processing ${invoiceGroups.length} invoice groups in ${groupBatches.length} batches of ${batchSize}`);
    for (const batch of groupBatches) {
      console.log(`🏢 [Express] Processing batch of ${batch.length} groups: ${batch.map(g => `${g.entityName} (${g.invoiceType})`).join(', ')}`);
      const batchPromises = batch.map(async (group) => {
        try {
          const relevantTransactions = transactions.filter(t => {
            const categoryMatch = group.invoiceType === 'CUSTOMER'
              ? t.category === 'CUSTOMER_PAYMENT'
              : t.category === 'SUPPLIER_PAYMENT';
            if (!categoryMatch) return false;
            const groupCurrencies = [...new Set(group.invoices.map(inv => inv.currency))];
            const currencyMatch = t.currency && groupCurrencies.includes(t.currency);
            if (!currencyMatch) return false;
            const groupDateRange = getGroupDateRange(group.invoices);
            const transactionDate = new Date(t.transactionDate);
            const daysDiff = Math.min(
              Math.abs(transactionDate.getTime() - groupDateRange.earliest.getTime()),
              Math.abs(transactionDate.getTime() - groupDateRange.latest.getTime())
            ) / (1000 * 60 * 60 * 24);
            return daysDiff <= 90;
          });
          console.log(`📋 [Express] Found ${relevantTransactions.length} relevant ${group.invoiceType} transactions for ${group.entityName}`);
          if (relevantTransactions.length === 0) {
            console.log(`[Express] No relevant transactions for group ${group.entityName}`);
            return { group, matches: [], error: null };
          }
          console.log(`[Express] Calling Gemini for group ${group.entityName} (${group.invoiceType}) with ${group.invoices.length} invoices and ${relevantTransactions.length} transactions`);
          const analysisResult = await analyzeGroupWithGemini(group, relevantTransactions);
          if (analysisResult.matches && analysisResult.matches.length > 0) {
            console.log(`✨ [Express] Found ${analysisResult.matches.length} AI matches for ${group.entityName} group`);
            return { group, matches: analysisResult.matches, error: null };
          } else {
            console.log(`❓ [Express] No AI matches found for ${group.entityName} group`);
            return { group, matches: [], error: null };
          }
        } catch (error) {
          console.error(`❌ [Express] Error analyzing ${group.entityName} group:`, error);
          return { group, matches: [], error: error as Error };
        }
      });
      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        if (result.matches.length > 0) {
          matches.push(...result.matches);
        }
        processedGroups++;
        totalProcessedInvoices += result.group.invoices.length;
      }
      if (groupBatches.indexOf(batch) < groupBatches.length - 1) {
        console.log('[Express] Waiting 500ms before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    console.log(`🎯 [Express] Found ${matches.length} total potential matches from ${processedGroups} groups`);
    let savedMatches = 0;
    let duplicateMatches = 0;
    let errorMatches = 0;
    for (const match of matches) {
      try {
        const invoice = invoices.find(inv => inv.id === match.invoiceId);
        const transactionCategory = invoice?.customerId ? 'CUSTOMER_PAYMENT' : 'SUPPLIER_PAYMENT';
        const existingMatch = await prisma.transactionMatch.findUnique({
          where: {
            transactionId_invoiceId: {
              transactionId: match.transactionId,
              invoiceId: match.invoiceId
            }
          }
        });
        if (existingMatch && existingMatch.status === 'APPROVED') {
          console.log(`⏭️  [Express] Approved match already exists for transaction ${match.transactionId} and invoice ${match.invoiceId} - skipping`);
          duplicateMatches++;
          continue;
        }
        const result = await prisma.transactionMatch.upsert({
          where: {
            transactionId_invoiceId: {
              transactionId: match.transactionId,
              invoiceId: match.invoiceId
            }
          },
          update: {
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            passedStrictCriteria: match.passedStrictCriteria,
            updatedAt: new Date()
          },
          create: {
            transactionId: match.transactionId,
            invoiceId: match.invoiceId,
            matchType: 'SUGGESTED',
            matchScore: match.matchScore,
            matchReason: match.matchReason,
            passedStrictCriteria: match.passedStrictCriteria,
            status: 'PENDING',
            isEligible: true,
            transactionCategory: transactionCategory === 'CUSTOMER_PAYMENT'
              ? 'CUSTOMER_PAYMENT'
              : 'SUPPLIER_PAYMENT',
            updatedAt: new Date()
          }
        });
        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasCreated) {
          savedMatches++;
          console.log(`✅ [Express] Created new match for transaction ${match.transactionId} and invoice ${match.invoiceId} (score: ${match.matchScore})`);
        } else {
          duplicateMatches++;
          console.log(`🔄 [Express] Updated existing match for transaction ${match.transactionId} and invoice ${match.invoiceId} (score: ${match.matchScore})`);
        }
      } catch (error) {
        console.error(`❌ [Express] Error saving match for transaction ${match.transactionId} and invoice ${match.invoiceId}:`, error);
        errorMatches++;
        continue;
      }
    }
    console.log(`📊 [Express] Final results: ${savedMatches} saved, ${duplicateMatches} duplicates, ${errorMatches} errors`);
    return {
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
    };
  } catch (error: any) {
    console.error('❌ [Express] Major error in AI matching:', error);
    return {
      success: false,
      error: 'Failed to perform AI matching: ' + error.message,
      details: error.stack
    };
  }
}

function groupInvoicesByEntity(invoices: InvoiceForMatching[]): InvoiceGroup[] {
  const groups: { [key: string]: InvoiceGroup } = {};
  for (const invoice of invoices) {
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
    latest: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
}

function formatPaymentTerms(paymentTerms: PaymentTermsData | null | undefined): string {
  if (!paymentTerms) return 'Standard terms (Net 30 assumed)';
  let summary = `Payment Period: ${paymentTerms.paymentPeriod}`;
  if (paymentTerms.downPayment?.required) {
    const amount = paymentTerms.downPayment.percentage
      ? `${paymentTerms.downPayment.percentage}%`
      : paymentTerms.downPayment.amount
      ? `$${paymentTerms.downPayment.amount}`
      : 'Amount TBD';
    summary += `, Down Payment: ${amount} (${paymentTerms.downPayment.dueDate})`;
  }
  if (paymentTerms.installments && paymentTerms.installments.length > 0) {
    summary += `, Installments: ${paymentTerms.installments.length} payments`;
    paymentTerms.installments.forEach((inst, index) => {
      const instAmount = inst.percentage ? `${inst.percentage}%` : inst.amount ? `$${inst.amount}` : 'Amount TBD';
      summary += ` | ${instAmount} due in ${inst.dueDays} days`;
    });
  }
  return summary;
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
- Payment Terms: ${formatPaymentTerms(inv.paymentTerms)}
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
3. **Payment Terms Match**: Consider the invoice payment terms when evaluating timing. For example:
   - "Net 30" means payment expected 30 days after invoice date
   - "Due on receipt" means immediate payment expected
   - Down payments should match partial amounts close to invoice date
   - Installment payments should match the scheduled amounts and timing
   - If payment terms indicate installments, look for multiple smaller transactions
4. **Contextual Match**: If the transaction is consistent with the context of the invoice (e.g., similar amount, date, or description), include it as a potential match.


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
Provide a score for each match between 0 and 1, considering:

1. **Entity correlation** with ${group.entityName}
2. **Amount patterns** (exact match = higher score, partial match = consider payment terms)
3. **Payment timing** relative to invoice date and payment terms:
   - Transactions matching expected payment dates based on terms get higher scores
   - Early payments (before due date) are acceptable but score slightly lower
   - Very late payments (beyond reasonable business terms) score lower
4. **Payment term compliance**:
   - Full payment matching invoice amount = highest score
   - Partial payments matching down payment percentages = high score if terms specify
   - Installment amounts matching scheduled payments = high score
5. **Classification reasoning** and business payment patterns


`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { matches: [] };
    }
    const analysisResult = JSON.parse(jsonMatch[0]);
    if (!analysisResult.matches || !Array.isArray(analysisResult.matches)) {
      return { matches: [] };
    }
    const validMatches = analysisResult.matches.filter((match: any) => {
      return match.invoiceId &&
             match.transactionId &&
             typeof match.matchScore === 'number' &&
             match.matchScore >= 0.5 &&
             Array.isArray(match.matchReason);
    });
    return { matches: validMatches };
  } catch (error) {
    return { matches: [] };
  }
}

export async function getPendingMatches(companyId: string, options: { page: number; limit: number; status: string; sortBy: string; sortOrder: string; }) {
  try {
    const { page, limit, status, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;
    const matches = await prisma.transactionMatch.findMany({
      where: {
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: Number(companyId) } } } },
              { Invoice: { companyId: Number(companyId) } }
            ]
          }
        ]
      },
      include: {
        Transaction: {
          include: {
            bankStatement: {
              select: {
                bankName: true,
                accountNumber: true,
                fileName: true,
              },
            },
          },
        },
        Invoice: {
          include: {
            Customer: { select: { id: true, name: true } },
            Supplier: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });
    const totalCount = await prisma.transactionMatch.count({
      where: {
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: Number(companyId) } } } },
              { Invoice: { companyId: Number(companyId) } }
            ]
          }
        ]
      },
    });
    const formattedMatches = matches.map(match => ({
      id: match.id,
      matchScore: match.matchScore,
      matchReason: match.matchReason,
      matchType: match.matchType,
      passedStrictCriteria: match.passedStrictCriteria,
      status: match.status,
      createdAt: match.createdAt,
      transactionCategory: match.transactionCategory,
      transaction: {
        id: match.Transaction?.id,
        date: match.Transaction?.transactionDate,
        description: match.Transaction?.description,
        creditAmount: match.Transaction?.creditAmount ? Number(match.Transaction?.creditAmount) : null,
        debitAmount: match.Transaction?.debitAmount ? Number(match.Transaction?.debitAmount) : null,
        entityName: match.Transaction?.entityName,
        bankStatement: {
          bankName: match.Transaction?.bankStatement?.bankName,
          accountNumber: match.Transaction?.bankStatement?.accountNumber,
          fileName: match.Transaction?.bankStatement?.fileName,
        },
      },
      invoice: match.Invoice ? {
        id: match.Invoice?.id,
        invoiceNumber: match.Invoice?.invoiceNumber,
        date: match.Invoice?.invoiceDate,
        issuerName: match.Invoice?.issuerName,
        receiverName: match.Invoice?.receiverName,
        total: Number(match.Invoice?.total),
        currency: match.Invoice?.currency,
        customer: match.Invoice?.Customer,
        supplier: match.Invoice?.Supplier,
      } : null,
    }));
    const totalPages = Math.ceil(totalCount / limit);
    return {
      success: true,
      matches: formattedMatches,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      metadata: {
        companyId,
        status,
        sortBy,
        sortOrder
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to fetch pending matches',
      details: error.message
    };
  }
}

export async function updateMatchStatus(companyId: string, matchId: string, action: string, notes?: string) {
  try {
    if (!matchId || !action) {
      return {
        success: false,
        error: 'Match ID and action are required',
      };
    }
    const validActions = ['approve', 'reject', 'dispute'];
    if (!validActions.includes(action)) {
      return {
        success: false,
        error: 'Invalid action. Must be approve, reject, or dispute',
      };
    }
    // First check if the match exists and belongs to the company
    const existingMatch = await prisma.transactionMatch.findFirst({
      where: {
        id: Number(matchId),
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: Number(companyId) } } } },
              { Invoice: { companyId: Number(companyId) } }
            ]
          }
        ]
      },
      include: {
        Transaction: { select: { id: true, description: true } },
        Invoice: { select: { id: true, invoiceNumber: true } },
      },
    });
    if (!existingMatch) {
      return {
        success: false,
        error: `Match with ID ${matchId} not found or access denied`,
      };
    }
    const statusMap = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      dispute: 'DISPUTED',
    } as const;
    const newStatus = statusMap[action as keyof typeof statusMap] as 'APPROVED' | 'REJECTED' | 'DISPUTED';
    const updatedMatch = await prisma.transactionMatch.update({
      where: { id: Number(matchId) },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        verifiedBy: 'system',
        verificationNotes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        Transaction: { select: { id: true, description: true } },
        Invoice: { select: { id: true, invoiceNumber: true } },
      },
    });
    return {
      success: true,
      message: `Match ${action}d successfully`,
      match: updatedMatch,
      companyId
    };
  } catch (error: any) {
    let errorMessage = 'Failed to update match status';
    if (error.code === 'P2002') {
      errorMessage = 'Constraint violation: This match may already exist or have conflicting data';
    } else if (error.code === 'P2025') {
      errorMessage = 'Match not found or has been deleted';
    } else if (error.message) {
      errorMessage = `Database error: ${error.message}`;
    }
    return {
      success: false,
      error: errorMessage,
      details: error.message
    };
  }
}

export async function getMatchingStats(companyId: string) {
  try {
    const companyIdNum = Number(companyId);
    const totalInvoices = await prisma.invoice.count({
      where: { companyId: companyIdNum }
    });
    const totalTransactions = await prisma.transaction.count({
      where: { bankStatement: { bank: { companyId: companyIdNum } } }
    });
    const unmatchedInvoices = await prisma.invoice.count({
      where: {
        companyId: companyIdNum,
        OR: [
          { TransactionMatch: { none: {} } },
          { TransactionMatch: { every: { status: { in: ['REJECTED', 'DISPUTED'] } } } }
        ]
      }
    });
    const unmatchedTransactions = await prisma.transaction.count({
      where: {
        bankStatement: { bank: { companyId: companyIdNum } },
        OR: [
          { TransactionMatch: { none: {} } },
          { TransactionMatch: { every: { status: { in: ['REJECTED', 'DISPUTED'] } } } }
        ]
      }
    });
    const pendingMatches = await prisma.transactionMatch.count({
      where: {
        status: 'PENDING',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const approvedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'APPROVED',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const rejectedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'REJECTED',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const disputedMatches = await prisma.transactionMatch.count({
      where: {
        status: 'DISPUTED',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const totalMatches = await prisma.transactionMatch.count({
      where: {
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const avgMatchScore = await prisma.transactionMatch.aggregate({
      where: {
        status: 'PENDING',
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      },
      _avg: { matchScore: true }
    });
    const highConfidenceMatches = await prisma.transactionMatch.count({
      where: {
        status: 'PENDING',
        passedStrictCriteria: true,
        AND: [
          {
            OR: [
              { Transaction: { bankStatement: { bank: { companyId: companyIdNum } } } },
              { Invoice: { companyId: companyIdNum } }
            ]
          }
        ]
      }
    });
    const stats = {
      totalInvoices,
      totalTransactions,
      unmatchedInvoices,
      unmatchedTransactions,
      matches: {
        total: totalMatches,
        pending: pendingMatches,
        approved: approvedMatches,
        rejected: rejectedMatches,
        disputed: disputedMatches,
        averageScore: avgMatchScore._avg.matchScore ? Number(avgMatchScore._avg.matchScore) : 0,
        highConfidence: highConfidenceMatches
      }
    };
    return {
      success: true,
      stats,
      metadata: {
        companyId: companyIdNum
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to fetch matching statistics',
      details: error.message
    };
  }
}

export async function resetRejectedMatches(companyId?: string) {
  try {
    let whereClause: any = { status: 'REJECTED' };
    if (companyId) {
      // Only reset matches for the given company (by transaction or invoice)
      whereClause = {
        status: 'REJECTED',
        OR: [
          { Transaction: { bankStatement: { bank: { companyId: Number(companyId) } } } },
          { Invoice: { companyId: Number(companyId) } }
        ]
      };
    }
    const updatedMatches = await prisma.transactionMatch.updateMany({
      where: whereClause,
      data: {
        status: 'PENDING',
        verifiedAt: null,
        verifiedBy: null,
        verificationNotes: null,
        updatedAt: new Date()
      }
    });
    return {
      success: true,
      message: `Reset ${updatedMatches.count} rejected matches back to pending`,
      resetCount: updatedMatches.count
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to reset rejected matches',
      details: error.message
    };
  }
} 