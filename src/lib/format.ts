/**
 * Utility functions for data formatting
 */

/**
 * Parse a string to a number
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Format a number as currency (sync version for client components)
 */
export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a number as currency with custom symbol
 */
export function formatCurrencyWithSymbol(value: number, symbol = '$', decimalPlaces = 2): string {
  const formattedAmount = value.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return `${symbol} ${formattedAmount}`;
}

/**
 * Format amount in EGP (Egyptian Pound)
 */
export function formatEGP(value: number, includeSymbol = true): string {
  const formattedAmount = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (includeSymbol) {
    return `£E ${formattedAmount}`;
  }
  return formattedAmount;
}

/**
 * Format currency amount with proper symbol based on currency code
 */
export function formatCurrencyByCode(amount: number, currencyCode: string, includeSymbol = true): string {
  const symbols: Record<string, string> = {
    'EGP': '£E',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CNY': '¥',
  };

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (includeSymbol && symbols[currencyCode]) {
    return `${symbols[currencyCode]} ${formattedAmount}`;
  }

  return includeSymbol ? `${currencyCode} ${formattedAmount}` : formattedAmount;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format a file size in bytes to a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Helper function for server-side currency conversion and formatting
 * This should only be used in server components or API routes
 */
export async function convertAndFormatCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency = 'EGP'
): Promise<string> {
  try {
    // This would typically call the conversion API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/currency/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, fromCurrency, toCurrency }),
    });

    const data = await response.json();
    
    if (data.success) {
      return formatCurrencyByCode(data.conversion.convertedAmount, toCurrency);
    } else {
      // Fallback to original amount
      return formatCurrencyByCode(amount, fromCurrency);
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback to original amount
    return formatCurrencyByCode(amount, fromCurrency);
  }
}

/**
 * Format currency amount for key cards - no decimal places, compact format for large numbers
 */
export function formatCurrencyForKeyCard(value: number, currency = 'EGP'): string {
  const symbols: Record<string, string> = {
    'EGP': '£E',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CNY': '¥',
  };

  const symbol = symbols[currency] || currency;
  
  // For very large numbers, use compact notation
  if (Math.abs(value) >= 1000000000) {
    return `${symbol} ${(value / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(value) >= 1000000) {
    return `${symbol} ${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${symbol} ${(value / 1000).toFixed(0)}K`;
  }
  
  // For smaller numbers, format without decimals
  return `${symbol} ${Math.round(value).toLocaleString('en-US')}`;
}

/**
 * Format EGP amount for key cards - no decimal places, compact format for large numbers
 */
export function formatEGPForKeyCard(value: number): string {
  return formatCurrencyForKeyCard(value, 'EGP');
} 