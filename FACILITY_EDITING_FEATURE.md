# Facility Editing Feature

## Overview

Added comprehensive editing functionality for credit facilities in the Banks section. Users can now edit facility-specific information directly from the facility tables, including tenor, available limit, and interest rate. These fields are stored in the database and displayed across all relevant facility views.

## Recent Updates

### ✅ **Enhanced Display Formatting (Latest)**
Added automatic formatting for better readability:
- **Interest Rate**: Automatically appends "%" to numeric values (e.g., "12" → "12%")
- **Tenor**: Automatically appends "days" to numeric values (e.g., "12" → "12 days")
- **Smart Logic**: Preserves existing formatting for complex rates like "Prime + 2%" or "5.25%" or terms like "2 years"

## Key Features

### 1. **New Database Fields**
Added three new optional fields to the `BankStatement` model for facility accounts:
- **`tenor`** (String): Duration/term of the facility (e.g., "12 months", "2 years")
- **`availableLimit`** (Decimal): Total credit limit available 
- **`interestRate`** (String): Interest rate information (e.g., "5.25%", "Prime + 2%")

### 2. **Inline Editing Interface**
- **Edit button**: Pencil icon in each facility row
- **Inline forms**: Fields become editable inputs when editing
- **Save/Cancel**: Clear action buttons during edit mode
- **Real-time updates**: Changes reflect immediately after saving

### 3. **Enhanced Data Display**
- **Available calculation**: Automatically calculates available credit (limit - used)
- **Smart formatting**: Currency formatting for limits and balances
- **Auto-formatting**: Interest rates show "%" and tenors show "days" when appropriate
- **Comprehensive views**: New fields displayed in both main banks page and detailed bank profile

## Display Formatting Logic

### Interest Rate Formatting
```typescript
const formatInterestRate = (rate: string | null): string => {
  if (!rate || rate.trim() === '') return 'N/A';
  const cleanRate = rate.trim();
  
  // Preserve complex rates that already have symbols
  if (cleanRate.includes('%') || cleanRate.includes('+') || 
      cleanRate.toLowerCase().includes('prime') || 
      cleanRate.toLowerCase().includes('libor') || 
      cleanRate.toLowerCase().includes('variable')) {
    return cleanRate;
  }
  
  // Add % to simple numeric values
  if (!isNaN(parseFloat(cleanRate))) {
    return `${cleanRate}%`;
  }
  
  return cleanRate;
};
```

### Tenor Formatting
```typescript
const formatTenor = (tenor: string | null): string => {
  if (!tenor || tenor.trim() === '') return 'N/A';
  const cleanTenor = tenor.trim();
  
  // Preserve complex terms that already have time units
  if (cleanTenor.toLowerCase().includes('day') || 
      cleanTenor.toLowerCase().includes('month') || 
      cleanTenor.toLowerCase().includes('year') || 
      cleanTenor.toLowerCase().includes('week') ||
      cleanTenor.toLowerCase().includes('revolving')) {
    return cleanTenor;
  }
  
  // Add 'days' to simple numeric values
  if (!isNaN(parseFloat(cleanTenor))) {
    return `${cleanTenor} days`;
  }
  
  return cleanTenor;
};
```

### Formatting Examples

#### Interest Rate Examples:
- **Input**: "12" → **Display**: "12%"
- **Input**: "5.25" → **Display**: "5.25%"
- **Input**: "Prime + 2%" → **Display**: "Prime + 2%" (preserved)
- **Input**: "LIBOR + 3.5%" → **Display**: "LIBOR + 3.5%" (preserved)
- **Input**: "Variable" → **Display**: "Variable" (preserved)

#### Tenor Examples:
- **Input**: "12" → **Display**: "12 days"
- **Input**: "90" → **Display**: "90 days"
- **Input**: "2 years" → **Display**: "2 years" (preserved)
- **Input**: "12 months" → **Display**: "12 months" (preserved)
- **Input**: "Revolving" → **Display**: "Revolving" (preserved)

## Database Schema Changes

### Migration: `add_facility_fields_to_bank_statement`
```sql
ALTER TABLE "BankStatement" ADD COLUMN "tenor" TEXT;
ALTER TABLE "BankStatement" ADD COLUMN "availableLimit" DECIMAL(65,30);
ALTER TABLE "BankStatement" ADD COLUMN "interestRate" TEXT;
```

### Updated Prisma Model
```prisma
model BankStatement {
  // ... existing fields
  
  // Facility-specific fields
  tenor                String?           // e.g., "12 months", "2 years", etc.
  availableLimit       Decimal?          // Total available credit limit
  interestRate         String?           // e.g., "5.25%", "Prime + 2%", etc.
  
  // ... relationships
}
```

## API Enhancements

### Updated Annotation API (`/api/annotation/statements/[id]`)
**New Parameters Supported:**
- `tenor`: String field for facility duration
- `availableLimit`: Decimal field for credit limit (automatically converted)
- `interestRate`: String field for interest rate information

**Request Example:**
```json
{
  "tenor": "24 months",
  "availableLimit": 1000000.00,
  "interestRate": "5.25%"
}
```

## UI/UX Improvements

