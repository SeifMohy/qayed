# Matching System Behavior Update

## Summary
Updated the transaction-invoice matching system to properly handle rejected and disputed matches in future matching calls.

## Problem
Previously, once a transaction or invoice was matched (regardless of approval/rejection status), it would be permanently excluded from future matching attempts. This meant that rejected matches could never be reconsidered, limiting the system's flexibility.

## Solution
Modified the matching logic to only exclude transactions and invoices that have **approved** matches, while including those with:
- No matches
- Only rejected matches
- Only disputed matches
- Mix of rejected/disputed matches (but no approved ones)

## Changes Made

### 1. Updated AI Matching API (`src/app/api/matching/ai-gemini/route.ts`)

#### Invoice Filtering (Lines 66-84)
**Before:**
```typescript
where: {
  TransactionMatch: {
    none: {}
  }
}
```

**After:**
```typescript
where: {
  // Include invoices that have no matches OR only rejected/disputed matches
  OR: [
    {
      TransactionMatch: {
        none: {}
      }
    },
    {
      TransactionMatch: {
        every: {
          status: {
            in: ['REJECTED', 'DISPUTED']
          }
        }
      }
    }
  ]
}
```

#### Transaction Filtering (Lines 92-115)
**Before:**
```typescript
where: {
  TransactionMatch: {
    none: {}
  },
  // ... other conditions
}
```

**After:**
```typescript
where: {
  AND: [
    {
      // Include transactions that have no matches OR only rejected/disputed matches
      OR: [
        {
          TransactionMatch: {
            none: {}
          }
        },
        {
          TransactionMatch: {
            every: {
              status: {
                in: ['REJECTED', 'DISPUTED']
              }
            }
          }
        }
      ]
    },
    // ... other conditions
  ]
}
```

#### Duplicate Prevention (Lines 247-270)
**Before:**
```typescript
// Check for existing match to avoid duplicates
const existingMatch = await prisma.transactionMatch.findFirst({
  where: {
    transactionId: match.transactionId,
    invoiceId: match.invoiceId
  }
});

if (existingMatch) {
  // Skip creating match
}
```

**After:**
```typescript
// Check for existing approved match to avoid duplicates
const existingApprovedMatch = await prisma.transactionMatch.findFirst({
  where: {
    transactionId: match.transactionId,
    invoiceId: match.invoiceId,
    status: 'APPROVED'
  }
});

if (existingApprovedMatch) {
  // Skip creating match
}

// Check for existing pending match to avoid creating multiple pending matches
const existingPendingMatch = await prisma.transactionMatch.findFirst({
  where: {
    transactionId: match.transactionId,
    invoiceId: match.invoiceId,
    status: 'PENDING'
  }
});

if (existingPendingMatch) {
  // Skip creating match
}
```

### 2. Updated Matching Stats API (`src/app/api/matching/stats/route.ts`)

#### "Unmatched" Definition (Lines 14-42)
**Before:** Items with no matches at all
**After:** Items with no matches OR only rejected/disputed matches

This provides a more accurate count of items available for matching.

### 3. Added Reset Endpoint for Testing (`src/app/api/matching/reset-rejected/route.ts`)
- New endpoint to reset rejected matches back to pending
- Useful for testing the new behavior
- Endpoint: `POST /api/matching/reset-rejected`

### 4. Updated Dashboard UI (`src/app/dashboard/matching/page.tsx`)
- Added informational note explaining the new smart re-matching behavior
- Clarifies that rejected/disputed matches are included in future runs

## Benefits

1. **Improved Flexibility**: Rejected matches can be reconsidered in future matching runs
2. **Better Accuracy**: System can find better matches as more data becomes available
3. **Reduced Manual Work**: Less need to manually recreate matches after rejection
4. **Smarter Statistics**: "Unmatched" counts now reflect items actually available for matching

## Database Impact

No schema changes required. The update only changes query logic, not data structure.

## Testing

Use the new reset endpoint to test the behavior:
```bash
curl -X POST http://localhost:3000/api/matching/reset-rejected
```

This will reset all rejected matches to pending, allowing you to test the re-matching behavior.

## Migration Notes

Existing rejected matches will automatically be included in future matching calls without requiring any data migration. 