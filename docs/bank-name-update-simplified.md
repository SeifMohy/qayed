# Bank Name Update Feature - Simplified Implementation

## Overview

This feature allows users to update bank names directly from the statement annotation form. When a bank name is changed, the system automatically updates all related bank statements that share the same bank ID.

## How It Works

### User Experience

1. **Navigate to Statement**: Go to `/dashboard/annotation/statements/[id]` for any bank statement
2. **Edit Bank Name**: In the "Statement Information" form, change the bank name field
3. **Save Changes**: Click the "Save Changes" button
4. **Automatic Update**: The system updates all statements with the same bank ID to use the new bank name

### Technical Implementation

#### API Endpoint: `/api/annotation/statements/[id]` (PUT)

When a bank name change is detected:

1. **Validation**: Ensures the new bank name is not empty
2. **Database Transaction**: Uses Prisma transactions to ensure data consistency
3. **Bank Record Management**: 
   - Finds existing bank with the new name, or creates a new one
   - Updates all bank statements with the same `bankId` to use the new bank name and bank ID
4. **Response**: Returns success message with count of updated statements

#### Key Features

- **Atomic Operations**: All updates happen in a single database transaction
- **Data Consistency**: Maintains consistency between `Bank.name` and `BankStatement.bankName`
- **Error Handling**: Comprehensive error handling for edge cases
- **User Feedback**: Clear success/error messages with dismissible alerts

#### Database Changes

When a bank name is updated:
- All `BankStatement` records with the same `bankId` get updated
- Both `bankName` (denormalized field) and `bankId` (foreign key) are updated
- If the new bank name doesn't exist, a new `Bank` record is created

## Example Usage

1. User has 5 bank statements for "First National Bank"
2. User edits one statement and changes bank name to "First National Bank - Main Branch"
3. System automatically updates all 5 statements to use the new bank name
4. User sees success message: "Bank name updated. 5 statements updated with the new bank name."

## Error Handling

- **Empty Bank Name**: Prevents saving empty bank names
- **Database Errors**: Handles unique constraint violations and other database errors
- **User Feedback**: Shows clear error messages with dismissible alerts

## Benefits

- **Simple UX**: No special UI needed - works through existing form
- **Data Integrity**: Ensures all related statements stay synchronized
- **Performance**: Efficient bulk updates using database transactions
- **Consistency**: Maintains referential integrity between Bank and BankStatement tables 