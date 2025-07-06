import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { CompanyAccessService } from './companyAccessService';

export interface StatementPeriod {
  start_date: string;
  end_date: string;
}

export interface TransactionData {
  date: string;
  credit_amount: string;
  debit_amount: string;
  description: string;
  balance: string;
  page_number: string;
  entity_name: string;
}

export interface AccountStatement {
  bank_name: string;
  account_number: string;
  statement_period: StatementPeriod;
  account_type: string;
  account_currency: string;
  starting_balance: string;
  ending_balance: string;
  transactions: TransactionData[];
}

export interface ConcurrencyCheckResult {
  action: 'CREATE_NEW' | 'SKIP_DUPLICATE' | 'MERGE_DIFFERENT_PERIOD' | 'ADD_TO_EXISTING_BANK';
  existingBankId?: number;
  existingStatementId?: number;
  bankName: string;
  reason: string;
}

export interface ProcessingResult {
  bankStatementId: number;
  action: ConcurrencyCheckResult['action'];
  transactionCount: number;
  message: string;
}

/**
 * Check if two date ranges overlap
 */
function doDateRangesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 <= end2 && end1 >= start2;
}

/**
 * Check if two date ranges are exactly the same
 */
function areDateRangesExact(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1.getTime() === start2.getTime() && end1.getTime() === end2.getTime();
}

/**
 * Normalize bank name for comparison (case insensitive, trim whitespace)
 */
function normalizeBankName(bankName: string): string {
  return bankName.trim().toLowerCase();
}

/**
 * Check concurrency for a new bank statement
 */
export async function checkBankStatementConcurrency(
  accountNumber: string,
  bankName: string,
  statementPeriodStart: Date,
  statementPeriodEnd: Date,
  companyId: number
): Promise<ConcurrencyCheckResult> {
  
  // Step 1: Check for existing statements with the same account number (scoped to company)
  const existingStatements = await prisma.bankStatement.findMany({
    where: {
      accountNumber: accountNumber,
      bank: {
        companyId: companyId
      }
    },
    include: {
      bank: true
    },
    orderBy: {
      statementPeriodStart: 'asc'
    }
  });

  if (existingStatements.length === 0) {
    // No existing statements with this account number in this company
    // Step 2: Check if bank name exists in this company
    const existingBank = await prisma.bank.findFirst({
      where: {
        name: {
          equals: bankName,
          mode: 'insensitive'
        },
        companyId: companyId
      }
    });

    if (existingBank) {
      return {
        action: 'ADD_TO_EXISTING_BANK',
        existingBankId: existingBank.id,
        bankName: existingBank.name,
        reason: `No account match found, but bank "${existingBank.name}" exists. Adding as new statement.`
      };
    } else {
      return {
        action: 'CREATE_NEW',
        bankName: bankName,
        reason: 'No matching account number or bank name found. Creating new bank and statement.'
      };
    }
  }

  // Step 3: Check existing statements for bank name and date range matches
  for (const existingStatement of existingStatements) {
    const existingBankName = normalizeBankName(existingStatement.bankName);
    const newBankName = normalizeBankName(bankName);

    // Check if bank names match (case insensitive)
    if (existingBankName === newBankName) {
      // Same account number and same bank name
      // Check date ranges
      if (areDateRangesExact(
        statementPeriodStart, 
        statementPeriodEnd,
        existingStatement.statementPeriodStart,
        existingStatement.statementPeriodEnd
      )) {
        // Exact same date range - this is a duplicate
        return {
          action: 'SKIP_DUPLICATE',
          existingBankId: existingStatement.bankId,
          existingStatementId: existingStatement.id,
          bankName: existingStatement.bankName,
          reason: `Duplicate statement found. Same account number "${accountNumber}", bank "${existingStatement.bankName}", and date range.`
        };
      } else if (doDateRangesOverlap(
        statementPeriodStart,
        statementPeriodEnd, 
        existingStatement.statementPeriodStart,
        existingStatement.statementPeriodEnd
      )) {
        // Overlapping date ranges but not exact - merge different transactions
        return {
          action: 'MERGE_DIFFERENT_PERIOD',
          existingBankId: existingStatement.bankId,
          existingStatementId: existingStatement.id,
          bankName: existingStatement.bankName,
          reason: `Found overlapping date range for account "${accountNumber}" at bank "${existingStatement.bankName}". Will merge transactions under existing statement.`
        };
      } else {
        // Different date range, same account and bank - create new statement under same bank
        return {
          action: 'ADD_TO_EXISTING_BANK',
          existingBankId: existingStatement.bankId,
          bankName: existingStatement.bankName,
          reason: `Found same account "${accountNumber}" at bank "${existingStatement.bankName}" but different date range. Adding as new statement under existing bank.`
        };
      }
    }
  }

  // Step 4: Same account number but different bank name
  // This could be a bank name change or genuinely different bank
  // For now, we'll create new bank and statement but flag it for review
  const existingBank = await prisma.bank.findFirst({
    where: {
      name: {
        equals: bankName,
        mode: 'insensitive'
      },
      companyId: companyId
    }
  });

  if (existingBank) {
    return {
      action: 'ADD_TO_EXISTING_BANK',
      existingBankId: existingBank.id,
      bankName: existingBank.name,
      reason: `Account "${accountNumber}" exists with different bank name, but bank "${existingBank.name}" exists. Adding as new statement. Manual review recommended.`
    };
  } else {
    return {
      action: 'CREATE_NEW',
      bankName: bankName,
      reason: `Account "${accountNumber}" exists with different bank name. Creating new bank "${bankName}" and statement. Manual review recommended.`
    };
  }
}

