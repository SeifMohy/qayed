# Bank Statement Concurrency System

## Overview

The Bank Statement Concurrency System prevents duplicate data entry, manages overlapping date ranges, and handles bank/account relationships automatically when uploading bank statements.

## Core Features

### 1. Duplicate Detection & Prevention
- **Exact Duplicates**: Same account number, bank name, and date range → Skipped completely
- **Partial Duplicates**: Same account/bank but different date ranges → New statement created
- **Overlapping Periods**: Same account/bank with overlapping dates → Transactions merged

### 2. Bank Relationship Management
- **New Bank**: Creates new bank and statement when no matches found
- **Existing Bank**: Adds statement to existing bank when bank name matches
- **Bank Name Changes**: Handles potential bank rebranding or data corrections

## Processing Flow

### Upload Processing

When a bank statement is uploaded and processed, the system follows this decision tree:

1. **Check Account Number**: Does this account number exist in the database?
   - **No** → Check if bank name exists
     - **No** → CREATE_NEW (new bank and statement)
     - **Yes** → ADD_TO_EXISTING_BANK
   - **Yes** → Check bank name match
     - **No** → Check if target bank exists
       - **No** → CREATE_NEW
       - **Yes** → ADD_TO_EXISTING_BANK
     - **Yes** → Check date ranges
       - **Exact match** → SKIP_DUPLICATE
       - **Overlapping** → MERGE_DIFFERENT_PERIOD
       - **Different** → ADD_TO_EXISTING_BANK

### Processing Actions

#### 1. CREATE_NEW
- **Trigger**: No matching account number or bank name
- **Action**: Create new bank and new statement
- **Example**: First upload of "NBE" bank account "123456"

#### 2. SKIP_DUPLICATE  
- **Trigger**: Exact match of account number, bank name, and date range
- **Action**: Skip processing, return existing statement ID
- **Example**: Re-uploading the same statement file

#### 3. MERGE_DIFFERENT_PERIOD
- **Trigger**: Same account and bank, but overlapping date ranges
- **Action**: Merge transactions into existing statement, expand date range
- **Example**: Uploading Jan-Mar statement when Feb-Apr already exists

#### 4. ADD_TO_EXISTING_BANK
- **Trigger**: Same bank name but different account, or same account with non-overlapping dates
- **Action**: Create new statement under existing bank
- **Example**: Adding savings account statement to existing checking account bank

## Annotation Updates

### Bank Name Updates

When a bank name is updated during annotation:

```typescript
PUT /api/annotation/statements/{id}/update-bank
{
  "bankName": "New Bank Name"
}
```

**Process**:
1. Find or create bank with new name
2. Update statement's bank affiliation
3. Reset validation status (requires re-validation)

### Account Number Updates

When an account number is updated during annotation:

```typescript
PUT /api/annotation/statements/{id}/update-account
{
  "accountNumber": "new-account-123"
}
```

**Process**:
1. Check for existing statements with same account number and bank
2. If found with overlapping dates → Merge statements
3. If found with different dates → Allow coexistence
4. If not found → Simple update

**Merge Behavior**:
- Overlapping date ranges → Transactions moved to existing statement, original deleted
- Non-overlapping ranges → Both statements kept with updated account number

## Database Impact

### Statement Merging

When statements are merged:
- **Date Range**: Expanded to encompass both statements
- **Transactions**: All transactions moved to target statement
- **Validation**: Reset to 'pending' (requires re-validation)
- **Source Statement**: Deleted after successful merge

### Bank Creation

New banks are created automatically:
- **Case Insensitive**: "NBE" and "nbe" treated as same bank
- **Whitespace Normalized**: Leading/trailing spaces removed
- **Egyptian Bank Matching**: Attempts to match with predefined Egyptian bank list

## API Response Format

### Structure Bank Statement Response

