# Facility Account Determination Update

## Overview

Updated the way facility accounts are determined in the system. Previously, facility accounts were identified solely based on negative closing balances. The new implementation uses a more sophisticated approach that prioritizes extracted account types while maintaining backward compatibility.

## Key Changes

### 1. New Account Type-Based Logic

The system now determines facility accounts using the following prioritized logic:

1. **Primary determination**: Based on extracted account type
   - If account type matches known facility types → Treat as facility
   - If account type matches known regular account types → Treat as regular account
   - If account type is ambiguous or unknown → Fall back to balance-based determination

2. **Fallback determination**: Based on negative balance (for backward compatibility)

### 2. New Facility Account Types Supported

The system now recognizes the following account types as credit facilities:
- **Overdraft**
- **Short-term Loans (STL)**
- **Long-term Loans (LTL)**
- **Credit Facility**
- **Credit Line**
- **Line of Credit**
- **Term Loan**
- **Credit**

### 3. Regular Account Types

The following account types are explicitly treated as regular accounts (never facilities, even with negative balance):
- **Checking**
- **Savings**
- **Business**
- **Current Account**
- **Deposit Account**

## Files Updated

### 1. `src/utils/bankStatementUtils.ts` (New file)
- Created utility functions for facility account determination
- `isFacilityAccount()`: Main function to determine if an account is a facility
- `getFacilityDisplayType()`: Returns appropriate display name for facility types
- `isRegularAccount()`: Determines if an account is a regular account
- Contains account type constants and logic

### 2. `src/components/annotation/StatementMetadataForm.tsx`
- Updated account type dropdown to include new facility account types
- Organized options into groups: "Regular Accounts" and "Credit Facilities"
- Added import for utility constants

### 3. `src/app/dashboard/banks/page.tsx`
- Updated `processBanksData()` function to use new facility determination logic
- Replaced negative balance filtering with `isFacilityAccount()` checks
- Updated facility type display using `getFacilityDisplayType()`
- Enhanced logic separates cash accounts from facility accounts more accurately

### 4. `src/app/dashboard/banks/[id]/page.tsx`
- Updated `processAccountsData()` to use `isRegularAccount()` filter
- Updated `processFacilitiesData()` to use `isFacilityAccount()` filter
- Updated financial metrics calculation to use new logic
- Updated UI descriptions to reflect account type-based determination
- Changed tab descriptions from "negative balances" to account type-based descriptions

## Behavior Changes

### Before
- **Facility accounts**: Any account with negative balance
- **Regular accounts**: Any account with positive or zero balance
- **Risk**: Checking/savings accounts with temporary negative balances incorrectly classified as facilities

### After
- **Facility accounts**: 
  1. Accounts with facility-type account types (regardless of balance)
  2. Accounts with negative balance AND unknown/ambiguous account types (fallback)
- **Regular accounts**: 
  1. Accounts with regular account types (even if negative balance)
  2. Accounts with positive balance AND unknown account types
- **Benefit**: More accurate classification based on actual account purpose

## Backward Compatibility

The system maintains backward compatibility by:
1. Using negative balance as fallback when account type is not detected or ambiguous
2. Preserving existing data structure and API responses
3. Maintaining existing UI layouts and functionality

## Usage in Bank Statement Annotation

When annotating bank statements, users can now:
1. Select appropriate account types from the expanded dropdown
2. Choose from organized categories (Regular Accounts vs Credit Facilities)
3. Help the system make more accurate facility determinations
4. Override automatic classification through manual annotation

## Testing

The system was tested to ensure:
- ✅ Code compiles successfully (`npm run build`)
- ✅ New utility functions work correctly
- ✅ UI updates display properly
- ✅ Backward compatibility maintained
- ✅ Import statements resolved correctly

## Examples

### Account Type: "Overdraft", Balance: -$5,000
- **Before**: Facility (due to negative balance)
- **After**: Facility (due to account type + negative balance confirms it)

### Account Type: "Checking", Balance: -$100
- **Before**: Facility (due to negative balance)
- **After**: Regular Account (account type overrides negative balance)

### Account Type: null, Balance: -$1,000
- **Before**: Facility (due to negative balance)
- **After**: Facility (fallback to negative balance logic)

### Account Type: "Short-term Loans (STL)", Balance: $0
- **Before**: Regular Account (due to zero balance)
- **After**: Facility (due to account type indicating credit facility)

This update provides more accurate and meaningful facility account determination while maintaining system reliability and backward compatibility. 