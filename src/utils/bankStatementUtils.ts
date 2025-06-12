/**
 * Utility functions for bank statement processing and facility account determination
 */

/**
 * Simplified account types for the application
 */
export const ACCOUNT_TYPES = [
  'Current Account',
  'Facility Account',
] as const;

export type AccountType = typeof ACCOUNT_TYPES[number];

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
    
    // Check for exact match with Facility Account
    if (normalizedType === 'Facility Account') {
      return true;
    }
    
    // Check for exact match with Current Account
    if (normalizedType === 'Current Account') {
      return false;
    }
    
    // Legacy support: Check for facility-related keywords in account type
    const facilityKeywords = [
      'overdraft', 'loan', 'credit', 'facility', 'line of credit', 'term loan'
    ];
    
    const lowerType = normalizedType.toLowerCase();
    const isFacilityType = facilityKeywords.some(keyword => 
      lowerType.includes(keyword)
    );
    
    if (isFacilityType) {
      return true;
    }
  }
  
  // Fallback determination: Use negative balance as backup only if no account type detected
  // This maintains backward compatibility for untyped accounts
  return endingBalance < 0;
}

/**
 * Gets the display name for a facility type
 * @param accountType - The account type
 * @param endingBalance - The ending balance (for fallback cases)
 * @returns A user-friendly facility type name
 */
export function getFacilityDisplayType(accountType: string | null | undefined, endingBalance: number): string {
  if (isFacilityAccount(accountType, endingBalance)) {
    return accountType && accountType.trim() ? accountType.trim() : 'Facility Account';
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