/**
 * Process a bank statement according to concurrency rules
 */
export async function processBankStatementWithConcurrency(
  statement: AccountStatement,
  supabaseUserId: string,
  fileName?: string,
  fileUrl?: string,
  rawTextContent?: string
): Promise<ProcessingResult> {
  
  // Get user's company ID using CompanyAccessService
  const companyAccessService = new CompanyAccessService(supabaseUserId);
  const companyId = await companyAccessService.getCompanyId();
  
  // Parse dates
  const statementPeriodStart = new Date(statement.statement_period.start_date);
  const statementPeriodEnd = new Date(statement.statement_period.end_date);

  // Check concurrency with company scope
  const concurrencyCheck = await checkBankStatementConcurrency(
    statement.account_number,
    statement.bank_name,
    statementPeriodStart,
    statementPeriodEnd,
    companyId
  );

  console.log(`Concurrency check for ${statement.account_number}: ${concurrencyCheck.action} - ${concurrencyCheck.reason}`);

  switch (concurrencyCheck.action) {
    case 'SKIP_DUPLICATE':
      return {
        bankStatementId: concurrencyCheck.existingStatementId!,
        action: 'SKIP_DUPLICATE',
        transactionCount: 0,
        message: `Skipped duplicate: ${concurrencyCheck.reason}`
      };

    case 'MERGE_DIFFERENT_PERIOD':
      return await mergeTransactionsIntoExistingStatement(
        concurrencyCheck.existingStatementId!,
        statement.transactions,
        statementPeriodStart,
        statementPeriodEnd,
        concurrencyCheck.reason
      );

    case 'ADD_TO_EXISTING_BANK':
      return await createNewStatementInExistingBank(
        concurrencyCheck.existingBankId!,
        statement,
        fileName,
        fileUrl,
        rawTextContent,
        concurrencyCheck.reason
      );

    case 'CREATE_NEW':
    default:
      return await createNewBankAndStatement(
        statement,
        companyId,
        fileName,
        fileUrl,
        rawTextContent,
        concurrencyCheck.reason
      );
  }
}

/**
 * Merge transactions into an existing statement
 */
