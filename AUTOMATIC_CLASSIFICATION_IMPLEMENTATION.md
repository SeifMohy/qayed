# Automatic Bank Statement Classification Implementation

## Overview

This document outlines the implementation of automatic bank statement classification that triggers after bank statement structuring and annotation edits.

## Features Implemented

### 1. **Centralized Classification Service**
- **File**: `src/lib/services/classificationService.ts`
- **Functions**:
  - `classifyBankStatementTransactions(bankStatementId)` - Classifies all transactions for a specific bank statement
  - `classifyBankTransactions(bankId)` - Classifies all transactions for all statements of a bank
- **Features**:
  - Batch processing of transactions (50 per batch)
  - Async processing with proper error handling
  - Rate limiting (2-second delays between batches)
  - Comprehensive logging
  - Fallback classification on API errors

### 2. **Automatic Triggers**

#### A. **After Bank Statement Upload/Structuring**
- **Endpoint**: `POST /api/structure-bankstatement`
- **Trigger**: After successful bank statement parsing and transaction creation
- **Implementation**: 
  - Automatic classification triggered for each saved bank statement
  - Non-blocking async execution
  - Classification status included in response

#### B. **After Transaction Updates**
- **Endpoint**: `PUT /api/bank-statements/[id]/transactions/[transactionId]`
- **Trigger**: After editing credit/debit amounts of existing transactions
- **Implementation**: 
  - Re-classification triggered for the entire bank statement
  - Ensures consistency across all transactions

#### C. **After Google Sheets Sync**
- **Endpoint**: `PUT /api/annotation/statements/[id]/google-sheet`
- **Trigger**: After syncing transactions from Google Sheets (bulk add/edit)
- **Implementation**: 
  - Re-classification triggered after transaction sync
  - Handles batch transaction changes from Google Sheets

#### D. **After Adding New Transactions**
- **Endpoint**: `POST /api/bank-statements/[id]/transactions`
- **Trigger**: After creating new transactions through annotation tool
- **Implementation**: 
  - New endpoint added to support transaction creation
  - Automatic classification triggered after creation

#### E. **After Deleting Transactions**
- **Endpoint**: `DELETE /api/bank-statements/[id]/transactions`
- **Trigger**: After removing transactions through annotation tool
- **Implementation**: 
  - New endpoint added to support transaction deletion
  - Re-classification triggered for remaining transactions

### 3. **Enhanced Existing Endpoint**
- **Endpoint**: `POST /api/classify-bank`
- **Enhancement**: Refactored to use the new centralized classification service
- **Maintains**: Backward compatibility for manual classification requests

## Technical Details

### Classification Logic
- **AI Model**: Gemini 2.5 Flash Preview
- **Categories**: 
  - CUSTOMER_PAYMENT
  - SUPPLIER_PAYMENT  
  - INTERNAL_TRANSFER
  - BANK_CHARGES
  - BANK_PAYMENTS
  - OTHER
  - UNKNOWN (fallback)

### Batch Processing
- **Batch Size**: 50 transactions per API call
- **Rate Limiting**: 2-second delay between batches
- **Error Handling**: Individual transaction errors don't fail the entire batch

### Data Stored for Each Classification
- Category classification
- Confidence score
- Classification reasoning
- Extracted entities (company/person names)
- Extracted references (invoice numbers, IDs)
- Alternative categories
- Classification timestamp
- AI model version

## API Response Enhancements

All endpoints that trigger classification now include:
```json
{
  "success": true,
  "data": {...},
  "classificationTriggered": true,
  "classificationResults": [...]  // Only in structure-bankstatement
}
```

## Error Handling

- Classification failures don't affect the main operation (bank statement upload, transaction edit, etc.)
- Comprehensive logging for troubleshooting
- Graceful fallback to default categories on API failures
- Error tracking for individual transactions

## Monitoring

### Console Logs
- Classification start/completion messages
- Batch processing progress
- Individual transaction classification results
- Error messages with context

### Database Tracking
Each transaction stores:
- `classifiedAt` - When classification occurred
- `classificationMethod` - Always "LLM" for automatic classification
- `llmModel` - AI model used
- `confidence` - Classification confidence score

## Usage Examples

### Automatic Triggers (No Manual Intervention)
1. **Upload bank statement** → Automatic classification
2. **Edit transaction amounts** → Automatic re-classification
3. **Sync from Google Sheets** → Automatic re-classification
4. **Add new transaction** → Automatic classification
5. **Delete transaction** → Automatic re-classification

### Manual Trigger (Existing)
```bash
POST /api/classify-bank
{
  "bankId": 123
}
```

## Benefits

1. **Seamless Integration**: Classification happens automatically without user intervention
2. **Data Consistency**: All new and modified transactions are always classified
3. **Performance**: Non-blocking async execution doesn't slow down user operations
4. **Reliability**: Comprehensive error handling ensures operations complete even if classification fails
5. **Scalability**: Batch processing handles large numbers of transactions efficiently
6. **Maintainability**: Centralized service makes updates and improvements easier

## Future Enhancements

- Confidence threshold-based manual review queuing
- Custom classification rules per bank/account type
- Machine learning model training based on manual corrections
- Real-time classification status updates via WebSocket
- Batch classification status dashboard 