# Bank Obligations & Loan Repayments - Fix Summary

## Issues Identified & Fixed

### 🔧 **Issue 1: Dual Implementation Complexity**
**Problem**: Two separate services handling bank obligations
- Legacy: `bankFacilityProjectionService.ts` 
- Centralized: `centralizedCashflowProjectionService.ts`

**Solution**: Removed legacy service entirely, consolidated into centralized approach

### 🔧 **Issue 2: Inconsistent Tenor Parsing**
**Problem**: Different parsing logic with different defaults
- Legacy assumed days if no unit specified
- Centralized assumed months if no unit specified

**Solution**: Implemented robust tenor parsing with:
- Comprehensive unit detection (years, months, weeks, days)
- Smart range-based guessing for unitless numbers
- Proper bounds checking (1-120 months)
- Detailed logging for debugging

### 🔧 **Issue 3: Complex Future Disbursements Logic**
**Problem**: System projected potential credit utilization automatically
- Created unrealistic cash inflow projections
- Complex logic for repayment schedules
- Used `availableLimit` instead of actual outstanding debt

**Solution**: Removed future disbursements entirely, focusing only on outstanding positions

### 🔧 **Issue 4: Date Calculation Edge Cases**
**Problem**: Month addition using `setMonth()` caused issues with month-end dates

**Solution**: Implemented proper `addMonths()` function handling edge cases

### 🔧 **Issue 5: Inconsistent Facility Detection**
**Problem**: Multiple criteria for identifying facility accounts

**Solution**: Simplified to require both:
- Negative balance (actual outstanding debt)
- Recognized facility account type OR tenor information

## Updated System Architecture

### **Simplified Bank Obligations Logic**

```typescript
// Only Outstanding Position approach
if (endingBalance < 0) {
  const outstandingAmount = Math.abs(endingBalance);
  const tenorMonths = this.parseTenor(statement.tenor);
  const monthlyPayment = outstandingAmount / tenorMonths;
  
  // Generate monthly repayments over tenor period
  for (let month = 1; month <= tenorMonths; month++) {
    // Create projection for each month
  }
}
```

### **Improved Tenor Parsing**

```typescript
// Comprehensive parsing with smart defaults
if (cleanTenor.includes('year')) return num * 12;
if (cleanTenor.includes('month')) return num;
if (cleanTenor.includes('week')) return num / 4.33;
if (cleanTenor.includes('day')) return num / 30.44;

// Smart range-based guessing for unitless numbers
if (num <= 12) return num; // Assume months
if (num <= 365) return num / 30.44; // Assume days
```

### **Proper Date Handling**

```typescript
private addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  const originalDay = date.getDate();
  
  newDate.setMonth(newDate.getMonth() + months);
  
  // Handle month-end edge cases (e.g., Jan 31 + 1 month = Feb 28/29)
  if (newDate.getDate() !== originalDay) {
    newDate.setDate(0); // Set to last day of target month
  }
  
  return newDate;
}
```

## Test Results

✅ **Working Example**: Ahli United Bank
- **Outstanding Balance**: $55,639,791.72 
- **Tenor**: "365" (parsed as 365 days = 12 months)
- **Monthly Payment**: $4,636,649.31
- **Schedule**: July 30, 2024 → June 28, 2025 (12 monthly payments)
- **Date Handling**: Properly handles month-end (Feb 28, not Feb 30)

## Files Modified

### **Removed**
- `src/lib/services/bankFacilityProjectionService.ts` (deleted)

### **Updated**
- `src/lib/services/centralizedCashflowProjectionService.ts`
  - Simplified bank obligation generation
  - Improved tenor parsing
  - Added proper date arithmetic
  - Removed future disbursements logic

- `src/app/api/cashflow/bank-obligations/route.ts`
  - Removed legacy service imports
  - Updated to provide debug info only
  - Redirects generation to centralized service

- `src/lib/services/cashflowProjectionService.ts`
  - Removed legacy facility projection calls

- `src/app/api/annotation/statements/[id]/route.ts`
  - Removed legacy facility projection updates

## Key Benefits

1. **Simplified Logic**: Only handles actual outstanding debt
2. **Accurate Calculations**: Uses ending balance, not credit limits
3. **Proper Date Handling**: Handles month-end edge cases correctly
4. **Robust Tenor Parsing**: Handles various formats with smart defaults
5. **No Duplicates**: Single source of truth for all projections
6. **Better Logging**: Comprehensive debug information

## Usage

The bank obligations are now fully integrated into the centralized cashflow system:

```bash
# Generate all projections including bank obligations
POST /api/cashflow/projections/refresh

# Debug facility information
GET /api/cashflow/bank-obligations?debug=true

# View projections
GET /api/cashflow/projections?useCentralized=true
```

Bank obligations are generated automatically based on:
- **Outstanding debt** (negative ending balance)
- **Account type** containing "overdraft", "loan", "credit", or "facility"
- **Tenor information** for repayment schedule calculation

The system now provides reliable, accurate bank obligation projections without the complexity of dual implementations or speculative future disbursements. 