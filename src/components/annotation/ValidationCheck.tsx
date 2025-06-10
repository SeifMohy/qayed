'use client';

import { useState } from 'react';

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
  creditAmount?: number;
  debitAmount?: number;
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
  if (typeof value === 'number') return value;
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

  const handleValidate = async () => {
    const result = await onValidate();
    if (result) {
      setValidationResult(result);
    }
  };

  // Calculate current validation details
  const calculateValidation = () => {
    const startingBalance = toNumber(statement.startingBalance);
    const endingBalance = toNumber(statement.endingBalance);
    const transactions = statement.transactions || []; // Add fallback to empty array

    let totalCredits = 0;
    let totalDebits = 0;

    transactions.forEach((transaction) => {
      if (transaction.creditAmount) {
        totalCredits += toNumber(transaction.creditAmount);
      }
      if (transaction.debitAmount) {
        totalDebits += toNumber(transaction.debitAmount);
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
  };

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

      {/* Action Button */}
      {!disabled && (
        <div className="flex justify-end">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validating ? 'Validating...' : 'Run Validation'}
          </button>
        </div>
      )}

      {/* Transaction Count Info */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Based on {currentValidation.transactionCount} transactions</p>
      </div>
    </div>
  );
} 