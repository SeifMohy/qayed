'use client';

import { useState, useEffect } from 'react';
import { ChevronRightIcon, PlayIcon, CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, DocumentTextIcon, CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

interface MatchingStats {
  totalInvoices: number;
  totalTransactions: number;
  unmatchedInvoices: number;
  unmatchedTransactions: number;
}

interface MatchingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
  matches?: number;
}

export default function MatchingPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [classificationStatus, setClassificationStatus] = useState<ClassificationStatus>({});
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  
  // New state for AI matching
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>({ status: 'idle' });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchBanks();
    fetchMatchingStats();
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

  const fetchMatchingStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/matching/stats');
      const data = await response.json();
      
      if (data.success) {
        setMatchingStats(data.stats);
      } else {
        console.error('Failed to fetch matching stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching matching stats:', error);
    } finally {
      setLoadingStats(false);
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

  const handleAIMatching = async () => {
    setMatchingStatus({
      status: 'processing',
      message: 'Initializing AI matching with Gemini...',
      progress: 0
    });

    try {
      const response = await fetch('/api/matching/ai-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const message = data.details ? 
          `AI matching completed! Found ${data.totalMatches} potential matches from ${data.details.invoicesProcessed} invoices and ${data.details.transactionsAnalyzed} transactions.` :
          `AI matching completed! Found ${data.totalMatches} potential matches.`;
        
        setMatchingStatus({
          status: 'completed',
          message,
          matches: data.totalMatches
        });
        
        // Show additional details in console for debugging
        if (data.details) {
          console.log('🎯 Matching Results:', {
            invoicesProcessed: data.details.invoicesProcessed,
            transactionsAnalyzed: data.details.transactionsAnalyzed,
            matchesFound: data.details.matchesFound,
            matchesSaved: data.details.matchesSaved,
            duplicates: data.duplicateMatches || 0,
            errors: data.errorMatches || 0
          });
        }
        
        // Refresh stats after matching
        fetchMatchingStats();
      } else {
        let errorMessage = data.error || 'AI matching failed';
        
        // Handle specific error cases
        if (errorMessage.includes('GEMINI_API_KEY')) {
          errorMessage = 'Please set up your Gemini API key in the environment variables. Check the setup guide for instructions.';
        } else if (errorMessage.includes('rate limit')) {
          errorMessage = 'API rate limit reached. Please wait a moment and try again.';
        } else if (errorMessage.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        setMatchingStatus({
          status: 'error',
          message: errorMessage
        });
        
        // Log detailed error for debugging
        console.error('AI Matching Error:', data);
      }
    } catch (error) {
      console.error('Error during AI matching:', error);
      
      let errorMessage = 'An error occurred during AI matching';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the AI matching service. Please check if the server is running.';
      }
      
      setMatchingStatus({
        status: 'error',
        message: errorMessage
      });
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
        <h1 className="text-3xl font-bold text-gray-900">Intelligent Transaction Matching</h1>
        <p className="mt-2 text-gray-600">
          Use AI-powered matching to automatically link invoices with bank transactions, and classify transactions for better organization.
        </p>
      </div>

      {/* AI Invoice-Transaction Matching Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="h-8 w-8" />
            <h2 className="text-2xl font-bold">AI-Powered Invoice Matching</h2>
          </div>
          <p className="text-purple-100 mb-6">
            Let our AI analyze your invoices and transactions to find potential matches using advanced pattern recognition.
          </p>
          
          {/* Matching Stats */}
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-white/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : matchingStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-200" />
                  <span className="text-sm text-purple-200">Total Invoices</span>
                </div>
                <p className="text-2xl font-bold">{matchingStats.totalInvoices.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CreditCardIcon className="h-5 w-5 text-purple-200" />
                  <span className="text-sm text-purple-200">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold">{matchingStats.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-200" />
                  <span className="text-sm text-purple-200">Unmatched Invoices</span>
                </div>
                <p className="text-2xl font-bold text-yellow-200">{matchingStats.unmatchedInvoices.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-yellow-200" />
                  <span className="text-sm text-purple-200">Unmatched Transactions</span>
                </div>
                <p className="text-2xl font-bold text-yellow-200">{matchingStats.unmatchedTransactions.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Matching Status and Button */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {matchingStatus.message && (
                <div className="mb-2">
                  <p className={`text-sm ${
                    matchingStatus.status === 'error' ? 'text-red-200' : 
                    matchingStatus.status === 'completed' ? 'text-green-200' : 'text-purple-200'
                  }`}>
                    {matchingStatus.message}
                  </p>
                  {matchingStatus.progress !== undefined && matchingStatus.status === 'processing' && (
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-300"
                        style={{ width: `${matchingStatus.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleAIMatching}
              disabled={matchingStatus.status === 'processing'}
              className={`ml-4 inline-flex items-center px-6 py-3 border border-white/20 rounded-lg text-sm font-medium transition-all ${
                matchingStatus.status === 'processing'
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 cursor-pointer'
              }`}
            >
              {matchingStatus.status === 'processing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Start AI Matching
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Classification Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Classification by Bank</h2>
        <p className="text-gray-600 mb-6">
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