# Egyptian Banks Integration

## Overview

This document describes the Egyptian banks integration feature that provides a predefined list of Egyptian banks for bank statement annotation and automatic LLM classification.

## Features

### 1. Predefined Egyptian Banks List

The system now includes a comprehensive list of 32 Egyptian banks with their full names and abbreviations:

- Banque Misr (BM)
- National Bank of Egypt (NBE)
- Egyptian Arab Land Bank (EALB)
- Agricultural Bank of Egypt (ABE)
- Industrial Development Bank of Egypt (IDB)
- Banque du Caire (BC)
- The United Bank (UB)
- Bank of Alexandria (AlexBank)
- MIDBank (MIDBank)
- Commercial International Bank (CIB)
- Attijariwafa Bank Egypt (AWB Egypt)
- Société Arabe Internationale de Banque (SAIB)
- Crédit Agricole Egypt (CAE)
- Emirates National Bank of Dubai - Egypt (Emirates NBD)
- Suez Canal Bank (SCB)
- QNB Al Ahli (QNB)
- Bank NXT (Bank NXT)
- Al Ahli Bank of Kuwait (ABK)
- First Abu Dhabi Bank (FAB)
- Kuwait Finance House (KFH)
- Faisal Islamic Bank of Egypt (FIBE)
- Housing and Development Bank (HDB)
- Al Baraka Bank Egypt (Al Baraka)
- National Bank of Kuwait (NBK)
- Abu Dhabi Islamic Bank (ADIB)
- Abu Dhabi Commercial Bank (ADCB)
- Egyptian Gulf Bank (EG Bank)
- Arab African International Bank (AAIB)
- HSBC Bank Egypt (HSBC)
- Arab Banking Corporation - Egypt (Bank ABC)
- Export Development Bank of Egypt (E-Bank)
- Arab International Bank (AIB)

### 2. Enhanced Annotation Interface

The bank statement annotation form now includes:

- **Egyptian Banks Dropdown**: A dropdown menu with all predefined Egyptian banks
- **Custom Bank Name Input**: A text input for banks not in the predefined list
- **Smart Switching**: Selecting from the dropdown clears custom input and vice versa
- **Visual Feedback**: Clear indication of which bank is currently selected

### 3. LLM Integration

The bank statement structuring API now:

- Provides the Egyptian banks list to the LLM during processing
- Instructs the LLM to match extracted bank names to the predefined list when possible
- Falls back to the exact extracted text if no match is found
- Applies additional matching logic after LLM processing for consistency

### 4. Automatic Bank Name Matching

The system includes intelligent bank name matching that:

- Recognizes various bank name formats (full names, abbreviations, variations)
- Handles Arabic and English bank names
- Maps common abbreviations to full bank names
- Maintains consistency across all bank statement processing

## Implementation Details

### File Locations

1. **Constants**: `src/lib/constants.ts`
   - Contains the `EGYPTIAN_BANKS` mapping
   - Provides helper functions for bank name matching and validation

2. **Annotation Form**: `src/components/annotation/StatementMetadataForm.tsx`
   - Updated to include Egyptian banks dropdown and custom input
   - Handles bank name selection logic

3. **API Integration**: `src/app/api/structure-bankstatement/route.ts`
   - Updated LLM prompt to include Egyptian banks list
   - Added automatic bank name matching after LLM processing

### Key Functions

- `findEgyptianBankDisplayName(bankName: string)`: Finds the correct Egyptian bank display name from various input formats
- `isEgyptianBank(bankName: string)`: Checks if a bank name matches any Egyptian bank
- `getEgyptianBankDisplayName(bankKey: EgyptianBankKey)`: Gets display name from bank key

## Usage

### For Users (Manual Annotation)

1. Navigate to the bank statement annotation page
2. In the "Bank Name" section:
   - Select from the Egyptian banks dropdown if the bank is in the list
   - OR enter a custom bank name if not in the list
3. The form will automatically populate the `bankName` field based on your selection

### For LLM Processing (Automatic)

The LLM will automatically:
1. Receive the Egyptian banks list in its prompt
2. Attempt to match extracted bank names to the predefined list
3. Use exact matches when found
4. Fall back to extracted text when no match is possible

### Fallback Behavior

If the LLM cannot determine the bank name:
1. The system uses the filename as a placeholder
2. Users can manually annotate the correct bank through the interface
3. The bank name can be updated to use the Egyptian banks dropdown

## Benefits

1. **Consistency**: Standardized bank names across all statements
2. **Accuracy**: Reduced manual typing errors and variations
3. **Efficiency**: Faster annotation with dropdown selection
4. **Flexibility**: Still supports custom bank names for edge cases
5. **Intelligence**: Automatic matching of various bank name formats

## Future Enhancements

- Support for additional regional bank lists
- Integration with external bank databases
- Enhanced fuzzy matching algorithms
- Multi-language bank name support 