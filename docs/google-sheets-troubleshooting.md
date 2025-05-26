# Google Sheets Troubleshooting Guide

## Common Errors and Solutions

### Error: "Invalid requests[0].repeatCell: No grid with id: 0"

**Cause**: This error occurs when the Google Sheets API tries to format a sheet that doesn't exist or has a different ID than expected.

**Solutions**:
1. **Updated Implementation**: The latest version of the code now:
   - Fetches the actual sheet ID after creation instead of assuming it's 0
   - Has fallback error handling for formatting failures
   - Creates the sheet successfully even if formatting fails

2. **If you still encounter this error**:
   - The sheet will still be created with data, just without formatting
   - Check the server logs for more detailed error information
   - Try refreshing the page and creating the sheet again

### Error: "Google Sheets configuration missing"

**Cause**: The required environment variables are not set.

**Solution**:
1. Ensure you have these environment variables in your `.env` file:
   ```bash
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
   ```

2. Restart your development server after adding the variables

### Error: "Permission denied" or "Forbidden"

**Cause**: The service account doesn't have the necessary permissions.

**Solutions**:
1. **Check API Enablement**:
   - Google Sheets API is enabled
   - Google Drive API is enabled (required for sharing)

2. **Service Account Permissions**:
   - The service account should have "Editor" role in your Google Cloud project
   - For organization accounts, check if there are additional restrictions

3. **Domain Restrictions**:
   - Some organizations restrict API access
   - Contact your Google Workspace administrator if needed

### Error: "Quota exceeded"

**Cause**: You've hit the Google Sheets API rate limits.

**Solutions**:
1. **Wait and Retry**: Rate limits reset over time
2. **Check Quotas**: Go to Google Cloud Console > APIs & Services > Quotas
3. **Request Quota Increase**: If you need higher limits for production use

### Error: "Invalid private key format"

**Cause**: The private key in the environment variable is not properly formatted.

**Solutions**:
1. **Check Newlines**: Ensure `\n` is used instead of actual line breaks:
   ```bash
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
   ```

2. **Copy from JSON**: Copy the exact value from the downloaded service account JSON file

3. **Escape Quotes**: If the key contains quotes, escape them properly

## Testing Your Setup

### 1. Test Template Creation
```bash
curl -X POST http://localhost:3000/api/annotation/google-sheet-template
```

Expected response:
```json
{
  "success": true,
  "data": {
    "spreadsheetId": "...",
    "url": "https://docs.google.com/spreadsheets/d/.../edit"
  }
}
```

### 2. Test Statement Sheet Creation
```bash
curl -X POST http://localhost:3000/api/annotation/statements/{statement-id}/google-sheet
```

### 3. Check Server Logs
Look for console messages that show the creation process:
- "Creating Google Sheet with title: ..."
- "Created spreadsheet: ... with sheet ID: ..."
- "Data added successfully, now formatting..."
- "Formatting completed successfully"
- "Permissions set successfully"

## Fallback Options

If Google Sheets integration continues to have issues:

1. **Use Excel Export**: The system still supports Excel export as a backup
2. **Manual Sheet Creation**: Create a Google Sheet manually and copy-paste the data
3. **CSV Export**: Export as Excel and convert to CSV for Google Sheets import

## Getting Help

If you continue to experience issues:

1. **Check Server Logs**: Look for detailed error messages in the console
2. **Verify Environment**: Ensure all environment variables are correctly set
3. **Test APIs**: Use the Google Cloud Console API Explorer to test your service account
4. **Contact Support**: Provide the specific error message and server logs

## Recent Improvements

The latest version includes:

- ✅ Dynamic sheet ID detection
- ✅ Graceful formatting failure handling
- ✅ Better error messages
- ✅ Fallback options if formatting fails
- ✅ Improved logging for debugging
- ✅ Validation of configuration before attempting creation

These improvements should resolve the "No grid with id: 0" error and make the system more robust overall. 