async function mergeTransactionsIntoExistingStatement(
  existingStatementId: number,
  newTransactions: TransactionData[],
  newPeriodStart: Date,
  newPeriodEnd: Date,
  reason: string
): Promise<ProcessingResult> {
  
  // Get existing statement to update date range if needed
  const existingStatement = await prisma.bankStatement.findUnique({
    where: { id: existingStatementId },
    include: { transactions: true }
  });

  if (!existingStatement) {
    throw new Error(`Existing statement ${existingStatementId} not found`);
  }

  // Update statement period to encompass both old and new ranges
  const expandedPeriodStart = new Date(Math.min(
    existingStatement.statementPeriodStart.getTime(),
    newPeriodStart.getTime()
  ));
  
  const expandedPeriodEnd = new Date(Math.max(
    existingStatement.statementPeriodEnd.getTime(),
    newPeriodEnd.getTime()
  ));

  // Convert transactions
  const transactionsToCreate = newTransactions.map((transaction, index) => {
    let transactionDate: Date;
    try {
      transactionDate = transaction.date ? new Date(transaction.date) : newPeriodStart;
    } catch {
      transactionDate = newPeriodStart;
      console.warn(`Invalid transaction date for transaction ${index + 1}, using statement start date`);
    }

    return {
      transactionDate,
      creditAmount: convertToDecimal(transaction.credit_amount) || null,
      debitAmount: convertToDecimal(transaction.debit_amount) || null,
      description: String(transaction.description || ''),
      balance: convertToDecimal(transaction.balance) || null,
      pageNumber: String(transaction.page_number || ''),
      entityName: String(transaction.entity_name || ''),
      bankStatementId: existingStatementId
    };
  });

  // Create new transactions and update statement period
  await prisma.$transaction(async (tx) => {
    // Create new transactions
    await tx.transaction.createMany({
      data: transactionsToCreate
    });

    // Update statement period
    await tx.bankStatement.update({
      where: { id: existingStatementId },
      data: {
        statementPeriodStart: expandedPeriodStart,
        statementPeriodEnd: expandedPeriodEnd,
        // Reset validation status since we added new transactions
        validated: false,
        validationStatus: 'pending',
        validatedAt: null
      }
    });
  });

  return {
    bankStatementId: existingStatementId,
    action: 'MERGE_DIFFERENT_PERIOD',
    transactionCount: newTransactions.length,
    message: `Merged ${newTransactions.length} transactions into existing statement: ${reason}`
  };
}

/**
 * Create a new statement in an existing bank
 */
async function createNewStatementInExistingBank(
  existingBankId: number,
  statement: AccountStatement,
  fileName?: string,
  fileUrl?: string,
  rawTextContent?: string,
  reason?: string
): Promise<ProcessingResult> {
  
  const startingBalance = convertToDecimal(statement.starting_balance);
  const endingBalance = convertToDecimal(statement.ending_balance);
  const statementPeriodStart = new Date(statement.statement_period.start_date);
  const statementPeriodEnd = new Date(statement.statement_period.end_date);

  const bankStatement = await prisma.bankStatement.create({
    data: {
      fileName,
      fileUrl,
      bankName: statement.bank_name,
      accountNumber: statement.account_number,
      statementPeriodStart,
      statementPeriodEnd,
      accountType: statement.account_type || null,
      accountCurrency: statement.account_currency || null,
      startingBalance: startingBalance || new Decimal(0),
      endingBalance: endingBalance || new Decimal(0),
      rawTextContent: rawTextContent || '',
      bankId: existingBankId,
      parsed: true,
      validated: false,
      validationStatus: 'pending',
      transactions: {
        create: statement.transactions.map((transaction, index) => {
          let transactionDate: Date;
          try {
            transactionDate = transaction.date ? new Date(transaction.date) : statementPeriodStart;
          } catch {
            transactionDate = statementPeriodStart;
            console.warn(`Invalid transaction date for transaction ${index + 1}, using statement start date`);
          }

          return {
            transactionDate,
            creditAmount: convertToDecimal(transaction.credit_amount) || null,
            debitAmount: convertToDecimal(transaction.debit_amount) || null,
            description: String(transaction.description || ''),
            balance: convertToDecimal(transaction.balance) || null,
            pageNumber: String(transaction.page_number || ''),
            entityName: String(transaction.entity_name || ''),
          };
        })
      }
    }
  });

  return {
    bankStatementId: bankStatement.id,
    action: 'ADD_TO_EXISTING_BANK',
    transactionCount: statement.transactions.length,
    message: `Created new statement in existing bank: ${reason || 'Added to existing bank'}`
  };
}

