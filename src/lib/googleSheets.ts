import { google } from 'googleapis';

export interface TransactionRow {
  date: string;
  description: string;
  creditAmount: number | null;
  debitAmount: number | null;
  balance: number | null;
  runningBalance: number | null;
  validation: string | null;
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
  config: GoogleSheetsConfig,
  startingBalance: number = 0
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
      'Running Balance',
      'Validation',
      'Page Number',
      'Entity Name'
    ];

    // Create rows with formulas for Running Balance and Validation columns
    const rows = transactions.map((transaction, index) => {
      const rowNumber = index + 2; // +2 because we have headers in row 1, and this is 0-indexed
      
      // Running Balance formula: Previous Running Balance + Credit - Debit
      // For first row, use starting balance; for subsequent rows, reference previous running balance
      let runningBalanceFormula: string;
      if (index === 0) {
        // First transaction: Starting Balance + Credit - Debit
        runningBalanceFormula = `=${startingBalance}+IFERROR(C${rowNumber},0)-IFERROR(D${rowNumber},0)`;
      } else {
        // Subsequent transactions: Previous Running Balance + Credit - Debit
        runningBalanceFormula = `=F${rowNumber - 1}+IFERROR(C${rowNumber},0)-IFERROR(D${rowNumber},0)`;
      }
      
      // Validation formula: Compare Running Balance with Balance column
      const validationFormula = `=IF(E${rowNumber}="","No Balance",IF(ABS(F${rowNumber}-E${rowNumber})<=0.01,"Match",IF(F${rowNumber}-E${rowNumber}>0,"+"&TEXT(ABS(F${rowNumber}-E${rowNumber}),"0.00"),"-"&TEXT(ABS(F${rowNumber}-E${rowNumber}),"0.00"))))`;

      return [
        transaction.date,
        transaction.description || '',
        transaction.creditAmount || '',
        transaction.debitAmount || '',
        transaction.balance || '',
        runningBalanceFormula, // Dynamic formula instead of static value
        validationFormula, // Dynamic formula instead of static value
        transaction.pageNumber || '',
        transaction.entityName || ''
      ];
    });

    const values = [headers, ...rows];
    
    console.log('Adding data to sheet, rows:', values.length);

    // Update the sheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED', // This allows formulas to be interpreted
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
            // Format Credit Amount column (C) with currency formatting
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Skip header
                  endRowIndex: transactions.length + 1,
                  startColumnIndex: 2, // Column C (Credit Amount)
                  endColumnIndex: 3
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat: {
                      type: 'CURRENCY',
                      pattern: '$#,##0.00'
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 0.0,
                        green: 0.6,
                        blue: 0.0
                      }
                    }
                  }
                },
                fields: 'userEnteredFormat(numberFormat,textFormat)'
              }
            },
            // Format Debit Amount column (D) with currency formatting
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Skip header
                  endRowIndex: transactions.length + 1,
                  startColumnIndex: 3, // Column D (Debit Amount)
                  endColumnIndex: 4
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat: {
                      type: 'CURRENCY',
                      pattern: '$#,##0.00'
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 0.8,
                        green: 0.0,
                        blue: 0.0
                      }
                    }
                  }
                },
                fields: 'userEnteredFormat(numberFormat,textFormat)'
              }
            },
            // Format Balance column (E) with currency formatting
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Skip header
                  endRowIndex: transactions.length + 1,
                  startColumnIndex: 4, // Column E (Balance)
                  endColumnIndex: 5
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat: {
                      type: 'CURRENCY',
                      pattern: '$#,##0.00'
                    },
                    textFormat: {
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat(numberFormat,textFormat)'
              }
            },
            // Format Running Balance column (F) with currency formatting
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Skip header
                  endRowIndex: transactions.length + 1,
                  startColumnIndex: 5, // Column F (Running Balance)
                  endColumnIndex: 6
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat: {
                      type: 'CURRENCY',
                      pattern: '$#,##0.00'
                    },
                    textFormat: {
                      bold: true,
                      foregroundColor: {
                        red: 0.0,
                        green: 0.0,
                        blue: 0.8
                      }
                    }
                  }
                },
                fields: 'userEnteredFormat(numberFormat,textFormat)'
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
      range: 'A2:I', // Updated range to include the validation column
    });

    const rows = response.data.values || [];
    
    const transactions: TransactionRow[] = rows.map(row => {
      // Helper function to safely parse numbers, handling formula results
      const safeParseFloat = (value: string | undefined): number | null => {
        if (!value || value === '') return null;
        // Remove currency symbols and formatting that might be in the displayed value
        const cleaned = value.toString().replace(/[$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };

      return {
        date: row[0] || '',
        description: row[1] || '',
        creditAmount: safeParseFloat(row[2]),
        debitAmount: safeParseFloat(row[3]),
        balance: safeParseFloat(row[4]),
        runningBalance: safeParseFloat(row[5]), // This will now be computed by the formula
        validation: row[6] || null, // This will now be computed by the formula
        pageNumber: row[7] || null,
        entityName: row[8] || null
      };
    });

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