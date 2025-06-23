# Orphaned Bank Cleanup Feature

## Overview

This feature automatically removes bank records that have no associated bank statements when bank names are updated during annotation. This keeps the database clean and prevents accumulation of unused bank records.

## How It Works

### Automatic Cleanup During Bank Name Updates

When a user updates a bank name through the annotation interface:

1. **Bank Name Change Detection**: The system detects when a bank name is being changed in the annotation API
2. **Statement Migration**: All bank statements with the old bank are moved to the new bank (creating it if necessary)
3. **Orphan Check**: The system checks if the old bank has any remaining bank statements
4. **Automatic Removal**: If the old bank has no statements, it's automatically deleted
5. **Logging**: The cleanup action is logged for audit purposes

### Manual Cleanup API

The system also provides endpoints for manual cleanup operations:

- `GET /api/banks/cleanup` - Lists all orphaned banks without deleting them
- `POST /api/banks/cleanup` - Removes all orphaned banks from the system

## Implementation Details

### Core Service (`src/lib/services/bankCleanupService.ts`)

The cleanup functionality is centralized in a reusable service with three main functions:

#### `cleanupOrphanedBank(bankId, transaction?)`
- Checks if a specific bank has any associated bank statements
- Removes the bank if it's orphaned
- Can be used within database transactions
- Returns cleanup result with bank name for logging

#### `cleanupOrphanedBanks(bankIds[], transaction?)`
- Bulk cleanup for multiple banks
- Returns count and names of removed banks

#### `cleanupAllOrphanedBanks()`
- System-wide cleanup of all orphaned banks
- Used by the manual cleanup API
- Returns comprehensive cleanup statistics

### Integration Points

#### 1. Annotation API (`src/app/api/annotation/statements/[id]/route.ts`)

The annotation API automatically triggers cleanup when bank names are updated:

```typescript
// During bank name update transaction
if (oldBankId !== targetBank.id) {
  await cleanupOrphanedBank(oldBankId, tx);
}
```

#### 2. Manual Cleanup API (`src/app/api/banks/cleanup/route.ts`)

Provides endpoints for administrative cleanup operations:

- **GET**: Returns list of orphaned banks for review
- **POST**: Executes cleanup and returns results

## Safety Features

### Transaction Safety
- All cleanup operations happen within database transactions
- If any part of the operation fails, the entire transaction is rolled back
- No bank is deleted unless the transaction completely succeeds

### Validation
- Double-checking that banks have zero statements before deletion
- Graceful error handling that doesn't break the main operation
- Comprehensive logging for audit trails

### Error Handling
- Non-throwing error handling prevents transaction rollbacks
- Detailed logging of all cleanup operations
- Graceful degradation if cleanup fails

## Usage Examples

### Automatic Cleanup (Happens Automatically)

When a user changes a bank name from "Old Bank Name" to "Banque Misr (BM)" in the annotation interface:

1. All statements with "Old Bank Name" are moved to "Banque Misr (BM)"
2. System checks if "Old Bank Name" bank record has any remaining statements
3. If none found, "Old Bank Name" bank record is automatically deleted
4. Success message includes information about the cleanup

### Manual Cleanup via API

**Check for orphaned banks:**
```bash
GET /api/banks/cleanup
```

Response:
```json
{
  "success": true,
  "orphanedBanks": [
    {
      "id": 15,
      "name": "Old Bank Name",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Execute cleanup:**
```bash
POST /api/banks/cleanup
```

Response:
```json
{
  "success": true,
  "message": "Successfully cleaned up 1 orphaned bank(s)",
  "removedCount": 1,
  "removedBanks": ["Old Bank Name"]
}
```

## Monitoring and Logging

### Console Logging

The system logs all cleanup operations with emojis for easy identification:

- `🗑️ Removed orphaned bank record: "Bank Name" (ID: 123)` - Successful cleanup
- `⚠️ Bank (ID: 123) still has 5 statements, keeping it` - Bank preserved due to statements
- `⚠️ Bank with ID 123 not found, may have already been deleted` - Already deleted

### Database Audit

Since all operations happen within transactions, database logs contain complete audit trails of:
- Which statements were moved
- Which banks were created/deleted
- When operations occurred
- Which user initiated the changes

## Benefits

### Database Hygiene
- Prevents accumulation of unused bank records
- Keeps the banks table clean and manageable
- Reduces storage overhead over time

### User Experience
- Seamless cleanup without user intervention
- No manual maintenance required
- Immediate consistency after bank name updates

### System Performance
- Smaller banks table improves query performance
- Reduces memory usage in bank selection dropdowns
- Cleaner data for reports and analytics

## Security Considerations

### Authorization
- Manual cleanup endpoints should be restricted to admin users
- Consider adding authentication middleware for manual cleanup operations

### Data Integrity
- Only banks with zero statements are ever deleted
- All operations are atomic within database transactions
- No cascading deletes that could affect statement data

## Future Enhancements

### Scheduled Cleanup
- Implement periodic cleanup job to catch any missed orphaned banks
- Add configuration for cleanup frequency

### Advanced Logging
- Database audit table for cleanup operations
- Admin dashboard showing cleanup history
- Metrics on cleanup frequency and volume

### Bulk Operations
- API endpoints for bulk bank operations
- Import/export functionality with automatic cleanup

## Troubleshooting

### Common Issues

**Error: "Bank not found during cleanup"**
- This is normal and indicates the bank was already deleted
- No action required, operation continues normally

**Error: "Transaction rollback during cleanup"**
- Check database connectivity
- Verify no foreign key constraints are preventing deletion
- Review application logs for specific error details

**Orphaned banks not being cleaned up**
- Check if the bank name update actually created a new bank record
- Verify transaction is completing successfully
- Check application logs for cleanup attempt messages 