/**
 * Create a new bank and statement
 */
async function createNewBankAndStatement(
  statement: AccountStatement,
  companyId: number,
  fileName?: string,
  fileUrl?: string,
  rawTextContent?: string,
  reason?: string
): Promise<ProcessingResult> {
  
  const startingBalance = convertToDecimal(statement.starting_balance);
  const endingBalance = convertToDecimal(statement.ending_balance);
  const statementPeriodStart = new Date(statement.statement_period.start_date);
  const statementPeriodEnd = new Date(statement.statement_period.end_date);

  // Create bank first
  const bank = await prisma.bank.create({
    data: { name: statement.bank_name, companyId: companyId }
  });

  console.log(`Created new bank: ${bank.name} with ID: ${bank.id}`);

  // Create statement
  const bankStatement = await prisma.bankStatement.create({
    data: {
      fileName,
      fileUrl,
      bankName: statement.bank_name,
      accountNumber: statement.account_number,
      statementPeriodStart,
      statementPeriodEnd,
      accountType: statement.account_type || null,
      accountCurrency: statement.account_currency || null,
      startingBalance: startingBalance || new Decimal(0),
      endingBalance: endingBalance || new Decimal(0),
      rawTextContent: rawTextContent || '',
      bankId: bank.id,
      parsed: true,
      validated: false,
      validationStatus: 'pending',
      transactions: {
        create: statement.transactions.map((transaction, index) => {
          let transactionDate: Date;
          try {
            transactionDate = transaction.date ? new Date(transaction.date) : statementPeriodStart;
          } catch {
            transactionDate = statementPeriodStart;
            console.warn(`Invalid transaction date for transaction ${index + 1}, using statement start date`);
          }

          return {
            transactionDate,
            creditAmount: convertToDecimal(transaction.credit_amount) || null,
            debitAmount: convertToDecimal(transaction.debit_amount) || null,
            description: String(transaction.description || ''),
            balance: convertToDecimal(transaction.balance) || null,
            pageNumber: String(transaction.page_number || ''),
            entityName: String(transaction.entity_name || ''),
          };
        })
      }
    }
  });

  return {
    bankStatementId: bankStatement.id,
    action: 'CREATE_NEW',
    transactionCount: statement.transactions.length,
    message: `Created new bank and statement: ${reason || 'New bank and statement created'}`
  };
}

/**
 * Update a bank statement's bank affiliation (for annotation updates)
 */
export async function updateStatementBankAffiliation(
  statementId: number,
  newBankName: string,
  supabaseUserId: string
): Promise<void> {
  
  // Get user's company ID using CompanyAccessService
  const companyAccessService = new CompanyAccessService(supabaseUserId);
  const companyId = await companyAccessService.getCompanyId();
  
  // Find or create the new bank with company scope
  let bank = await prisma.bank.findFirst({
    where: {
      name: {
        equals: newBankName,
        mode: 'insensitive'
      },
      companyId: companyId
    }
  });

  if (!bank) {
    bank = await prisma.bank.create({
      data: { 
        name: newBankName,
        companyId: companyId
      }
    });
    console.log(`Created new bank for affiliation update: ${bank.name} with ID: ${bank.id} for company: ${companyId}`);
  }

  // Update the statement
  await prisma.bankStatement.update({
    where: { id: statementId },
    data: {
      bankId: bank.id,
      bankName: newBankName,
      // Reset validation since bank changed
      validated: false,
      validationStatus: 'pending',
      validatedAt: null
    }
  });

  console.log(`Updated statement ${statementId} to be affiliated with bank ${bank.name} (ID: ${bank.id})`);
}