### Facilities Table (Bank Profile Page)
- **New columns**: Added "Tenor" column, updated "Available" to "Available Limit"
- **Edit functionality**: Each row has edit button for facility accounts
- **Inline editing**: Fields become input fields during edit mode
- **Input validation**: Proper input types (number for limit, text for others)
- **Visual feedback**: Clear edit/save/cancel states

### Main Banks Page
- **Updated display**: Credit facilities table shows new fields
- **Consistent data**: Same facility information across all views
- **Smart calculations**: Available credit automatically calculated

### Edit Experience
1. **Click edit button** → Row enters edit mode
2. **Modify fields** → Real-time input validation
3. **Save changes** → API call updates database
4. **Auto-refresh** → Table updates with new data
5. **Cancel option** → Revert changes without saving

## Field Details

### 1. **Tenor Field**
- **Type**: Text (String)
- **Purpose**: Facility duration/term
- **Examples**: "12 months", "2 years", "Revolving", "5 year term"
- **Validation**: Free text, no specific format required
- **Display**: Shows as-is in all facility tables

### 2. **Available Limit Field**  
- **Type**: Decimal (Number)
- **Purpose**: Total credit limit available
- **Examples**: 1000000.00, 500000.50
- **Validation**: Must be valid decimal number
- **Display**: Formatted as currency in facility tables
- **Calculation**: Available = Limit - Used Amount

### 3. **Interest Rate Field**
- **Type**: Text (String)  
- **Purpose**: Interest rate information
- **Examples**: "5.25%", "Prime + 2%", "Variable", "LIBOR + 3.5%"
- **Validation**: Free text to accommodate various rate structures
- **Display**: Shows as-is in facility tables

## Code Architecture

### Type Definitions
```typescript
// Updated BankStatement type
type BankStatement = {
  // ... existing fields
  tenor: string | null;
  availableLimit: string | null;
  interestRate: string | null;
}

// Updated FacilityDisplay type
type FacilityDisplay = {
  id: number;
  facilityType: string;
  limit: string;           // Shows availableLimit if set
  used: string;
  available: string;       // Calculated from limit - used
  interestRate: string;
  tenor: string;
  statementId: number;     // For linking to bank statement
}

// Edit modal data type
type EditFacilityData = {
  tenor: string;
  availableLimit: string;
  interestRate: string;
}
```

### Key Functions
- **`handleEditFacility()`**: Initiates edit mode for a facility
- **`handleSaveFacility()`**: Saves changes and refreshes data
- **`handleCancelEdit()`**: Cancels editing without saving
- **`processFacilitiesData()`**: Enhanced to include new fields and calculations

## User Workflow

### Editing a Facility
1. **Navigate** to Banks > [Bank Name] > Facilities tab
2. **Identify** the facility to edit in the table
3. **Click** the pencil (edit) icon in the Actions column
4. **Modify** any of the editable fields:
   - Available Limit (number input)
   - Interest Rate (text input)  
   - Tenor (text input)
5. **Save** changes or **Cancel** to revert
6. **Verify** updates appear immediately in the table

### Viewing Updated Information
- **Bank Profile**: Facilities tab shows all facility details
- **Main Banks Page**: Credit facilities section shows summary
- **Calculations**: Available credit automatically updates based on limit

## Benefits

### 1. **Data Completeness**
- Store comprehensive facility information beyond just balances
- Track important commercial terms (rates, tenors, limits)
- Maintain facility-specific details for better analysis

### 2. **User Experience**
- **Quick edits**: No need for separate edit pages or modals
- **Immediate feedback**: Changes appear instantly
- **Intuitive interface**: Clear edit states and actions

### 3. **Business Value**
- **Better facility management**: Track limits, terms, and rates
- **Accurate reporting**: Show true available credit vs. used amounts
- **Commercial insights**: Understand facility structures and terms

### 4. **Data Accuracy**
- **Separate concerns**: Distinguish between account balance and facility terms
- **Proper calculations**: Available = Limit - Used, not just balance-based
- **Flexible data**: Support various rate structures and term formats

## Future Enhancements

### Potential Additions
1. **Facility expiry dates**: Add date tracking for facility renewal
2. **Usage alerts**: Notify when approaching credit limits
3. **Rate comparisons**: Compare rates across facilities and institutions
4. **Historical tracking**: Track changes to facility terms over time
5. **Bulk editing**: Edit multiple facilities simultaneously
6. **Validation rules**: Add business rule validation for facility terms
7. **Integration**: Connect with facility agreements and documents

### Technical Improvements
1. **Field validation**: Add client-side and server-side validation
2. **Audit logging**: Track who made what changes when
3. **Permissions**: Control who can edit facility information
4. **Backup/restore**: Handle edit conflicts and data recovery

## Testing

### Successful Test Cases
- ✅ Database migration executed successfully
- ✅ API handles new fields correctly
- ✅ UI displays edit functionality properly
- ✅ Inline editing works as expected
- ✅ Data persists after saving
- ✅ Cancel functionality works properly
- ✅ Available credit calculates correctly
- ✅ Currency formatting displays properly
- ✅ Build compiles without errors

### Edge Cases Handled
- **Null values**: Fields gracefully handle empty/null values
- **Invalid input**: Proper error handling for invalid numbers
- **Concurrent edits**: Basic conflict resolution
- **Network errors**: Error messaging for failed saves

This feature significantly enhances the facility management capabilities while maintaining the existing facility determination logic and providing a smooth user experience for managing credit facility information. 