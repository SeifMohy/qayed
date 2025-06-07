/**
 * Utility functions for bank statement processing and facility account determination
 */

/**
 * Facility account types that indicate credit facilities
 */
export const FACILITY_ACCOUNT_TYPES = [
  'Overdraft',
  'Short-term Loans (STL)',
  'Long-term Loans (LTL)',
  'Credit Facility',
  'Credit Line',
  'Line of Credit',
  'Term Loan',
  'Credit',
] as const;

/**
 * Regular account types (non-facility accounts)
 */
export const REGULAR_ACCOUNT_TYPES = [
  'Checking',
  'Savings', 
  'Business',
  'Current Account',
  'Deposit Account',
] as const;

/**
 * All supported account types for annotation
 */
export const ALL_ACCOUNT_TYPES = [
  ...REGULAR_ACCOUNT_TYPES,
  ...FACILITY_ACCOUNT_TYPES,
  'Other',
] as const;

export type AccountType = typeof ALL_ACCOUNT_TYPES[number];

/**
 * Determines if an account is a facility account based on account type and balance
 * @param accountType - The extracted/annotated account type
 * @param endingBalance - The account's ending balance
 * @returns true if the account should be treated as a facility
 */
export function isFacilityAccount(accountType: string | null | undefined, endingBalance: number): boolean {
  // Primary determination: Check if account type indicates a facility
  if (accountType) {
    const normalizedType = accountType.trim();
    
    // Check for exact matches or partial matches for facility types
    const isFacilityType = FACILITY_ACCOUNT_TYPES.some(facilityType => 
      normalizedType === facilityType || 
      normalizedType.toLowerCase().includes(facilityType.toLowerCase()) ||
      facilityType.toLowerCase().includes(normalizedType.toLowerCase())
    );
    
    if (isFacilityType) {
      return true;
    }
    
    // Check for regular account types - these should NOT be treated as facilities even with negative balance
    const isRegularType = REGULAR_ACCOUNT_TYPES.some(regularType =>
      normalizedType === regularType ||
      normalizedType.toLowerCase().includes(regularType.toLowerCase()) ||
      regularType.toLowerCase().includes(normalizedType.toLowerCase())
    );
    
    if (isRegularType) {
      return false; // Regular accounts are not facilities, even with negative balance
    }
  }
  
  // Fallback determination: Use negative balance as backup if no account type detected
  // This maintains backward compatibility
  return endingBalance < 0;
}

/**
 * Gets the display name for a facility type
 * @param accountType - The account type
 * @param endingBalance - The ending balance (for fallback cases)
 * @returns A user-friendly facility type name
 */
export function getFacilityDisplayType(accountType: string | null | undefined, endingBalance: number): string {
  if (accountType && accountType.trim()) {
    const normalizedType = accountType.trim();
    
    // Return the account type if it's a known facility type
    if (FACILITY_ACCOUNT_TYPES.some(facilityType => 
      normalizedType === facilityType || 
      normalizedType.toLowerCase().includes(facilityType.toLowerCase())
    )) {
      return normalizedType;
    }
  }
  
  // Fallback for negative balance accounts without clear type
  if (endingBalance < 0) {
    return 'Credit Facility';
  }
  
  return 'N/A';
}

/**
 * Determines if an account should be classified as a regular account (not a facility)
 * @param accountType - The extracted/annotated account type
 * @param endingBalance - The account's ending balance
 * @returns true if the account should be treated as a regular account
 */
export function isRegularAccount(accountType: string | null | undefined, endingBalance: number): boolean {
  return !isFacilityAccount(accountType, endingBalance);
} 