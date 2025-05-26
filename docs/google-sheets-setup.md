# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for the bank statement annotation system.

## Prerequisites

1. A Google Cloud Platform (GCP) project
2. Google Sheets API enabled
3. Google Drive API enabled
4. A service account with appropriate permissions

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API

## Step 2: Create a Service Account

1. In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "bank-statement-sheets"
4. Grant it the following roles:
   - Editor (for creating and modifying sheets)
5. Create and download a JSON key file

## Step 3: Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

### Getting the Values

From the downloaded JSON key file:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The `client_email` field
- `GOOGLE_PRIVATE_KEY`: The `private_key` field (keep the quotes and newlines)

**Important**: Make sure to escape the newlines in the private key by using `\n` instead of actual line breaks.

## Step 4: Test the Integration

1. Restart your development server
2. Navigate to a bank statement annotation page
3. Click "Create Google Sheet" to test the integration
4. The sheet should be created and opened in a new tab

## Features

### Create Google Sheet
- Creates a new Google Sheet with all transaction data
- Automatically formats headers and columns
- Makes the sheet publicly viewable (read-only)
- Opens the sheet in a new browser tab

### Google Sheets Template
- Creates a sample Google Sheet with example transaction data
- Useful for understanding the expected format
- Can be used as a starting point for manual data entry

## Troubleshooting

### Common Issues

1. **"Google Sheets configuration missing" error**
   - Check that both environment variables are set correctly
   - Verify the service account email format
   - Ensure the private key includes the full key with headers

2. **"Failed to create Google Sheet" error**
   - Verify that the Google Sheets API is enabled
   - Check that the service account has the correct permissions
   - Ensure the private key is properly formatted with escaped newlines

3. **Permission denied errors**
   - Make sure the service account has Editor role
   - Verify that the Google Drive API is enabled (needed for sharing)

### Testing the Configuration

You can test your configuration by making a POST request to:
```
POST /api/annotation/google-sheet-template
```

This should create a template sheet and return a URL.

## Security Notes

- The service account key should be kept secure
- Never commit the `.env` file to version control
- Consider using environment-specific service accounts for production
- The created sheets are made publicly viewable but not editable
- Only users with the direct link can access the sheets

## API Endpoints

### Create Sheet from Statement
```
POST /api/annotation/statements/{id}/google-sheet
```
Creates a Google Sheet with all transactions from the specified statement.

### Create Template Sheet
```
POST /api/annotation/google-sheet-template
```
Creates a template Google Sheet with sample data.

Both endpoints return:
```json
{
  "success": true,
  "data": {
    "spreadsheetId": "sheet-id",
    "url": "https://docs.google.com/spreadsheets/d/sheet-id/edit"
  }
}
``` 