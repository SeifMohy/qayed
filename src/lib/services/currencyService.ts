import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface CurrencyConversion {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
  source: string;
}

export interface CurrencyRate {
  id: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  inverseRate: number;
  effectiveDate: string;
  source: string | null;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isBaseCurrency: boolean;
  decimalPlaces: number;
}

export class CurrencyService {
  private static baseCurrency = 'EGP';

  /**
   * Get all active currencies
   */
  static async getCurrencies(): Promise<Currency[]> {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: [
        { isBaseCurrency: 'desc' },
        { code: 'asc' }
      ],
    });

    return currencies.map(currency => ({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isActive: currency.isActive,
      isBaseCurrency: currency.isBaseCurrency,
      decimalPlaces: currency.decimalPlaces,
    }));
  }

  /**
   * Get the base currency (viewing currency)
   */
  static async getBaseCurrency(): Promise<Currency | null> {
    const baseCurrency = await prisma.currency.findFirst({
      where: { isBaseCurrency: true, isActive: true },
    });

    if (!baseCurrency) return null;

    return {
      id: baseCurrency.id,
      code: baseCurrency.code,
      name: baseCurrency.name,
      symbol: baseCurrency.symbol,
      isActive: baseCurrency.isActive,
      isBaseCurrency: baseCurrency.isBaseCurrency,
      decimalPlaces: baseCurrency.decimalPlaces,
    };
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string = CurrencyService.baseCurrency,
    date?: Date
  ): Promise<CurrencyConversion> {
    const effectiveDate = date || new Date();

    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        exchangeRate: 1,
        effectiveDate: effectiveDate.toISOString(),
        source: 'Same Currency',
      };
    }

    const amountDecimal = new Decimal(amount);

    // Find currencies
    const [fromCurrencyObj, toCurrencyObj] = await Promise.all([
      prisma.currency.findUnique({ where: { code: fromCurrency, isActive: true } }),
      prisma.currency.findUnique({ where: { code: toCurrency, isActive: true } }),
    ]);

    if (!fromCurrencyObj || !toCurrencyObj) {
      throw new Error(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    }

    // Try to find direct exchange rate
    let exchangeRate = await prisma.currencyRate.findFirst({
      where: {
        baseCurrencyId: fromCurrencyObj.id,
        targetCurrencyId: toCurrencyObj.id,
        effectiveDate: { lte: effectiveDate },
        isActive: true,
      },
      orderBy: { effectiveDate: 'desc' },
    });

    let rate: Decimal;
    let source: string;
    let usedEffectiveDate: Date;

    if (exchangeRate) {
      rate = exchangeRate.rate;
      source = exchangeRate.source || 'Database';
      usedEffectiveDate = exchangeRate.effectiveDate;
    } else {
      // Try inverse rate
      const inverseRate = await prisma.currencyRate.findFirst({
        where: {
          baseCurrencyId: toCurrencyObj.id,
          targetCurrencyId: fromCurrencyObj.id,
          effectiveDate: { lte: effectiveDate },
          isActive: true,
        },
        orderBy: { effectiveDate: 'desc' },
      });

      if (inverseRate) {
        rate = inverseRate.inverseRate;
        source = `${inverseRate.source || 'Database'} (Inverse)`;
        usedEffectiveDate = inverseRate.effectiveDate;
      } else {
        throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      }
    }

    const convertedAmount = amountDecimal.mul(rate);

    return {
      originalAmount: amount,
      convertedAmount: convertedAmount.toNumber(),
      fromCurrency,
      toCurrency,
      exchangeRate: rate.toNumber(),
      effectiveDate: usedEffectiveDate.toISOString(),
      source,
    };
  }

  /**
   * Convert multiple amounts to the base currency (EGP)
   */
  static async convertToBaseCurrency(
    amounts: { amount: number; currency: string }[],
    date?: Date
  ): Promise<{ [currency: string]: CurrencyConversion[] }> {
    const baseCurrency = await CurrencyService.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('No base currency found');
    }

    const conversions: { [currency: string]: CurrencyConversion[] } = {};

    for (const { amount, currency } of amounts) {
      if (!conversions[currency]) {
        conversions[currency] = [];
      }

      const conversion = await CurrencyService.convertCurrency(
        amount,
        currency,
        baseCurrency.code,
        date
      );
      conversions[currency].push(conversion);
    }

    return conversions;
  }

  /**
   * Format currency amount with proper symbol and decimal places
   */
  static async formatCurrency(
    amount: number,
    currencyCode: string,
    includeSymbol = true
  ): Promise<string> {
    const currency = await prisma.currency.findUnique({
      where: { code: currencyCode, isActive: true },
    });

    if (!currency) {
      return amount.toFixed(2);
    }

    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });

    if (includeSymbol) {
      return `${currency.symbol} ${formattedAmount}`;
    }

    return formattedAmount;
  }

  /**
   * Format amount in base currency (EGP)
   */
  static async formatInBaseCurrency(amount: number, includeSymbol = true): Promise<string> {
    const baseCurrency = await CurrencyService.getBaseCurrency();
    if (!baseCurrency) {
      return amount.toFixed(2);
    }

    return CurrencyService.formatCurrency(amount, baseCurrency.code, includeSymbol);
  }

  /**
   * Get latest exchange rates for a base currency
   */
  static async getExchangeRates(baseCurrency: string = CurrencyService.baseCurrency): Promise<CurrencyRate[]> {
    const baseCurrencyObj = await prisma.currency.findUnique({
      where: { code: baseCurrency, isActive: true },
    });

    if (!baseCurrencyObj) {
      throw new Error(`Base currency ${baseCurrency} not found`);
    }

    const rates = await prisma.currencyRate.findMany({
      where: {
        baseCurrencyId: baseCurrencyObj.id,
        isActive: true,
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
      orderBy: { effectiveDate: 'desc' },
    });

    // Group by target currency and take the most recent
    const latestRates = new Map();
    rates.forEach(rate => {
      if (!latestRates.has(rate.targetCurrencyId)) {
        latestRates.set(rate.targetCurrencyId, rate);
      }
    });

    return Array.from(latestRates.values()).map(rate => ({
      id: rate.id,
      baseCurrency: rate.baseCurrency.code,
      targetCurrency: rate.targetCurrency.code,
      rate: rate.rate.toNumber(),
      inverseRate: rate.inverseRate.toNumber(),
      effectiveDate: rate.effectiveDate.toISOString(),
      source: rate.source,
    }));
  }

  /**
   * Update exchange rate
   */
  static async updateExchangeRate(
    baseCurrency: string,
    targetCurrency: string,
    rate: number,
    source = 'Manual'
  ): Promise<CurrencyRate> {
    const [baseCurrencyObj, targetCurrencyObj] = await Promise.all([
      prisma.currency.findUnique({ where: { code: baseCurrency, isActive: true } }),
      prisma.currency.findUnique({ where: { code: targetCurrency, isActive: true } }),
    ]);

    if (!baseCurrencyObj || !targetCurrencyObj) {
      throw new Error(`Currency not found: ${baseCurrency} or ${targetCurrency}`);
    }

    const rateDecimal = new Decimal(rate);
    const inverseRate = new Decimal(1).div(rateDecimal);

    const newRate = await prisma.currencyRate.create({
      data: {
        baseCurrencyId: baseCurrencyObj.id,
        targetCurrencyId: targetCurrencyObj.id,
        rate: rateDecimal,
        inverseRate: inverseRate,
        effectiveDate: new Date(),
        source: source,
        isActive: true,
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    return {
      id: newRate.id,
      baseCurrency: newRate.baseCurrency.code,
      targetCurrency: newRate.targetCurrency.code,
      rate: newRate.rate.toNumber(),
      inverseRate: newRate.inverseRate.toNumber(),
      effectiveDate: newRate.effectiveDate.toISOString(),
      source: newRate.source,
    };
  }

  /**
   * Get currency by code
   */
  static async getCurrency(code: string): Promise<Currency | null> {
    const currency = await prisma.currency.findUnique({
      where: { code: code, isActive: true },
    });

    if (!currency) return null;

    return {
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isActive: currency.isActive,
      isBaseCurrency: currency.isBaseCurrency,
      decimalPlaces: currency.decimalPlaces,
    };
  }
} 