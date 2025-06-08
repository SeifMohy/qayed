# Centralized Cashflow Projection System

This document outlines the **centralized cashflow projection system** that unifies all cashflow projections into a single, reliable service. This system has replaced all legacy approaches to provide consistent, accurate, and efficient cashflow projections.

## Overview

The centralized system consolidates three types of cashflow projections:
1. **Recurring Payments** - Regular income/expense projections based on user-defined schedules
2. **Invoice Projections** - Payment expectations from uploaded invoices using actual payment terms
3. **Bank Obligations** - Facility projections and loan payments based on bank statement data

All projections are stored in the unified `CashflowProjection` table and managed by a single service.

## Architecture

### Core Components

1. **CentralizedCashflowProjectionService** (`src/lib/services/centralizedCashflowProjectionService.ts`)
   - Main service handling all projection types
   - Provides unified refresh, retrieval, and management methods
   - Ensures no duplicates and consistent data quality

2. **Centralized API Endpoints**
   - `POST /api/cashflow/projections/refresh` - Main refresh endpoint
   - `GET /api/cashflow/projections` - Retrieval with centralized service
   - All other APIs updated to use centralized approach

3. **Frontend Integration**
   - `CashflowOverview.tsx` - Updated to use centralized refresh
   - Consistent user experience with unified projection management

### System Flow

```
1. User clicks "Refresh Projections"
   ↓
2. POST /api/cashflow/projections/refresh
   ↓
3. CentralizedCashflowProjectionService.refreshAllProjections()
   ↓
4. Clears existing projections
   ↓
5. Generates all three types in parallel:
   - generateRecurringProjections()
   - generateInvoiceProjections()  
   - generateBankObligationProjections()
   ↓
6. Saves all projections in batches
   ↓
7. Returns comprehensive summary and verification
```

## Key Features

### 1. Unified Projection Management
- All projections stored in single `CashflowProjection` table
- Consistent data structure across all projection types
- Simplified querying and reporting

### 2. No Duplicates
- Clears existing projections before regenerating
- Prevents overlap between different projection sources
- Ensures data integrity

### 3. Proper Payment Terms
- Invoice projections use actual payment terms instead of 30-day fallback
- Handles partial payments correctly
- Respects customer vs supplier payment behavior

### 4. Accurate Bank Obligations
- Current facility positions projected based on tenor
- New disbursement projections based on facility details
- Monthly repayment schedules calculated properly

### 5. Comprehensive Verification
- Real-time validation of generated projections
- Type counts and source verification
- Quality assurance built into the refresh process

## API Reference

### POST /api/cashflow/projections/refresh
**Primary endpoint for refreshing all projections**

Request:
```json
{
  "startDate": "2024-06-30",
  "endDate": "2025-06-30",
  "forceRecalculate": true
}
```

Response:
```json
{
  "success": true,
  "summary": {
    "totalProjections": 53,
    "recurringPayments": 25,
    "invoiceProjections": 6,
    "bankObligations": 22,
    "dateRange": {
      "start": "2024-06-30T00:00:00.000Z",
      "end": "2025-06-30T00:00:00.000Z"
    }
  },
  "verification": {
    "actualProjectionCount": 53,
    "typeCounts": {
      "customerReceivables": 1,
      "supplierPayables": 5,
      "recurringInflows": 25,
      "recurringOutflows": 0,
      "bankObligations": 22,
      "loanPayments": 0
    }
  }
}
```

### GET /api/cashflow/projections
**Retrieves projections using the centralized service**

Parameters:
- `startDate` - Start date for projections
- `endDate` - End date for projections  
- `includeRelated` - Include related invoice/recurring payment details
- `type` - Filter by projection type
- `status` - Filter by projection status

Response includes metadata confirming centralized service usage:
```json
{
  "success": true,
  "projections": [...],
  "metadata": {
    "usedCentralizedService": true,
    "typeCounts": {...}
  }
}
```

## Benefits

### 1. Reliability
- Eliminates missing projections from inconsistent legacy services
- Single source of truth for all cashflow data
- Comprehensive error handling and logging

### 2. Performance
- Parallel processing of all projection types
- Batch operations for database efficiency
- Optimized queries with proper indexing

### 3. Accuracy
- Proper payment terms calculation for invoices
- Realistic bank obligation projections based on actual tenor
- Correct recurring payment scheduling

### 4. Maintainability
- Single service to maintain instead of multiple scattered services
- Consistent code patterns and error handling
- Unified testing approach

### 5. User Experience
- Fast and reliable projection refresh
- Consistent behavior across all projection types
- Clear feedback and verification data

## Configuration

### Environment Variables
No additional environment variables required - uses existing database and service configurations.

### Date Ranges
- Default projection period: 12 months from base date (2024-06-30)
- Customizable via API parameters
- Smart date handling for edge cases

## Testing

### Automated Test Script
Run the comprehensive test script:
```bash
node test-centralized-cashflow.js
```

This verifies:
- Projection refresh functionality
- Data integrity and no duplicates
- All projection types are generated correctly
- Date range filtering works properly
- API responses are consistent

### Manual Testing
1. Navigate to `/dashboard/cashflow`
2. Click "Refresh Projections" button
3. Verify projections are generated quickly and completely
4. Check different date ranges work correctly
5. Verify recurring payments, invoices, and bank obligations all appear

## Troubleshooting

### Common Issues

**No projections generated:**
- Check that active recurring payments exist
- Verify invoices have proper payment terms
- Ensure bank obligations have valid tenor data
- Review console logs for specific errors

**Projection count mismatches:**
- Check the verification data in API response
- Look for database constraints preventing saves
- Verify date range parameters are correct

**Performance issues:**
- Monitor database query performance
- Check for large datasets requiring batch optimization
- Review parallel processing efficiency

### Logging
The system provides comprehensive logging:
- Projection generation progress
- Type-specific counts and verification
- Error details with context
- Performance timing information

## Future Enhancements

1. **Real-time Updates**: Implement webhook-based projection updates when source data changes
2. **Advanced Filtering**: Add more sophisticated filtering and search capabilities
3. **Projection Confidence**: Enhanced confidence scoring based on historical accuracy
4. **Automated Reconciliation**: Compare projected vs actual cashflows for accuracy improvement

## Migration Notes

**Previous System Removed**: All legacy projection generation has been removed. The system now uses only the centralized approach, providing:
- Simplified codebase with no backward compatibility complexity
- Consistent behavior across all use cases
- Improved reliability and maintainability
- Faster development and testing cycles

The centralized system is production-ready and provides all functionality previously available through multiple services in a unified, reliable manner. 