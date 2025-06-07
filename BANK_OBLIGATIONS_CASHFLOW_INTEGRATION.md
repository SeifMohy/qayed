# Bank Obligations Cashflow Integration

## Overview

Integrated bank facility obligations into the cashflow projection system. The system automatically generates cashflow projections for facility repayments based on outstanding amounts and tenor periods, plus tracks new disbursements.

## Key Features

### ✅ **Automated Facility Repayment Projections**
- Spreads current facility outstanding amounts over the tenor period
- Creates monthly payment schedule based on tenor
- Generates specific dates for each payment

### ✅ **New Disbursement Tracking**  
- Monitors credit transactions from facility accounts (new disbursements)
- Creates repayment projections for each new disbursement
- Uses facility tenor to calculate repayment schedule

### ✅ **Intelligent Tenor Parsing**
- Supports "months", "years", "weeks", "days" 
- Handles various formats ("12 months", "2 years", "90 days")
- Uses 12 months default if no tenor specified

### ✅ **Automatic Integration**
- Projections update automatically when facility terms change
- Facility editing triggers projection regeneration
- Background processing doesn't block operations

## Database Changes

### Extended CashflowProjection Model
```prisma
model CashflowProjection {
  // ... existing fields
  bankStatementId Int?
  BankStatement   BankStatement? @relation(fields: [bankStatementId], references: [id])
}
```

### New CashflowType Values
```prisma
enum CashflowType {
  BANK_OBLIGATION      // For facility repayments
  LOAN_PAYMENT         // For new disbursement repayments
}
```

## Core Service Functions

### `generateFacilityProjections(options)`
- Generates projections for specific facility
- Handles existing outstanding + new disbursements
- Returns detailed projection summary

### `generateAllFacilityProjections()`
- Processes all facility accounts
- Creates projections based on current state
- Returns array of summaries

### `updateFacilityProjections(facilityId)`
- Cleans up existing projections
- Regenerates fresh projections
- Triggered when facility terms change

## API Endpoint: `/api/cashflow/bank-obligations`

### GET Requests
- `?action=summary` - Get facility projections overview
- `?action=generate-all` - Generate projections for all facilities
- `?facilityId=123` - Generate for specific facility

### POST Requests
```json
{
  "action": "generate-all" | "update",
  "facilityId": 123,
  "generateForExisting": true,
  "generateForNewDisbursements": true
}
```

## Projection Logic

### Outstanding Amount Processing
```
Facility Balance: $100,000, Tenor: 12 months
Monthly Payment: $8,333.33
Creates 12 monthly BANK_OBLIGATION projections
```

### New Disbursement Processing
```
New Credit: $50,000, Tenor: 12 months  
Monthly Payment: $4,166.67
Creates 12 monthly LOAN_PAYMENT projections
```

## Integration Points

### Facility Editing Integration
1. User edits facility → Annotation API
2. API detects facility changes → Triggers projection update
3. Background process → Regenerates projections
4. User sees updated cashflow data

### Automatic Triggers
Projections update when these fields change:
- Tenor
- Available Limit  
- Interest Rate
- Account Type
- Ending Balance

## Business Benefits

### Automated Cashflow Planning
- Accurate projections based on actual facility terms
- Real-time updates as facilities change
- Complete picture of payment obligations

### Improved Financial Visibility
- Clear payment scheduling and timing
- Better cash planning capabilities
- Early visibility into future obligations

### Operational Efficiency
- No manual cashflow entry required
- Self-updating projections
- Comprehensive facility coverage

This integration provides robust bank facility obligation tracking within the comprehensive cashflow planning system. 