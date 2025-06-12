# Account Type System Simplification

## Overview

Simplified the bank statement account type system to use only two account types:
- **Current Account**: Accounts with client's own money (reflected in cash balance)
- **Facility Account**: Accounts with bank's money (reflected in obligations)

This replaces the previous complex system with multiple account type categories.

## Problem Solved

The previous system had too many account type options that created confusion:

1. **Multiple regular types**: Checking, Savings, Business, Current Account, Deposit Account
2. **Multiple facility types**: Overdraft, STL, LTL, Credit Facility, Credit Line, Line of Credit, Term Loan, Credit
3. **Complex UI**: Nested optgroups and multiple choices for essentially the same function
4. **Classification ambiguity**: Users uncertain which specific type to choose

## Solution Implemented

### 1. Simplified Account Types

The system now uses only two standardized account types:

```typescript
// New simplified constants:
export const ACCOUNT_TYPES = [
  'Current Account',
  'Facility Account',
] as const;
```

### 2. Smart Legacy Support

The system maintains backward compatibility by:

- **Automatic classification**: Legacy account types are automatically mapped to the new system
- **Keyword detection**: Facility-related keywords (overdraft, loan, credit, facility) are detected
- **Balance fallback**: Negative balance accounts default to Facility Account when type is unclear

### 3. Enhanced Logic

Updated classification logic in `bankStatementUtils.ts`:

```typescript
export function isFacilityAccount(accountType: string | null | undefined, endingBalance: number): boolean {
  if (accountType) {
    // Exact match checking
    if (accountType === 'Facility Account') return true;
    if (accountType === 'Current Account') return false;
    
    // Legacy keyword detection
    const facilityKeywords = ['overdraft', 'loan', 'credit', 'facility', 'line of credit', 'term loan'];
    if (facilityKeywords.some(keyword => accountType.toLowerCase().includes(keyword))) {
      return true;
    }
  }
  
  // Fallback: negative balance = facility
  return endingBalance < 0;
}
```

## Code Changes

### Updated Files:

1. **`src/utils/bankStatementUtils.ts`**:
   - Simplified `ACCOUNT_TYPES` constant
   - Updated `isFacilityAccount()` logic
   - Removed `REGULAR_ACCOUNT_TYPES` and `FACILITY_ACCOUNT_TYPES`

2. **`src/components/annotation/StatementMetadataForm.tsx`**:
   - Updated imports to use new `ACCOUNT_TYPES`
   - Simplified dropdown to show only two options
   - Removed complex optgroup structure

3. **Database Migration**:
   - Created `scripts/standardize-account-types.ts`
   - Migrated 60 existing bank statements
   - Results: 45 Current Accounts, 15 Facility Accounts

## User Experience Improvements

### Before
- **Complex choices**: Multiple options for essentially the same account types
- **Decision paralysis**: Users unsure which specific type to choose (e.g., "Checking" vs "Business" vs "Current Account")
- **Inconsistent data**: Different users might classify the same account type differently

### After
- **Clear binary choice**: Either Current Account or Facility Account
- **Obvious classification**: Account purpose determines type (client money vs bank money)
- **Consistent data**: All users make the same logical distinction

## Business Logic Alignment

### Current Account (Client's Money)
- **Cash Balance Impact**: Positive balance increases available cash
- **Negative Balance**: Overdraft on client's own account
- **Examples**: Checking accounts, savings accounts, business accounts

### Facility Account (Bank's Money)
- **Obligations Impact**: Balance represents debt to the bank
- **Negative Balance**: Money owed to the bank (typical for facilities)
- **Examples**: Credit lines, loans, overdraft facilities, term loans

## Migration Results

Successfully migrated existing data:

```
📊 Found 60 bank statements to process
✅ Updated 1 statements to "Facility Account"
✅ Updated 6 statements to "Current Account"  
✅ Updated 14 statements with negative balance to "Facility Account"
✅ Updated 32 remaining statements to "Current Account"

📈 Final account type distribution:
  Current Account: 45 statements
  Facility Account: 15 statements
```

## Technical Benefits

1. **Simplified Logic**: Binary classification reduces complexity
2. **Clear Semantics**: Account type directly reflects financial purpose
3. **Better UX**: Users understand the distinction immediately
4. **Consistent Data**: Eliminates classification ambiguity
5. **Maintenance**: Much easier to maintain two types vs. dozen types

## Integration Points

This change maintains compatibility with:

- **Cashflow projections**: Current accounts contribute to cash balance
- **Facility management**: Facility accounts tracked as obligations
- **Reporting**: Clear distinction for financial reporting
- **API endpoints**: Existing API structure unchanged

## Future Considerations

1. **Account subtypes**: Could add optional subtype field for internal categorization while maintaining the binary public interface
2. **Enhanced detection**: Could improve automatic classification using transaction patterns
3. **User preferences**: Could remember user's typical classification patterns
4. **Validation rules**: Could add warnings for unusual account type vs. balance combinations 