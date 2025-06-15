import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/currency/convert - Convert amounts between currencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, fromCurrency, toCurrency, date } = body;

    // Validate required fields
    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, fromCurrency, toCurrency' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const amountDecimal = new Decimal(amount);
    if (amountDecimal.lte(0)) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // If converting to the same currency, return the same amount
    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        success: true,
        conversion: {
          originalAmount: amountDecimal.toNumber(),
          convertedAmount: amountDecimal.toNumber(),
          fromCurrency,
          toCurrency,
          exchangeRate: 1,
          effectiveDate: new Date().toISOString(),
          source: 'Same Currency',
        },
      });
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

    // Find currencies
    const fromCurrencyObj = await prisma.currency.findUnique({
      where: { code: fromCurrency, isActive: true },
    });

    const toCurrencyObj = await prisma.currency.findUnique({
      where: { code: toCurrency, isActive: true },
    });

    if (!fromCurrencyObj || !toCurrencyObj) {
      return NextResponse.json(
        { success: false, error: 'Currency not found or inactive' },
        { status: 404 }
      );
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
          baseCurrencyId: toCurrencyObj.id,
          targetCurrencyId: fromCurrencyObj.id,
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
        const baseCurrency = await prisma.currency.findFirst({
          where: { isBaseCurrency: true, isActive: true },
        });

        if (!baseCurrency) {
          return NextResponse.json(
            { success: false, error: 'No base currency found' },
            { status: 500 }
          );
        }

        // Get rate from source currency to base currency
        const fromToBase = await prisma.currencyRate.findFirst({
          where: {
            baseCurrencyId: fromCurrencyObj.id,
            targetCurrencyId: baseCurrency.id,
            effectiveDate: { lte: effectiveDate },
            isActive: true,
          },
          orderBy: { effectiveDate: 'desc' },
        });

        // Get rate from base currency to target currency
        const baseToTarget = await prisma.currencyRate.findFirst({
          where: {
            baseCurrencyId: baseCurrency.id,
            targetCurrencyId: toCurrencyObj.id,
            effectiveDate: { lte: effectiveDate },
            isActive: true,
          },
          orderBy: { effectiveDate: 'desc' },
        });

        if (fromToBase && baseToTarget) {
          // Calculate cross rate
          rate = fromToBase.rate.mul(baseToTarget.rate);
          source = `Cross-rate via ${baseCurrency.code}`;
          usedEffectiveDate = new Date(Math.max(fromToBase.effectiveDate.getTime(), baseToTarget.effectiveDate.getTime()));
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: `No exchange rate found for ${fromCurrency} to ${toCurrency}. Please ensure exchange rates are available.` 
            },
            { status: 404 }
          );
        }
      }
    }

    // Perform conversion
    const convertedAmount = amountDecimal.mul(rate);

    return NextResponse.json({
      success: true,
      conversion: {
        originalAmount: amountDecimal.toNumber(),
        convertedAmount: convertedAmount.toNumber(),
        fromCurrency,
        toCurrency,
        exchangeRate: rate.toNumber(),
        effectiveDate: usedEffectiveDate.toISOString(),
        source,
      },
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to convert currency',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/currency/convert - Get conversion rate without performing conversion
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromCurrency = searchParams.get('from');
    const toCurrency = searchParams.get('to');
    const date = searchParams.get('date');

    // Validate required fields
    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: from, to' },
        { status: 400 }
      );
    }

    // If same currency, return rate of 1
    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        success: true,
        rate: {
          fromCurrency,
          toCurrency,
          exchangeRate: 1,
          effectiveDate: new Date().toISOString(),
          source: 'Same Currency',
        },
      });
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

    // Find currencies
    const fromCurrencyObj = await prisma.currency.findUnique({
      where: { code: fromCurrency, isActive: true },
    });

    const toCurrencyObj = await prisma.currency.findUnique({
      where: { code: toCurrency, isActive: true },
    });

    if (!fromCurrencyObj || !toCurrencyObj) {
      return NextResponse.json(
        { success: false, error: 'Currency not found or inactive' },
        { status: 404 }
      );
    }

    // Find the most recent rate
    const exchangeRate = await prisma.currencyRate.findFirst({
      where: {
        baseCurrencyId: fromCurrencyObj.id,
        targetCurrencyId: toCurrencyObj.id,
        effectiveDate: { lte: effectiveDate },
        isActive: true,
      },
      orderBy: { effectiveDate: 'desc' },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    if (!exchangeRate) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No exchange rate found for ${fromCurrency} to ${toCurrency}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rate: {
        fromCurrency: exchangeRate.baseCurrency.code,
        toCurrency: exchangeRate.targetCurrency.code,
        exchangeRate: exchangeRate.rate.toNumber(),
        inverseRate: exchangeRate.inverseRate.toNumber(),
        effectiveDate: exchangeRate.effectiveDate.toISOString(),
        source: exchangeRate.source,
      },
    });

  } catch (error) {
    console.error('Currency rate fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch currency rate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 