import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTransactionSheet, getGoogleSheetsConfig, syncSheetToDatabase } from '@/lib/googleSheets';
import type { TransactionRow } from '@/lib/googleSheets';
import { Decimal } from '@prisma/client/runtime/library';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Helper function to perform balance validation
function performBalanceValidation(statement: any): {
  status: 'passed' | 'failed';
  notes: string;
} {
  const startingBalance = Number(statement.startingBalance);
  const endingBalance = Number(statement.endingBalance);
  const transactions = statement.transactions;

  // Calculate totals
  let totalCredits = 0;
  let totalDebits = 0;

  transactions.forEach((transaction: any) => {
    if (transaction.creditAmount) {
      totalCredits += Number(transaction.creditAmount);
    }
    if (transaction.debitAmount) {
      totalDebits += Number(transaction.debitAmount);
    }
  });

  // Calculate expected ending balance
  const calculatedBalance = startingBalance + totalCredits - totalDebits;
  const discrepancy = Math.abs(calculatedBalance - endingBalance);

  // Determine validation status
  const tolerance = 0.01; // Allow 1 cent tolerance for rounding
  const status = discrepancy <= tolerance ? 'passed' : 'failed';

  // Generate notes
  let notes = '';
  if (status === 'passed') {
    notes = `Auto-validation passed after sync. Starting balance (${startingBalance.toFixed(2)}) + Credits (${totalCredits.toFixed(2)}) - Debits (${totalDebits.toFixed(2)}) = Ending balance (${endingBalance.toFixed(2)})`;
  } else {
    notes = `Auto-validation failed after sync. Expected ending balance: ${calculatedBalance.toFixed(2)}, Actual: ${endingBalance.toFixed(2)}, Discrepancy: ${discrepancy.toFixed(2)}`;
  }

  return {
    status,
    notes
  };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid statement ID'
      }, { status: 400 });
    }

    // Check Google Sheets configuration first
    let config;
    try {
      config = getGoogleSheetsConfig();
    } catch (configError) {
      console.error('Google Sheets configuration error:', configError);
      return NextResponse.json({
        success: false,
        error: 'Google Sheets is not configured. Please contact your administrator.'
      }, { status: 500 });
    }

    // Get statement with transactions
    const statement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!statement) {
      return NextResponse.json({
        success: false,
        error: 'Statement not found'
      }, { status: 404 });
    }

    if (statement.transactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No transactions found for this statement'
      }, { status: 400 });
    }

    // Convert transactions to the format expected by Google Sheets
    let currentRunningBalance = Number(statement.startingBalance);
    
    const transactionRows: TransactionRow[] = statement.transactions.map((transaction, index) => {
      // Safely convert date to YYYY-MM-DD format
      let dateString = '';
      try {
        const date = new Date(transaction.transactionDate);
        if (!isNaN(date.getTime())) {
          dateString = date.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error converting transaction date:', error);
      }

      // Calculate running balance for this transaction
      const creditAmount = transaction.creditAmount ? Number(transaction.creditAmount) : 0;
      const debitAmount = transaction.debitAmount ? Number(transaction.debitAmount) : 0;
      currentRunningBalance = currentRunningBalance + creditAmount - debitAmount;

      // Calculate validation - compare balance with running balance
      const originalBalance = transaction.balance ? Number(transaction.balance) : null;
      let validation = '';
      
      if (originalBalance !== null) {
        const difference = currentRunningBalance - originalBalance;
        
        if (difference === 0) {
          validation = 'Match';
        } else {
          const sign = difference > 0 ? '+' : '-';
          validation = `${sign}${Math.abs(difference).toFixed(2)}`;
        }
      } else {
        validation = 'No Balance';
      }

      return {
        date: dateString,
        description: transaction.description || '',
        creditAmount: transaction.creditAmount ? Number(transaction.creditAmount) : null,
        debitAmount: transaction.debitAmount ? Number(transaction.debitAmount) : null,
        balance: transaction.balance ? Number(transaction.balance) : null,
        runningBalance: currentRunningBalance,
        validation: validation,
        pageNumber: transaction.pageNumber || null,
        entityName: transaction.entityName || null
      };
    });

    // Create the Google Sheet
    const title = `Bank Statement ${statement.bankName} - ${statement.accountNumber} - ${statement.statementPeriodStart.toISOString().split('T')[0]}`;
    
    console.log(`Creating Google Sheet for statement ${id} with ${transactionRows.length} transactions`);
    
    const result = await createTransactionSheet(transactionRows, title, config, Number(statement.startingBalance));

    // Store the spreadsheet ID in the database for future syncing
    await prisma.bankStatement.update({
      where: { id },
      data: {
        googleSheetId: result.spreadsheetId
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        spreadsheetId: result.spreadsheetId,
        url: result.url,
        transactionCount: transactionRows.length
      }
    });

  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create Google Sheet';
    
    if (error.message.includes('Invalid requests')) {
      errorMessage = 'Google Sheets formatting error. The sheet was created but may not be formatted correctly.';
    } else if (error.message.includes('permission')) {
      errorMessage = 'Google Sheets permission error. Please check your service account permissions.';
    } else if (error.message.includes('quota')) {
      errorMessage = 'Google Sheets API quota exceeded. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid statement ID'
      }, { status: 400 });
    }

    // Check Google Sheets configuration first
    let config;
    try {
      config = getGoogleSheetsConfig();
    } catch (configError) {
      console.error('Google Sheets configuration error:', configError);
      return NextResponse.json({
        success: false,
        error: 'Google Sheets is not configured. Please contact your administrator.'
      }, { status: 500 });
    }

    // Get statement to find the Google Sheet ID
    const statement = await prisma.bankStatement.findUnique({
      where: { id }
    });

    if (!statement) {
      return NextResponse.json({
        success: false,
        error: 'Statement not found'
      }, { status: 404 });
    }

    if (!statement.googleSheetId) {
      return NextResponse.json({
        success: false,
        error: 'No Google Sheet associated with this statement'
      }, { status: 400 });
    }

    console.log(`Syncing changes from Google Sheet ${statement.googleSheetId} to statement ${id}`);

    // Get updated data from Google Sheets
    const updatedTransactions = await syncSheetToDatabase(statement.googleSheetId, id, config);

    // Delete existing transactions
    await prisma.transaction.deleteMany({
      where: { bankStatementId: id }
    });

    // Create new transactions from Google Sheets data
    const transactionsToCreate = updatedTransactions
      .filter(row => row.date) // Only include rows with dates
      .map(row => ({
        bankStatementId: id,
        transactionDate: new Date(row.date),
        description: row.description || null,
        creditAmount: row.creditAmount || null,
        debitAmount: row.debitAmount || null,
        balance: row.balance || null,
        pageNumber: row.pageNumber || null,
        entityName: row.entityName || null,
        currency: statement.accountCurrency || null // Inherit currency from bank statement
      }));

    if (transactionsToCreate.length > 0) {
      await prisma.transaction.createMany({
        data: transactionsToCreate
      });
    }

    // Get the updated statement with new transactions for validation
    const updatedStatement = await prisma.bankStatement.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    if (!updatedStatement) {
      throw new Error('Failed to fetch updated statement for validation');
    }

    // Perform automatic validation after sync
    const validationResult = performBalanceValidation(updatedStatement);

    // Update statement with validation result
    await prisma.bankStatement.update({
      where: { id },
      data: {
        validated: validationResult.status === 'passed',
        validationStatus: validationResult.status,
        validationNotes: validationResult.notes,
        validatedAt: validationResult.status === 'passed' ? new Date() : null
      }
    });

    // Trigger automatic re-classification after Google Sheets sync
    try {
      console.log(`Triggering automatic re-classification for bank statement ${id} after Google Sheets sync`);
      
      // Import the classification service
      const { classifyBankStatementTransactions } = await import('@/lib/services/classificationService');
      
      // Trigger classification asynchronously (don't wait for it to complete)
      classifyBankStatementTransactions(id)
          .then((result) => {
              console.log(`Re-classification completed for statement ${id}: ${result.classifiedCount}/${result.totalTransactions} transactions classified`);
          })
          .catch((error) => {
              console.error(`Re-classification failed for statement ${id}:`, error);
          });
    } catch (error) {
      console.error(`Failed to trigger re-classification for statement ${id}:`, error);
      // Don't fail the main request if classification trigger fails
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionCount: transactionsToCreate.length,
        message: 'Transactions synced successfully from Google Sheets',
        validationStatus: validationResult.status,
        validationNotes: validationResult.notes,
        classificationTriggered: true
      }
    });

  } catch (error: any) {
    console.error('Error syncing from Google Sheet:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to sync from Google Sheet: ' + error.message
    }, { status: 500 });
  }
} 