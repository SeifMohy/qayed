'use client';

import { useState, useEffect } from 'react';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  isBaseCurrency: boolean;
  decimalPlaces: number;
}

interface CurrencyRate {
  id: number;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  inverseRate: number;
  effectiveDate: string;
  source: string | null;
}

interface CurrencyConversion {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  effectiveDate: string;
  source: string;
}

export default function TestCurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [conversion, setConversion] = useState<CurrencyConversion | { error: string } | null>(null);
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EGP');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCurrencies();
    loadRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      // For now, we'll use hardcoded currencies since we know what they are
      const currencyList: Currency[] = [
        { id: 1, code: 'EGP', name: 'Egyptian Pound', symbol: '£E', isActive: true, isBaseCurrency: true, decimalPlaces: 2 },
        { id: 2, code: 'USD', name: 'US Dollar', symbol: '$', isActive: true, isBaseCurrency: false, decimalPlaces: 2 },
        { id: 3, code: 'EUR', name: 'Euro', symbol: '€', isActive: true, isBaseCurrency: false, decimalPlaces: 2 },
        { id: 4, code: 'GBP', name: 'British Pound', symbol: '£', isActive: true, isBaseCurrency: false, decimalPlaces: 2 },
        { id: 5, code: 'CNY', name: 'Chinese Yuan', symbol: '¥', isActive: true, isBaseCurrency: false, decimalPlaces: 2 },
      ];
      setCurrencies(currencyList);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const loadRates = async () => {
    try {
      const response = await fetch('/api/currency/rates?base=EGP');
      const data = await response.json();
      
      if (data.success) {
        setRates(data.rates);
      } else {
        console.error('Failed to load rates:', data.error);
      }
    } catch (error) {
      console.error('Failed to load rates:', error);
    }
  };

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          fromCurrency,
          toCurrency,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setConversion(data.conversion);
      } else {
        setConversion({ error: data.error || 'Conversion failed' });
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      setConversion({ error: 'Conversion failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Currency Test Page</h1>
            <p className="text-gray-600">Test the new multi-currency system</p>
          </div>

          <div className="p-6 space-y-8">
            
            {/* Currency Converter */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleConvert}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Converting...' : 'Convert'}
                  </button>
                </div>
              </div>

              {conversion && (
                <div className="mt-4 p-4 bg-white rounded-md border">
                  {'error' in conversion ? (
                    <p className="text-red-600">{conversion.error}</p>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold">
                        {conversion.originalAmount.toLocaleString()} {conversion.fromCurrency} = {' '}
                        {conversion.convertedAmount.toLocaleString()} {conversion.toCurrency}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Exchange Rate: 1 {conversion.fromCurrency} = {conversion.exchangeRate} {conversion.toCurrency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Source: {conversion.source} | Date: {new Date(conversion.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available Currencies */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Currencies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map(currency => (
                  <div key={currency.code} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{currency.code}</h3>
                        <p className="text-sm text-gray-600">{currency.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{currency.symbol}</p>
                        {currency.isBaseCurrency && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Base
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Rates */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Exchange Rates (EGP Base)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency Pair
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inverse Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rates.map(rate => (
                      <tr key={rate.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rate.baseCurrency} → {rate.targetCurrency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rate.rate.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rate.inverseRate.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rate.source || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(rate.effectiveDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available API Endpoints</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded">GET /api/currency/rates</code>
                  <span className="ml-2 text-gray-600">Get exchange rates</span>
                </div>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded">POST /api/currency/rates</code>
                  <span className="ml-2 text-gray-600">Create/update exchange rates</span>
                </div>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded">GET /api/currency/convert</code>
                  <span className="ml-2 text-gray-600">Get conversion rate</span>
                </div>
                <div>
                  <code className="bg-gray-200 px-2 py-1 rounded">POST /api/currency/convert</code>
                  <span className="ml-2 text-gray-600">Convert currency amounts</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 