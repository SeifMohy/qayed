import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTransactionSheet, getGoogleSheetsConfig, syncSheetToDatabase } from '@/lib/googleSheets';
import type { TransactionRow } from '@/lib/googleSheets';

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
            transactionDate: 'asc'
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
    const transactionRows: TransactionRow[] = statement.transactions.map(transaction => {
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

      return {
        date: dateString,
        description: transaction.description || '',
        creditAmount: transaction.creditAmount ? Number(transaction.creditAmount) : null,
        debitAmount: transaction.debitAmount ? Number(transaction.debitAmount) : null,
        balance: transaction.balance ? Number(transaction.balance) : null,
        pageNumber: transaction.pageNumber || null,
        entityName: transaction.entityName || null
      };
    });

    // Create the Google Sheet
    const title = `Bank Statement ${statement.bankName} - ${statement.accountNumber} - ${statement.statementPeriodStart.toISOString().split('T')[0]}`;
    
    console.log(`Creating Google Sheet for statement ${id} with ${transactionRows.length} transactions`);
    
    const result = await createTransactionSheet(transactionRows, title, config);

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
        entityName: row.entityName || null
      }));

    if (transactionsToCreate.length > 0) {
      await prisma.transaction.createMany({
        data: transactionsToCreate
      });
    }

    // Reset validation status since data has changed
    await prisma.bankStatement.update({
      where: { id },
      data: {
        validated: false,
        validationStatus: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionCount: transactionsToCreate.length,
        message: 'Transactions synced successfully from Google Sheets'
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