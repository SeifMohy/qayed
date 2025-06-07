# Changelog

## 2025-01-23

- Update template to Tailwind CSS v4.0

## 2024-10-07

- Tidy tier data on pricing page

## 2024-09-23

- Fix incorrect date format on blog post page ([#1632](https://github.com/tailwindlabs/tailwindui-issues/issues/1632))
- Update all images to use absolute paths ([#1631](https://github.com/tailwindlabs/tailwindui-issues/issues/1631))

## 2024-09-13

- Update dependencies

## 2024-09-12

- Initial release

## 2025-01-20

### Fixed: Loan Payment Logic - Debit vs Credit Transactions
**Issue**: Loan payment projections were incorrectly created from credit transactions instead of debit transactions in facility accounts.

**Root Cause**: In banking terminology for facility accounts:
- **Debit transactions** = Money disbursed FROM the facility (new loans/drawdowns)  
- **Credit transactions** = Payments TO the facility (loan repayments)

**Solution**:
- Fixed `bankFacilityProjectionService.ts` to look for **debit transactions** when generating loan payment schedules
- Updated all references from `creditAmount` to `debitAmount` for disbursement detection
- Corrected comments and logging to reflect proper banking terminology

**Files Modified**:
- `src/lib/services/bankFacilityProjectionService.ts`
  - Changed disbursement detection from credit to debit transactions
  - Updated variable names: `creditAmount` → `debitAmount`
  - Fixed filtering logic to use debit amounts > 0

**Impact**: Loan payment projections now correctly identify new facility disbursements, providing accurate cashflow forecasting.

### UI Cleanup: Removed Debug Buttons from Cashflow Overview
**Change**: Removed development/debug buttons from the Cashflow Overview interface to simplify the user experience.

**Buttons Removed**:
- 🔧 Test Facilities (debugging button)
- 🧹 Fix Long Projections (cleanup utility)  
- Export (placeholder functionality)
- Settings (placeholder functionality)

**Remaining**: Only the "Refresh Projections" button is now visible, providing the core functionality users need.

**Files Modified**:
- `src/components/dashboard/CashflowOverview.tsx`
  - Removed debug button components and their event handlers
  - Cleaned up unused icon imports (Download, Settings)
  - Simplified header button layout

**Impact**: Cleaner, production-ready interface focused on essential cashflow management functionality.

### UI Cleanup: Removed Confidence Elements from Cashflow Overview  
**Change**: Removed confidence-related metrics from the Cashflow Overview as they don't provide meaningful value in this financial context.

**Elements Removed**:
- Confidence summary card showing "Average projection confidence"
- Confidence column from Daily Cash Position table
- `averageConfidence` from TypeScript interfaces (`CashflowSummary`, `CashPosition`)

**Remaining**: Focus on core financial metrics: Inflows, Outflows, Net Cashflow, Balance, and Items count.

**Files Modified**:
- `src/components/dashboard/CashflowOverview.tsx`
  - Removed confidence card from summary section
  - Removed confidence column from daily position table
  - Updated grid layout from 4 columns to 3 columns for summary cards
  - Updated daily position table from 7 columns to 6 columns
  - Cleaned up TypeScript interfaces

**Impact**: Simplified interface focused on actionable financial data rather than technical confidence scores.

### Critical Fix: Resolved Projection Stacking Issue
**Issue**: "Refresh Projections" was causing projections to stack on top of each other instead of replacing them, leading to duplicate and inflated cashflow numbers.

**Root Cause**: 
- Only invoice-based projections were being cleared (`invoiceId: { not: null }`)
- Bank facility `LOAN_PAYMENT` projections kept accumulating
- Recurring payment projections were never cleaned up
- Each refresh added more projections without removing old ones

**Solution**:
- Updated `clearExistingInvoiceProjections()` → `clearExistingProjections()` to clear **ALL** projections in the date range
- Removed the `invoiceId` filter that was limiting cleanup to only invoice projections
- Removed individual facility cleanup since main service now handles all cleanup
- Added comprehensive logging to track projection cleanup

**Files Modified**:
- `src/lib/services/cashflowProjectionService.ts`
  - Renamed method: `clearExistingInvoiceProjections()` → `clearExistingProjections()`
  - Removed `invoiceId: { not: null }` filter to clear ALL projection types
  - Enhanced logging for better debugging
  
- `src/lib/services/bankFacilityProjectionService.ts`
  - Removed individual `BANK_OBLIGATION` cleanup (now handled centrally)
  - Added note about centralized cleanup

**Impact**: 
- ✅ True "refresh" behavior - old projections are completely replaced, not stacked
- ✅ Accurate cashflow numbers without duplication
- ✅ Consistent behavior across all projection types (invoice, bank facility, recurring)
- ✅ Better performance by avoiding accumulating duplicate data

**Before**: Each refresh added more projections → inflated cashflow numbers
**After**: Each refresh replaces all projections → accurate, clean cashflow data

## [Latest Changes]

### ✅ **Bank Statement Date Fix - Projections Starting Point**
- **Date**: Current
- **Issue**: Facility projections were starting from today's date instead of the bank statement date
- **Root Cause**: Projections started from current date (Jan 2025) while bank statements were from June 2024, missing months of overdue payments
- **Solution**:
  - Fixed facility projections to start from `statementPeriodEnd` date instead of current date
  - Updated `generateFacilityProjections()` to use bank statement period end as default start date
  - Modified `generateAllFacilityProjections()` to not override each facility's statement date
  - Enhanced disbursement logic to use transaction dates as starting points
  - Added comprehensive logging to show bank statement periods vs projection periods
- **Result**: 
  - Projections now correctly start from the actual bank statement date
  - Past-due payments (between statement date and today) are properly included
  - Overdue facility obligations are now visible in cashflow projections
- **Example**: 
  - **Before**: June 2024 statement → projections start Jan 2025 (missing 7 months)
  - **After**: June 2024 statement → projections start June 2024 (includes all overdue payments)

### ✅ **Tenor Parsing Fix - Days vs Months**
- **Date**: Current
- **Issue**: Facility projections extending far into future (2055) due to tenor being parsed as months instead of days
- **Root Cause**: When tenor had no unit specified (e.g., "365"), it was defaulting to months, creating 365 monthly payments instead of 365-day tenor
- **Solution**:
  - Fixed `parseTenorToMonths()` function to default to **days** when no unit is specified
  - Added comprehensive tenor parsing for multiple formats:
    - `365` → interpreted as 365 days (~12 months)
    - `12 months` → 12 months
    - `2 years` → 24 months
    - `90 days` → ~3 months
    - `52 weeks` → ~12 months
  - Added detailed logging to show tenor interpretation process
  - Created cleanup endpoint `/api/cashflow/bank-obligations?action=cleanup-long-projections`
  - Added "🧹 Fix Long Projections" button in CashflowOverview to clean up incorrect projections
- **Result**: Facility projections now correctly distribute monthly over the intended tenor period in days

### ✅ **Facility Projections Debugging & Monthly Distribution Fix**
- **Date**: Current
- **Issue**: Facility obligations still not appearing in cashflow projections despite integration
- **Enhancements**:
  - Added comprehensive debugging to `bankFacilityProjectionService` with detailed logging
  - Enhanced monthly distribution calculation with proper date handling and overflow protection
  - Added debug endpoint `/api/cashflow/bank-obligations?action=debug` to inspect facility detection and projections
  - Fixed TypeScript compilation errors by properly using `Decimal` and enum types
  - Added "Test Facilities" button in CashflowOverview for manual debugging
  - Improved facility detection logging with balance and account type details
  - Enhanced repayment schedule calculation with payment-by-payment logging
  - Fixed date calculation edge cases (e.g., Jan 31 + 1 month = Feb 28/29)
  - Ensured projections start from current date and distribute monthly throughout tenor period
- **Debugging Features**:
  - Real-time facility account detection with detailed console output
  - Monthly payment calculation verification
  - Projection creation tracking with database IDs
  - Comprehensive facility analysis including tenor, available limits, and interest rates

### ✅ **Bank Obligations Cashflow Integration Fix**
- **Date**: Current
- **Issue**: Bank obligations were not appearing in cashflow projections
- **Solution**:
  - Integrated `bankFacilityProjectionService` into main `CashflowProjectionService`
  - Updated projection generation to include bank facility obligations alongside invoice projections
  - Enhanced cashflow overview to explicitly generate bank facility projections
  - Added comprehensive logging to track all projection types (receivables, payables, bank obligations, loan payments, recurring)
  - Improved API responses to include bank statement relationships and type counts
  - Ensured bank obligation projections are preserved when regenerating invoice projections
- **Result**: Cashflow overview now properly displays facility repayment obligations and schedules

### ✅ **Total Credit Available Calculation**
- **Date**: Current
- **Feature**: Calculate and display actual total credit available from facilities
- **Changes**:
  - Added calculation logic to aggregate available credit from all facilities with `availableLimit`
  - Updated "Total Credit Available" display to show calculated value instead of "N/A"
  - Formula: `Available Credit = Total Limit - Used Amount` for each facility
  - Improved state management for total credit tracking
  - Enhanced loading states to only show upload prompts when no credit data exists
  - Made available credit calculations consistent across facility tables
