import { google } from 'googleapis';

export interface TransactionRow {
  date: string;
  description: string;
  creditAmount: number | null;
  debitAmount: number | null;
  balance: number | null;
  pageNumber: string | null;
  entityName: string | null;
}

interface GoogleSheetsConfig {
  serviceAccountEmail: string;
  privateKey: string;
}

/**
 * Create a Google Sheets client
 */
function createSheetsClient(config: GoogleSheetsConfig) {
  const auth = new google.auth.JWT(
    config.serviceAccountEmail,
    undefined,
    config.privateKey.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
  );

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    drive: google.drive({ version: 'v3', auth })
  };
}

/**
 * Create a new Google Sheet with transaction data
 */
export async function createTransactionSheet(
  transactions: TransactionRow[],
  title: string,
  config: GoogleSheetsConfig
): Promise<{ spreadsheetId: string; url: string }> {
  const { sheets, drive } = createSheetsClient(config);

  try {
    console.log('Creating Google Sheet with title:', title);
    
    // Create a new spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title
        }
      }
    });

    const spreadsheetId = createResponse.data.spreadsheetId!;
    
    // Get the sheet information to find the correct sheet ID
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });
    
    const sheetId = spreadsheetInfo.data.sheets?.[0]?.properties?.sheetId;
    
    if (sheetId === undefined) {
      throw new Error('Could not determine sheet ID');
    }
    
    console.log('Created spreadsheet:', spreadsheetId, 'with sheet ID:', sheetId);

    // Prepare the data for the sheet
    const headers = [
      'Date',
      'Description', 
      'Credit Amount',
      'Debit Amount',
      'Balance',
      'Page Number',
      'Entity Name'
    ];

    const rows = transactions.map(transaction => [
      transaction.date,
      transaction.description || '',
      transaction.creditAmount || '',
      transaction.debitAmount || '',
      transaction.balance || '',
      transaction.pageNumber || '',
      transaction.entityName || ''
    ]);

    const values = [headers, ...rows];
    
    console.log('Adding data to sheet, rows:', values.length);

    // Update the sheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    console.log('Data added successfully, now formatting...');

    // Try to format the sheet, but don't fail if formatting doesn't work
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            // Format header row
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9
                    },
                    textFormat: {
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)'
              }
            },
            // Set default column width
            {
              updateDimensionProperties: {
                range: {
                  sheetId: sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headers.length
                },
                properties: {
                  pixelSize: 120
                },
                fields: 'pixelSize'
              }
            },
            // Set description column width (wider)
            {
              updateDimensionProperties: {
                range: {
                  sheetId: sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 1,
                  endIndex: 2
                },
                properties: {
                  pixelSize: 300
                },
                fields: 'pixelSize'
              }
            },
            // Freeze header row
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheetId,
                  gridProperties: {
                    frozenRowCount: 1
                  }
                },
                fields: 'gridProperties.frozenRowCount'
              }
            }
          ]
        }
      });
      console.log('Formatting completed successfully');
    } catch (formatError) {
      console.warn('Formatting failed, but sheet was created successfully:', formatError);
      // Continue without formatting - the sheet is still usable
    }

    console.log('Setting permissions...');

    // Try to make the sheet publicly editable
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'anyone'
        }
      });
      console.log('Permissions set successfully - sheet is now editable by anyone');
    } catch (permissionError) {
      console.warn('Could not set public permissions:', permissionError);
      // Continue - the sheet is still accessible to the creator
    }

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    return {
      spreadsheetId,
      url
    };

  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as any;
      console.error('API Error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data
      });
    }
    
    throw new Error('Failed to create Google Sheet: ' + (error as Error).message);
  }
}

/**
 * Sync changes from Google Sheet back to database
 */
export async function syncSheetToDatabase(
  spreadsheetId: string,
  statementId: number,
  config: GoogleSheetsConfig
): Promise<TransactionRow[]> {
  const { sheets } = createSheetsClient(config);

  try {
    // Get the data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A2:G', // Skip header row
    });

    const rows = response.data.values || [];
    
    const transactions: TransactionRow[] = rows.map(row => ({
      date: row[0] || '',
      description: row[1] || '',
      creditAmount: row[2] ? parseFloat(row[2]) : null,
      debitAmount: row[3] ? parseFloat(row[3]) : null,
      balance: row[4] ? parseFloat(row[4]) : null,
      pageNumber: row[5] || null,
      entityName: row[6] || null
    }));

    return transactions;

  } catch (error) {
    console.error('Error syncing from Google Sheet:', error);
    throw new Error('Failed to sync from Google Sheet: ' + (error as Error).message);
  }
}

/**
 * Get Google Sheets configuration from environment variables
 */
export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Sheets configuration missing. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
  }

  return {
    serviceAccountEmail,
    privateKey
  };
} 