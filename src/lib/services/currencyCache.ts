interface CachedRates {
  [currency: string]: number;
}

interface CurrencyRateDetails {
  rate: number;
  inverseRate: number;
  effectiveDate: string;
  source: string;
}

interface CachedRateData {
  rates: CachedRates;
  rateDetails: { [currency: string]: CurrencyRateDetails };
  baseCurrency: string;
  effectiveDate: string;
  cachedAt: number;
}

class CurrencyCache {
  private cache: CachedRateData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private fetchPromise: Promise<CachedRateData> | null = null;

  /**
   * Fetch all exchange rates from the bulk API endpoint
   */
  private async fetchRates(currencies?: string[], baseCurrency = 'EGP'): Promise<CachedRateData> {
    try {
      const url = new URL('/api/currency/rates-bulk', window.location.origin);
      if (currencies && currencies.length > 0) {
        url.searchParams.set('currencies', currencies.join(','));
      }
      if (baseCurrency !== 'EGP') {
        url.searchParams.set('base', baseCurrency);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch currency rates');
      }

      return {
        rates: data.rates,
        rateDetails: data.rateDetails,
        baseCurrency: data.baseCurrency,
        effectiveDate: data.effectiveDate,
        cachedAt: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
      throw error;
    }
  }

  /**
   * Get cached rates or fetch them if cache is stale/empty
   */
  private async getRates(currencies?: string[], baseCurrency = 'EGP'): Promise<CachedRateData> {
    const now = Date.now();
    
    // Check if cache is valid
    if (this.cache && 
        this.cache.baseCurrency === baseCurrency &&
        (now - this.cache.cachedAt) < this.CACHE_DURATION) {
      
      // Check if we have all requested currencies in cache
      if (!currencies || currencies.every(currency => 
        currency === baseCurrency || this.cache!.rates.hasOwnProperty(currency)
      )) {
        return this.cache;
      }
    }

    // Avoid multiple concurrent requests
    if (this.fetchPromise) {
      return await this.fetchPromise;
    }

    // Fetch new rates
    this.fetchPromise = this.fetchRates(currencies, baseCurrency);
    
    try {
      this.cache = await this.fetchPromise;
      return this.cache;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Convert amount from one currency to another using cached rates
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency = 'EGP'
  ): Promise<{
    originalAmount: number;
    convertedAmount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    effectiveDate: string;
    source: string;
  }> {
    // Same currency - no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        exchangeRate: 1,
        effectiveDate: new Date().toISOString(),
        source: 'Same Currency',
      };
    }

    try {
      // Get rates from cache
      const rateData = await this.getRates([fromCurrency, toCurrency], 'EGP');
      
      let exchangeRate: number;
      let source: string;

      if (toCurrency === 'EGP') {
        // Converting to EGP (base currency)
        if (!rateData.rates[fromCurrency]) {
          throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
        exchangeRate = rateData.rates[fromCurrency];
        source = rateData.rateDetails[fromCurrency]?.source || 'Database';
      } else if (fromCurrency === 'EGP') {
        // Converting from EGP (base currency)
        if (!rateData.rates[toCurrency]) {
          throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
        exchangeRate = 1 / rateData.rates[toCurrency]; // Inverse rate
        source = rateData.rateDetails[toCurrency]?.source || 'Database';
      } else {
        // Cross conversion through EGP
        if (!rateData.rates[fromCurrency] || !rateData.rates[toCurrency]) {
          throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
        exchangeRate = rateData.rates[fromCurrency] / rateData.rates[toCurrency];
        source = 'Cross-rate via EGP';
      }

      const convertedAmount = amount * exchangeRate;

      return {
        originalAmount: amount,
        convertedAmount,
        fromCurrency,
        toCurrency,
        exchangeRate,
        effectiveDate: rateData.effectiveDate,
        source,
      };
    } catch (error) {
      console.error('Currency conversion error:', error);
      
      // Fallback to default rates as in the original implementation
      const defaultRates: Record<string, number> = {
        'USD': 50,
        'EUR': 52.63,
        'GBP': 62.5,
        'CNY': 6.9
      };

      let fallbackRate = 1;
      if (toCurrency === 'EGP' && defaultRates[fromCurrency]) {
        fallbackRate = defaultRates[fromCurrency];
      } else if (fromCurrency === 'EGP' && defaultRates[toCurrency]) {
        fallbackRate = 1 / defaultRates[toCurrency];
      } else if (defaultRates[fromCurrency] && defaultRates[toCurrency]) {
        fallbackRate = defaultRates[fromCurrency] / defaultRates[toCurrency];
      }

      const convertedAmount = amount * fallbackRate;

      return {
        originalAmount: amount,
        convertedAmount,
        fromCurrency,
        toCurrency,
        exchangeRate: fallbackRate,
        effectiveDate: new Date().toISOString(),
        source: 'Fallback Rate',
      };
    }
  }

  /**
   * Preload rates for specific currencies to warm up the cache
   */
  async preloadRates(currencies: string[], baseCurrency = 'EGP'): Promise<void> {
    try {
      await this.getRates(currencies, baseCurrency);
    } catch (error) {
      console.error('Failed to preload currency rates:', error);
    }
  }

  /**
   * Clear the cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = null;
    this.fetchPromise = null;
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): {
    isCached: boolean;
    cacheAge: number;
    baseCurrency: string | null;
    availableCurrencies: string[];
  } {
    if (!this.cache) {
      return {
        isCached: false,
        cacheAge: 0,
        baseCurrency: null,
        availableCurrencies: [],
      };
    }

    return {
      isCached: true,
      cacheAge: Date.now() - this.cache.cachedAt,
      baseCurrency: this.cache.baseCurrency,
      availableCurrencies: Object.keys(this.cache.rates),
    };
  }
}

// Export a singleton instance
export const currencyCache = new CurrencyCache();

// Export the class for testing purposes
export { CurrencyCache }; 