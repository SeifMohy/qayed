# Payment Terms Enhancement for AI Matching Service

## Overview

Enhanced the AI-powered invoice-transaction matching service to include payment terms information, enabling more accurate and intelligent matching by considering payment schedules, due dates, and installment patterns.

## Changes Made

### 1. Enhanced Invoice Data Structure

**File**: `src/app/api/matching/ai-gemini/route.ts`

- Added `PaymentTermsData` import from types
- Extended `InvoiceForMatching` interface to include `paymentTerms` field
- Modified invoice query to include Customer and Supplier payment terms data
- Added payment terms extraction logic for both customer and supplier invoices

### 2. Payment Terms Formatting Function

Added `formatPaymentTerms()` helper function that converts payment terms data into human-readable format for AI processing:

```typescript
function formatPaymentTerms(paymentTerms: PaymentTermsData | null | undefined): string
```

**Features**:
- Handles standard payment periods (Net 30, Net 60, etc.)
- Formats down payment information (percentage or fixed amount)
- Displays installment schedules with amounts and due dates
- Provides fallback for invoices without specific terms

### 3. Enhanced AI Prompt

**Improved Invoice Information Display**:
- Each invoice now includes formatted payment terms in the AI prompt
- Clear presentation of payment schedules and due dates

**Enhanced Matching Criteria**:
- **Payment Terms Match**: New criterion considering timing expectations
  - Net payment periods (Net 30, Net 60, etc.)
  - Immediate payment requirements (Due on receipt)
  - Down payment matching for partial amounts
  - Installment payment recognition
- Maintains existing entity and amount matching criteria

**Updated Scoring Guidelines**:
- **Payment timing** evaluation relative to invoice date and terms
- **Payment term compliance** scoring for full, partial, and installment payments
- Higher scores for transactions matching expected payment schedules
- Consideration for early payments vs. late payments

## Benefits

### 1. Improved Matching Accuracy
- Better identification of partial payments (down payments)
- Recognition of installment payment patterns
- More accurate timing-based matching

### 2. Enhanced Business Logic
- Respects actual business payment terms rather than generic assumptions
- Handles complex payment structures (installments, down payments)
- Reduces false positives from timing mismatches

### 3. Better Handling of Payment Scenarios
- **Immediate Payments**: "Due on receipt" terms matched with quick payments
- **Standard Terms**: Net 30/60/90 matched with appropriate timing tolerance
- **Installment Plans**: Multiple transactions matched to single invoice
- **Down Payments**: Partial payments correctly identified and scored

## Example Scenarios

### Scenario 1: Installment Payment Invoice
```
Invoice: $10,000 with payment terms "50% down, 50% in 30 days"
Matching: AI will look for:
- ~$5,000 transaction near invoice date (down payment)
- ~$5,000 transaction ~30 days after invoice date (final payment)
```

### Scenario 2: Net 30 Terms
```
Invoice: $5,000 with "Net 30" terms
Matching: AI prioritizes transactions occurring 20-40 days after invoice date
```

### Scenario 3: Due on Receipt
```
Invoice: $2,000 with "Due on receipt" terms  
Matching: AI prioritizes transactions within 1-7 days of invoice date
```

## Database Requirements

The enhancement relies on existing `paymentTermsData` JSON fields in Customer and Supplier tables. No schema changes required.

## Performance Impact

- Minimal performance impact due to efficient query joins
- Payment terms formatting adds negligible processing time
- Enhanced AI prompts provide better context without significantly increasing token usage

## Future Enhancements

1. **Machine Learning Feedback**: Use matching results to improve payment term predictions
2. **Dynamic Terms**: Support for project-specific or contract-specific payment terms
3. **Currency Considerations**: Enhanced support for multi-currency payment term matching
4. **Payment Tolerance**: Configurable tolerances for timing and amount variations

## Testing Recommendations

1. Test with invoices having various payment terms (Net 30, installments, etc.)
2. Verify partial payment matching for down payment scenarios
3. Test timing accuracy for different payment periods
4. Validate handling of invoices without specific payment terms 