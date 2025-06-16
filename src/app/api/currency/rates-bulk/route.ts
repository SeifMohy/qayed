import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/currency/rates-bulk - Get exchange rates for multiple currencies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const currenciesParam = searchParams.get('currencies');
    const baseCurrency = searchParams.get('base') || 'EGP';
    const date = searchParams.get('date');

    // Parse currencies parameter (comma-separated list)
    let currencies: string[] = [];
    if (currenciesParam) {
      currencies = currenciesParam.split(',').map(c => c.trim()).filter(c => c);
    }

    // Parse date parameter
    let effectiveDate: Date;
    if (date) {
      effectiveDate = new Date(date);
      if (isNaN(effectiveDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD format.' },
          { status: 400 }
        );
      }
    } else {
      effectiveDate = new Date();
    }

    // Find the base currency
    const baseCurrencyObj = await prisma.currency.findUnique({
      where: { code: baseCurrency, isActive: true },
    });

    if (!baseCurrencyObj) {
      return NextResponse.json(
        { success: false, error: 'Base currency not found or inactive.' },
        { status: 404 }
      );
    }

    const rates: { [key: string]: number } = {};
    const rateDetails: { [key: string]: any } = {};

    // If no specific currencies requested, get all available rates
    if (currencies.length === 0) {
      const allRates = await prisma.currencyRate.findMany({
        where: {
          baseCurrencyId: baseCurrencyObj.id,
          effectiveDate: { lte: effectiveDate },
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
      allRates.forEach(rate => {
        if (!latestRates.has(rate.targetCurrencyId)) {
          latestRates.set(rate.targetCurrencyId, rate);
        }
      });

      // Process all rates
      for (const rate of latestRates.values()) {
        rates[rate.targetCurrency.code] = rate.rate.toNumber();
        rateDetails[rate.targetCurrency.code] = {
          rate: rate.rate.toNumber(),
          inverseRate: rate.inverseRate.toNumber(),
          effectiveDate: rate.effectiveDate.toISOString(),
          source: rate.source,
        };
      }
    } else {
      // Process specific currencies
      for (const currencyCode of currencies) {
        // Skip if it's the same as base currency
        if (currencyCode === baseCurrency) {
          rates[currencyCode] = 1;
          rateDetails[currencyCode] = {
            rate: 1,
            inverseRate: 1,
            effectiveDate: effectiveDate.toISOString(),
            source: 'Same Currency',
          };
          continue;
        }

        // Find target currency
        const targetCurrencyObj = await prisma.currency.findUnique({
          where: { code: currencyCode, isActive: true },
        });

        if (!targetCurrencyObj) {
          console.warn(`Currency not found: ${currencyCode}`);
          continue;
        }

        // Try to find direct exchange rate
        let exchangeRate = await prisma.currencyRate.findFirst({
          where: {
            baseCurrencyId: baseCurrencyObj.id,
            targetCurrencyId: targetCurrencyObj.id,
            effectiveDate: { lte: effectiveDate },
            isActive: true,
          },
          orderBy: { effectiveDate: 'desc' },
          include: {
            baseCurrency: true,
            targetCurrency: true,
          },
        });

        let rate: Decimal;
        let source: string;
        let usedEffectiveDate: Date;

        if (exchangeRate) {
          // Direct rate found
          rate = exchangeRate.rate;
          source = exchangeRate.source || 'Database';
          usedEffectiveDate = exchangeRate.effectiveDate;
        } else {
          // Try inverse rate (target to base)
          const inverseRate = await prisma.currencyRate.findFirst({
            where: {
              baseCurrencyId: targetCurrencyObj.id,
              targetCurrencyId: baseCurrencyObj.id,
              effectiveDate: { lte: effectiveDate },
              isActive: true,
            },
            orderBy: { effectiveDate: 'desc' },
            include: {
              baseCurrency: true,
              targetCurrency: true,
            },
          });

          if (inverseRate) {
            // Use inverse rate
            rate = inverseRate.inverseRate;
            source = `${inverseRate.source || 'Database'} (Inverse)`;
            usedEffectiveDate = inverseRate.effectiveDate;
          } else {
            // Try cross-rate through base currency (EGP)
            const allBaseCurrency = await prisma.currency.findFirst({
              where: { isBaseCurrency: true, isActive: true },
            });

            if (!allBaseCurrency) {
              console.warn(`No base currency found for cross-rate calculation`);
              continue;
            }

            // Get rate from source currency to base currency
            const fromToBase = await prisma.currencyRate.findFirst({
              where: {
                baseCurrencyId: targetCurrencyObj.id,
                targetCurrencyId: allBaseCurrency.id,
                effectiveDate: { lte: effectiveDate },
                isActive: true,
              },
              orderBy: { effectiveDate: 'desc' },
            });

            // Get rate from base currency to target currency  
            const baseToTarget = await prisma.currencyRate.findFirst({
              where: {
                baseCurrencyId: allBaseCurrency.id,
                targetCurrencyId: baseCurrencyObj.id,
                effectiveDate: { lte: effectiveDate },
                isActive: true,
              },
              orderBy: { effectiveDate: 'desc' },
            });

            if (fromToBase && baseToTarget) {
              // Calculate cross rate
              rate = fromToBase.rate.mul(baseToTarget.rate);
              source = `Cross-rate via ${allBaseCurrency.code}`;
              usedEffectiveDate = new Date(Math.max(fromToBase.effectiveDate.getTime(), baseToTarget.effectiveDate.getTime()));
            } else {
              console.warn(`No exchange rate found for ${currencyCode} to ${baseCurrency}`);
              continue;
            }
          }
        }

        rates[currencyCode] = rate.toNumber();
        rateDetails[currencyCode] = {
          rate: rate.toNumber(),
          inverseRate: rate.toNumber() > 0 ? 1 / rate.toNumber() : 0,
          effectiveDate: usedEffectiveDate.toISOString(),
          source,
        };
      }
    }

    return NextResponse.json({
      success: true,
      baseCurrency,
      effectiveDate: effectiveDate.toISOString(),
      rates,
      rateDetails,
      requestedCurrencies: currencies,
    });

  } catch (error) {
    console.error('Bulk currency rates API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bulk currency rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 