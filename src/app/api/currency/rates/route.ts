import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/currency/rates - Get current exchange rates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const baseCurrency = searchParams.get('base') || 'EGP';
    const targetCurrency = searchParams.get('target');
    const date = searchParams.get('date');

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

    // If specific target currency is requested
    if (targetCurrency) {
      const baseCurrencyObj = await prisma.currency.findUnique({
        where: { code: baseCurrency, isActive: true },
      });

      const targetCurrencyObj = await prisma.currency.findUnique({
        where: { code: targetCurrency, isActive: true },
      });

      if (!baseCurrencyObj || !targetCurrencyObj) {
        return NextResponse.json(
          { success: false, error: 'Currency not found or inactive.' },
          { status: 404 }
        );
      }

      // Find the most recent rate for the given date
      const rate = await prisma.currencyRate.findFirst({
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

      if (!rate) {
        return NextResponse.json(
          { 
            success: false, 
            error: `No exchange rate found for ${baseCurrency} to ${targetCurrency}` 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        rate: {
          id: rate.id,
          baseCurrency: rate.baseCurrency.code,
          targetCurrency: rate.targetCurrency.code,
          rate: rate.rate.toNumber(),
          inverseRate: rate.inverseRate.toNumber(),
          effectiveDate: rate.effectiveDate.toISOString(),
          source: rate.source,
        },
      });
    }

    // Get all rates for the base currency
    const baseCurrencyObj = await prisma.currency.findUnique({
      where: { code: baseCurrency, isActive: true },
    });

    if (!baseCurrencyObj) {
      return NextResponse.json(
        { success: false, error: 'Base currency not found or inactive.' },
        { status: 404 }
      );
    }

    // Get the most recent rates for all target currencies
    const rates = await prisma.currencyRate.findMany({
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
    rates.forEach(rate => {
      if (!latestRates.has(rate.targetCurrencyId)) {
        latestRates.set(rate.targetCurrencyId, rate);
      }
    });

    const formattedRates = Array.from(latestRates.values()).map(rate => ({
      id: rate.id,
      baseCurrency: rate.baseCurrency.code,
      targetCurrency: rate.targetCurrency.code,
      rate: rate.rate.toNumber(),
      inverseRate: rate.inverseRate.toNumber(),
      effectiveDate: rate.effectiveDate.toISOString(),
      source: rate.source,
    }));

    return NextResponse.json({
      success: true,
      baseCurrency,
      effectiveDate: effectiveDate.toISOString(),
      rates: formattedRates,
    });

  } catch (error) {
    console.error('Currency rates API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch currency rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/currency/rates - Create or update exchange rates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseCurrency, targetCurrency, rate, source = 'Manual' } = body;

    // Validate required fields
    if (!baseCurrency || !targetCurrency || !rate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: baseCurrency, targetCurrency, rate' },
        { status: 400 }
      );
    }

    // Validate rate is a positive number
    const rateDecimal = new Decimal(rate);
    if (rateDecimal.lte(0)) {
      return NextResponse.json(
        { success: false, error: 'Exchange rate must be a positive number' },
        { status: 400 }
      );
    }

    // Find currencies
    const baseCurrencyObj = await prisma.currency.findUnique({
      where: { code: baseCurrency, isActive: true },
    });

    const targetCurrencyObj = await prisma.currency.findUnique({
      where: { code: targetCurrency, isActive: true },
    });

    if (!baseCurrencyObj || !targetCurrencyObj) {
      return NextResponse.json(
        { success: false, error: 'Currency not found or inactive' },
        { status: 404 }
      );
    }

    const effectiveDate = new Date();
    const inverseRate = new Decimal(1).div(rateDecimal);

    // Create new rate
    const newRate = await prisma.currencyRate.create({
      data: {
        baseCurrencyId: baseCurrencyObj.id,
        targetCurrencyId: targetCurrencyObj.id,
        rate: rateDecimal,
        inverseRate: inverseRate,
        effectiveDate: effectiveDate,
        source: source,
        isActive: true,
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exchange rate created successfully',
      rate: {
        id: newRate.id,
        baseCurrency: newRate.baseCurrency.code,
        targetCurrency: newRate.targetCurrency.code,
        rate: newRate.rate.toNumber(),
        inverseRate: newRate.inverseRate.toNumber(),
        effectiveDate: newRate.effectiveDate.toISOString(),
        source: newRate.source,
      },
    });

  } catch (error) {
    console.error('Currency rates creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create currency rate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 