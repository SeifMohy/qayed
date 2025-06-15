import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Starting currency seeding...');

  // Create currencies
  const currencies = [
    {
      code: 'EGP',
      name: 'Egyptian Pound',
      symbol: '£E',
      isBaseCurrency: true,
      decimalPlaces: 2,
    },
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      isBaseCurrency: false,
      decimalPlaces: 2,
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      isBaseCurrency: false,
      decimalPlaces: 2,
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      isBaseCurrency: false,
      decimalPlaces: 2,
    },
    {
      code: 'CNY',
      name: 'Chinese Yuan',
      symbol: '¥',
      isBaseCurrency: false,
      decimalPlaces: 2,
    },
  ];

  const createdCurrencies = new Map();

  for (const currency of currencies) {
    const existingCurrency = await prisma.currency.findUnique({
      where: { code: currency.code },
    });

    if (existingCurrency) {
      console.log(`✅ Currency ${currency.code} already exists`);
      createdCurrencies.set(currency.code, existingCurrency);
    } else {
      const newCurrency = await prisma.currency.create({
        data: currency,
      });
      console.log(`🎯 Created currency: ${currency.code} - ${currency.name}`);
      createdCurrencies.set(currency.code, newCurrency);
    }
  }

  // Create initial exchange rates (as of a recent date)
  // Note: These are approximate rates and should be updated with real-time data
  const exchangeRates = [
    // EGP to other currencies (how much foreign currency = 1 EGP)
    { from: 'EGP', to: 'USD', rate: 0.020, source: 'Initial Seed' },
    { from: 'EGP', to: 'EUR', rate: 0.019, source: 'Initial Seed' },
    { from: 'EGP', to: 'GBP', rate: 0.016, source: 'Initial Seed' },
    { from: 'EGP', to: 'CNY', rate: 0.145, source: 'Initial Seed' },
    
    // Reverse rates (foreign currency to EGP) - Fixed to be mathematically consistent
    { from: 'USD', to: 'EGP', rate: 50.0, source: 'Initial Seed' },     // 1/0.020 = 50.0
    { from: 'EUR', to: 'EGP', rate: 52.631578947368421, source: 'Initial Seed' }, // 1/0.019 ≈ 52.63
    { from: 'GBP', to: 'EGP', rate: 62.5, source: 'Initial Seed' },     // 1/0.016 = 62.5
    { from: 'CNY', to: 'EGP', rate: 6.896551724137931, source: 'Initial Seed' }, // 1/0.145 ≈ 6.90
  ];

  const effectiveDate = new Date();

  for (const rate of exchangeRates) {
    const baseCurrency = createdCurrencies.get(rate.from);
    const targetCurrency = createdCurrencies.get(rate.to);

    if (!baseCurrency || !targetCurrency) {
      console.error(`❌ Currency not found: ${rate.from} or ${rate.to}`);
      continue;
    }

    // Check if rate already exists
    const existingRate = await prisma.currencyRate.findUnique({
      where: {
        baseCurrencyId_targetCurrencyId_effectiveDate: {
          baseCurrencyId: baseCurrency.id,
          targetCurrencyId: targetCurrency.id,
          effectiveDate: effectiveDate,
        },
      },
    });

    if (existingRate) {
      console.log(`✅ Exchange rate ${rate.from} -> ${rate.to} already exists`);
      continue;
    }

    const rateDecimal = new Decimal(rate.rate);
    const inverseRateDecimal = new Decimal(1).div(rateDecimal);

    await prisma.currencyRate.create({
      data: {
        baseCurrencyId: baseCurrency.id,
        targetCurrencyId: targetCurrency.id,
        rate: rateDecimal,
        inverseRate: inverseRateDecimal,
        effectiveDate: effectiveDate,
        source: rate.source,
        isActive: true,
      },
    });

    console.log(`💱 Created exchange rate: ${rate.from} -> ${rate.to} = ${rate.rate}`);
  }

  console.log('✨ Currency seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 