/**
 * Update a bank statement's account number and handle potential merging
 */
export async function updateStatementAccountNumber(
  statementId: number,
  newAccountNumber: string
): Promise<{ merged: boolean; targetStatementId: number; message: string }> {
  
  const statement = await prisma.bankStatement.findUnique({
    where: { id: statementId },
    include: { transactions: true }
  });

  if (!statement) {
    throw new Error(`Statement ${statementId} not found`);
  }

  // Check if there's an existing statement with the same account number and bank
  const existingStatement = await prisma.bankStatement.findFirst({
    where: {
      accountNumber: newAccountNumber,
      bankId: statement.bankId,
      id: { not: statementId } // Exclude current statement
    },
    include: { transactions: true }
  });

  if (!existingStatement) {
    // No conflict, just update the account number
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        accountNumber: newAccountNumber,
        validated: false,
        validationStatus: 'pending',
        validatedAt: null
      }
    });

    return {
      merged: false,
      targetStatementId: statementId,
      message: `Updated account number to ${newAccountNumber}`
    };
  }

  // There's a conflict - we need to merge
  // Check date ranges to decide merge strategy
  if (doDateRangesOverlap(
    statement.statementPeriodStart,
    statement.statementPeriodEnd,
    existingStatement.statementPeriodStart,
    existingStatement.statementPeriodEnd
  )) {
    // Overlapping ranges - merge transactions into existing statement
    const expandedPeriodStart = new Date(Math.min(
      existingStatement.statementPeriodStart.getTime(),
      statement.statementPeriodStart.getTime()
    ));
    
    const expandedPeriodEnd = new Date(Math.max(
      existingStatement.statementPeriodEnd.getTime(),
      statement.statementPeriodEnd.getTime()
    ));

    await prisma.$transaction(async (tx) => {
      // Move transactions to existing statement
      await tx.transaction.updateMany({
        where: { bankStatementId: statementId },
        data: { bankStatementId: existingStatement.id }
      });

      // Update existing statement period
      await tx.bankStatement.update({
        where: { id: existingStatement.id },
        data: {
          statementPeriodStart: expandedPeriodStart,
          statementPeriodEnd: expandedPeriodEnd,
          validated: false,
          validationStatus: 'pending',
          validatedAt: null
        }
      });

      // Delete the now-empty statement
      await tx.bankStatement.delete({
        where: { id: statementId }
      });
    });

    return {
      merged: true,
      targetStatementId: existingStatement.id,
      message: `Merged into existing statement with overlapping date range. Original statement deleted.`
    };
  } else {
    // Non-overlapping ranges - just update account number (they can coexist)
    await prisma.bankStatement.update({
      where: { id: statementId },
      data: {
        accountNumber: newAccountNumber,
        validated: false,
        validationStatus: 'pending',
        validatedAt: null
      }
    });

    return {
      merged: false,
      targetStatementId: statementId,
      message: `Updated account number to ${newAccountNumber}. No merge needed (different date ranges).`
    };
  }
}

/**
 * Helper function to convert string values to Decimal
 */
function convertToDecimal(value: any): Decimal | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  try {
    // Convert to string first, then clean it
    const stringValue = String(value);
    
    // Remove currency symbols, commas, and extra spaces
    const cleanedValue = stringValue
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus signs
      .trim();
    
    if (cleanedValue === '' || cleanedValue === '.' || cleanedValue === '-') {
      return null;
    }

    const decimalValue = new Decimal(cleanedValue);
    return decimalValue.isNaN() ? null : decimalValue;
  } catch (error) {
    console.error('Error converting to decimal:', { value, error });
    return null;
  }
} 