```json
{
  "success": true,
  "savedStatements": [
    {
      "id": 123,
      "fileName": "statement.pdf",
      "bankName": "National Bank of Egypt",
      "accountNumber": "12345678",
      "transactionCount": 45
    }
  ],
  "processingResults": [
    {
      "action": "CREATE_NEW",
      "bankStatementId": 123,
      "transactionCount": 45,
      "message": "Created new bank and statement: No matching account number or bank name found."
    }
  ],
  "summary": {
    "totalProcessed": 1,
    "duplicatesSkipped": 0,
    "merged": 0,
    "newStatements": 1,
    "chunksProcessed": 3
  }
}
```

### Annotation Update Response

```json
{
  "success": true,
  "merged": true,
  "targetStatementId": 456,
  "message": "Merged into existing statement with overlapping date range. Original statement deleted.",
  "redirectTo": "/dashboard/annotation/statements/456"
}
```

## Usage Examples

### Example 1: First Upload
- **Upload**: NBE account 12345, Jan 1-31, 2024
- **Result**: CREATE_NEW
- **Outcome**: New "NBE" bank created, new statement added

### Example 2: Duplicate Upload  
- **Upload**: NBE account 12345, Jan 1-31, 2024 (same as Example 1)
- **Result**: SKIP_DUPLICATE
- **Outcome**: No new records, existing statement ID returned

### Example 3: Overlapping Period
- **Upload**: NBE account 12345, Jan 15 - Feb 15, 2024
- **Result**: MERGE_DIFFERENT_PERIOD
- **Outcome**: Transactions merged, date range expanded to Jan 1 - Feb 15

### Example 4: New Account, Same Bank
- **Upload**: NBE account 67890, Jan 1-31, 2024
- **Result**: ADD_TO_EXISTING_BANK
- **Outcome**: New statement added to existing NBE bank

### Example 5: Account Update During Annotation
- **Action**: Change account number from 12345 to 11111
- **Existing**: NBE account 11111 already exists with Feb 1-28, 2024
- **Result**: Statements merged if overlapping, coexist if not

## Error Handling

### Common Scenarios

1. **Invalid Dates**: Fallback to statement period or current date
2. **Missing Account Number**: Statement skipped with warning
3. **Database Conflicts**: Transactions rolled back, error logged
4. **Merge Failures**: Original statement preserved, error reported

### Logging

The system provides detailed logging for:
- Concurrency decisions and reasoning
- Merge operations and transaction counts  
- Validation status changes
- Error conditions and recovery actions

## Integration Points

### Services Used

- **Classification Service**: Automatic transaction categorization
- **Validation Service**: Balance and data consistency checks
- **Currency Service**: Multi-currency transaction handling
- **Google Sheets Service**: Annotation export functionality

### Frontend Integration

The frontend should handle:
- Processing result display with action summaries
- Redirect handling for merged statements
- Duplicate warning notifications
- Progress indication for batch uploads

## Performance Considerations

### Optimization Features

- **Batch Processing**: Multiple statements processed in sequence
- **Async Classification**: Transaction classification triggered separately
- **Selective Validation**: Only affected statements re-validated
- **Efficient Queries**: Indexed lookups for account numbers and bank names

### Database Indexes

Recommended indexes for optimal performance:
```sql
CREATE INDEX idx_bank_statement_account_number ON BankStatement(accountNumber);
CREATE INDEX idx_bank_statement_bank_name ON BankStatement(bankName);
CREATE INDEX idx_bank_statement_period ON BankStatement(statementPeriodStart, statementPeriodEnd);
CREATE INDEX idx_bank_name_insensitive ON Bank(LOWER(name));
```

## Troubleshooting

### Common Issues

1. **Statements Not Merging**: Check date format and overlap calculation
2. **Duplicate Banks Created**: Verify case-insensitive bank name matching
3. **Validation Failures**: Review balance calculation logic
4. **Transaction Loss**: Check merge transaction handling

### Debug Mode

Enable detailed logging in your environment:
```env
CONCURRENCY_DEBUG=true
```

The system will then log detailed information about each concurrency decision.

## Future Enhancements

### Planned Features

1. **Smart Bank Matching**: ML-based bank name normalization
2. **Manual Merge Review**: User confirmation for complex merges
3. **Batch Relationship Updates**: Update multiple statements simultaneously
4. **Audit Trail**: Complete history of concurrency decisions
5. **Configurable Rules**: Custom duplicate detection parameters 