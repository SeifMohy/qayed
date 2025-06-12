'use client';

import { useState, useCallback } from 'react';

interface BankStatement {
  id: number;
  startingBalance: number;
  endingBalance: number;
  validationStatus: 'pending' | 'passed' | 'failed';
  validationNotes?: string;
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  transactionDate: string | Date;
  description?: string;
  creditAmount?: number;
  debitAmount?: number;
  balance?: number;
  runningBalance?: number;
  validation?: string;
  pageNumber?: string;
  entityName?: string;
}

interface ValidationResult {
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  details: {
    startingBalance: number;
    endingBalance: number;
    calculatedBalance: number;
    totalCredits: number;
    totalDebits: number;
    discrepancy: number;
    transactionCount: number;
  };
}

interface ValidationCheckProps {
  statement: BankStatement;
  onValidate: () => Promise<ValidationResult | null>;
  disabled?: boolean;
  validating?: boolean;
}

// Helper function to safely convert values to numbers
function toNumber(value: any): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Helper function to safely format currency
function formatCurrency(value: any): string {
  const num = toNumber(value);
  return num.toFixed(2);
}

export default function ValidationCheck({ 
  statement, 
  onValidate, 
  disabled = false, 
  validating = false 
}: ValidationCheckProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = useCallback(async () => {
    if (validating) {
      console.log('Validation already in progress, skipping...');
      return;
    }

    try {
      setError(null);
      const result = await onValidate();
      if (result) {
        setValidationResult(result);
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || 'Validation failed. Please try again.');
    }
  }, [onValidate, validating]);

  // Calculate current validation details with error handling
  // NOTE: Transactions are ordered by ID (not date) to maintain consistent ordering
  const calculateValidation = useCallback(() => {
    try {
      const startingBalance = toNumber(statement.startingBalance);
      const endingBalance = toNumber(statement.endingBalance);
      const transactions = Array.isArray(statement.transactions) ? statement.transactions : [];

      let totalCredits = 0;
      let totalDebits = 0;

      transactions.forEach((transaction) => {
        try {
          if (transaction.creditAmount !== null && transaction.creditAmount !== undefined) {
            const credit = toNumber(transaction.creditAmount);
            if (credit > 0) totalCredits += credit;
          }
          if (transaction.debitAmount !== null && transaction.debitAmount !== undefined) {
            const debit = toNumber(transaction.debitAmount);
            if (debit > 0) totalDebits += debit;
          }
        } catch (transactionError) {
          console.warn('Error processing transaction:', transaction.id, transactionError);
        }
      });

      const calculatedBalance = startingBalance + totalCredits - totalDebits;
      const discrepancy = Math.abs(calculatedBalance - endingBalance);

      return {
        startingBalance,
        endingBalance,
        calculatedBalance,
        totalCredits,
        totalDebits,
        discrepancy,
        transactionCount: transactions.length
      };
    } catch (error) {
      console.error('Error calculating validation:', error);
      return {
        startingBalance: 0,
        endingBalance: 0,
        calculatedBalance: 0,
        totalCredits: 0,
        totalDebits: 0,
        discrepancy: 0,
        transactionCount: 0
      };
    }
  }, [statement]);

  const currentValidation = calculateValidation();
  const tolerance = 0.01; // 1 cent tolerance
  const isValid = toNumber(currentValidation.discrepancy) <= tolerance;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <span className="text-green-500 text-xl">✓</span>;
      case 'failed':
        return <span className="text-red-500 text-xl">✗</span>;
      default:
        return <span className="text-yellow-500 text-xl">⏳</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-800 bg-green-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-yellow-800 bg-yellow-100';
    }
  };

  return (
    <div className="p-6">
      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Validation Status</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statement.validationStatus)}`}>
            {getStatusIcon(statement.validationStatus)}
            <span className="ml-2">
              {statement.validationStatus === 'passed' && 'Validation Passed'}
              {statement.validationStatus === 'failed' && 'Validation Failed'}
              {statement.validationStatus === 'pending' && 'Pending Validation'}
            </span>
          </div>
        </div>

        {statement.validationNotes && (
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-700">{statement.validationNotes}</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button
                  onClick={() => setError(null)}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Balance Calculation</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Starting Balance:</span>
            <span className="ml-2 font-medium">${formatCurrency(currentValidation.startingBalance)}</span>
          </div>
          <div>
            <span className="text-gray-600">Ending Balance:</span>
            <span className="ml-2 font-medium">${formatCurrency(currentValidation.endingBalance)}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Credits:</span>
            <span className="ml-2 font-medium text-green-600">+${formatCurrency(currentValidation.totalCredits)}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Debits:</span>
            <span className="ml-2 font-medium text-red-600">-${formatCurrency(currentValidation.totalDebits)}</span>
          </div>
          <div>
            <span className="text-gray-600">Calculated Balance:</span>
            <span className="ml-2 font-medium">${formatCurrency(currentValidation.calculatedBalance)}</span>
          </div>
          <div>
            <span className="text-gray-600">Discrepancy:</span>
            <span className={`ml-2 font-medium ${toNumber(currentValidation.discrepancy) > tolerance ? 'text-red-600' : 'text-green-600'}`}>
              ${formatCurrency(currentValidation.discrepancy)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm">
            <span className="text-gray-600">Formula:</span>
            <span className="ml-2 font-mono text-xs">
              Starting Balance ({formatCurrency(currentValidation.startingBalance)}) + 
              Credits ({formatCurrency(currentValidation.totalCredits)}) - 
              Debits ({formatCurrency(currentValidation.totalDebits)}) = 
              {formatCurrency(currentValidation.calculatedBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Validation Preview */}
      <div className={`rounded-lg p-4 mb-6 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          {isValid ? (
            <>
              <span className="text-green-500 text-xl mr-3">✓</span>
              <div>
                <p className="text-green-800 font-medium">Balance validation would pass</p>
                <p className="text-green-700 text-sm">
                  The calculated ending balance matches the statement ending balance within tolerance.
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="text-red-500 text-xl mr-3">✗</span>
              <div>
                <p className="text-red-800 font-medium">Balance validation would fail</p>
                <p className="text-red-700 text-sm">
                  Expected: ${formatCurrency(currentValidation.calculatedBalance)}, 
                  Actual: ${formatCurrency(currentValidation.endingBalance)}, 
                  Difference: ${formatCurrency(currentValidation.discrepancy)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Latest Validation Result</h4>
          <div className={`rounded-lg p-4 ${validationResult.status === 'passed' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {getStatusIcon(validationResult.status)}
              <div className="ml-3">
                <p className={`font-medium ${validationResult.status === 'passed' ? 'text-green-800' : 'text-red-800'}`}>
                  {validationResult.status === 'passed' ? 'Validation Passed' : 'Validation Failed'}
                </p>
                <p className={`text-sm mt-1 ${validationResult.status === 'passed' ? 'text-green-700' : 'text-red-700'}`}>
                  {validationResult.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleValidate}
          disabled={disabled || validating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Validation
            </>
          )}
        </button>
      </div>
    </div>
  );
} 