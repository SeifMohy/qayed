'use client';

import { useState, useEffect } from 'react';
import { ChevronRightIcon, PlayIcon, CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface BankStatement {
  id: number;
  fileName: string;
  bankName: string;
  accountNumber: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  transactionCount: number;
  createdAt: string;
  Customer?: { id: number; name: string } | null;
  Supplier?: { id: number; name: string } | null;
}

interface Bank {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  bankStatements: BankStatement[];
  totalStatements: number;
  totalTransactions: number;
}

interface ClassificationStatus {
  [bankId: number]: {
    status: 'idle' | 'processing' | 'completed' | 'error';
    message?: string;
  };
}

export default function MatchingPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [classificationStatus, setClassificationStatus] = useState<ClassificationStatus>({});
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bank-statements?groupByBank=true');
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.banks);
      } else {
        console.error('Failed to fetch banks:', data.error);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankClassification = async (bankId: number) => {
    setClassificationStatus(prev => ({
      ...prev,
      [bankId]: { status: 'processing', message: 'Classifying all transactions in bank...' }
    }));

    try {
      const response = await fetch('/api/classify-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankId }),
      });

      const data = await response.json();

      if (data.success) {
        setClassificationStatus(prev => ({
          ...prev,
          [bankId]: { 
            status: 'completed', 
            message: `Successfully classified ${data.classifiedCount} transactions across ${data.bankStatementsProcessed} statements` 
          }
        }));
      } else {
        setClassificationStatus(prev => ({
          ...prev,
          [bankId]: { 
            status: 'error', 
            message: data.error || 'Classification failed' 
          }
        }));
      }
    } catch (error) {
      console.error('Error during classification:', error);
      setClassificationStatus(prev => ({
        ...prev,
        [bankId]: { 
          status: 'error', 
          message: 'An error occurred during classification' 
        }
      }));
    }
  };

  const toggleBankExpansion = (bankId: number) => {
    setExpandedBanks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bankId)) {
        newSet.delete(bankId);
      } else {
        newSet.add(bankId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <PlayIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Classification</h1>
        <p className="mt-2 text-gray-600">
          Classify transactions in your bank statements using AI-powered categorization. Organize by bank for efficient processing.
        </p>
      </div>

      {banks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h10v8l10-12H13V2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bank statements</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload some bank statements to get started with classification.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {banks.map((bank) => {
            const status = classificationStatus[bank.id]?.status || 'idle';
            const message = classificationStatus[bank.id]?.message;
            const isExpanded = expandedBanks.has(bank.id);

            return (
              <div key={bank.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Bank Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {bank.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {bank.name}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{bank.totalStatements} statements</span>
                          <span>•</span>
                          <span>{bank.totalTransactions} transactions</span>
                        </div>
                        {message && (
                          <p className={`mt-2 text-sm ${
                            status === 'error' ? 'text-red-600' : 
                            status === 'completed' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleBankClassification(bank.id)}
                        disabled={status === 'processing'}
                        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${getStatusColor(status)} ${
                          status === 'processing' ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-2">
                          {status === 'processing' ? 'Classifying...' : 
                           status === 'completed' ? 'Classified' :
                           status === 'error' ? 'Retry' : 'Classify Bank'}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleBankExpansion(bank.id)}
                        className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Statements List (Expandable) */}
                {isExpanded && (
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Bank Statements</h4>
                    <div className="space-y-3">
                      {bank.bankStatements.map((statement) => (
                        <div key={statement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-xs">
                                  {statement.bankName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {statement.fileName || `${statement.bankName} Statement`}
                                </p>
                                {statement.Customer && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Customer: {statement.Customer.name}
                                  </span>
                                )}
                                {statement.Supplier && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Supplier: {statement.Supplier.name}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1">
                                <p className="text-xs text-gray-500">
                                  Account: {statement.accountNumber} • {statement.transactionCount} transactions
                                </p>
                                <p className="text-xs text-gray-400">
                                  Period: {new Date(statement.statementPeriodStart).toLocaleDateString()} - 
                                  {new Date(statement.statementPeriodEnd).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 