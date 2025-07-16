'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, DocumentTextIcon, CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PotentialMatchesViewer from '@/components/matching/PotentialMatchesViewer';
import { useAuth } from '@/contexts/auth-context';

interface MatchingStats {
  totalInvoices: number;
  totalTransactions: number;
  unmatchedInvoices: number;
  unmatchedTransactions: number;
  matches: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    disputed: number;
    averageScore: number;
    highConfidence: number;
  };
}

interface MatchingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
  matches?: number;
}

export default function MatchingApprovalsPage() {
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus>({ status: 'idle' });

  // Auth context
  const { session } = useAuth();

  // Helper function to prepare auth headers
  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const getBackendUrl = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) throw new Error('Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
    return backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
  };

  const fetchMatchingStats = async () => {
    setLoadingStats(true);
    try {
      if (!session?.access_token || !session?.user?.id) {
        setLoadingStats(false);
        return;
      }
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/matching/stats?supabaseUserId=${session.user.id}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      if (data.success) setMatchingStats(data.stats);
      else console.error('Failed to fetch matching stats:', data.error);
    } catch (error) {
      console.error('Error fetching matching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAIMatching = async () => {
    setMatchingStatus({
      status: 'processing',
      message: 'Initializing AI matching with Gemini...',
      progress: 0
    });
    try {
      if (!session?.access_token || !session?.user?.id) {
        setMatchingStatus({ status: 'error', message: 'Authentication required.' });
        return;
      }
      const backendUrl = getBackendUrl();
      const response = await fetch(
        `${backendUrl}/api/matching/ai-gemini`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ supabaseUserId: session.user.id }),
        }
      );
      const data = await response.json();
      if (data.success) {
        const message = data.details ?
          `AI matching completed! Found ${data.totalMatches} potential matches from ${data.details.invoicesProcessed} invoices and ${data.details.transactionsAnalyzed} transactions.` :
          `AI matching completed! Found ${data.totalMatches} potential matches.`;
        setMatchingStatus({ status: 'completed', message, matches: data.totalMatches });
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
        fetchMatchingStats();
      } else {
        let errorMessage = data.error || 'AI matching failed';
        if (data.error?.includes('No invoices found')) {
          errorMessage = 'No invoices found. Please add some invoices before running AI matching.';
        } else if (data.error?.includes('No transactions found')) {
          errorMessage = 'No classified transactions found. Please classify transactions first.';
        } else if (data.error?.includes('API key')) {
          errorMessage = 'AI service configuration error. Please contact support.';
        }
        setMatchingStatus({ status: 'error', message: errorMessage });
      }
    } catch (error) {
      console.error('Error during AI matching:', error);
      setMatchingStatus({ status: 'error', message: 'Network error occurred during AI matching. Please try again.' });
    }
  };

  useEffect(() => {
    fetchMatchingStats();
  }, []);

  const handleMatchUpdate = () => {
    // Refresh stats when matches are updated
    fetchMatchingStats();
  };

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
            <>
              {/* Basic Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

              {/* Match Stats */}
              {matchingStats.matches.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-200" />
                      <span className="text-xs text-purple-200">Pending Review</span>
                    </div>
                    <p className="text-lg font-bold text-green-200">{matchingStats.matches.pending}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-300" />
                      <span className="text-xs text-purple-200">Approved</span>
                    </div>
                    <p className="text-lg font-bold text-green-300">{matchingStats.matches.approved}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <XMarkIcon className="h-4 w-4 text-red-200" />
                      <span className="text-xs text-purple-200">Rejected</span>
                    </div>
                    <p className="text-lg font-bold text-red-200">{matchingStats.matches.rejected}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-200" />
                      <span className="text-xs text-purple-200">Disputed</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-200">{matchingStats.matches.disputed}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="h-4 w-4 text-blue-200" />
                      <span className="text-xs text-purple-200">High Confidence</span>
                    </div>
                    <p className="text-lg font-bold text-blue-200">{matchingStats.matches.highConfidence}</p>
                  </div>
                </div>
              )}
            </>
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

      <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reconciliation</h1>
        <p className="mt-2 text-gray-600">
          Review and approve AI-suggested matches between transactions and invoices.
        </p>
      </div>

      {/* Quick Stats Summary */}
      {matchingStats && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircleIcon className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Approval Dashboard</h2>
            </div>
            
            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-emerald-200" />
                    <span className="text-sm text-emerald-200">Pending Review</span>
                  </div>
                  <p className="text-2xl font-bold">{matchingStats.matches.pending}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-200" />
                    <span className="text-sm text-emerald-200">High Confidence</span>
                  </div>
                  <p className="text-2xl font-bold">{matchingStats.matches.highConfidence}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span className="text-sm text-emerald-200">Avg. Score</span>
                  </div>
                  <p className="text-2xl font-bold">{(matchingStats.matches.averageScore * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span className="text-sm text-emerald-200">Approved</span>
                  </div>
                  <p className="text-2xl font-bold">{matchingStats.matches.approved}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Potential Matches Viewer */}
      <PotentialMatchesViewer onMatchUpdate={handleMatchUpdate} />
    </div>
  );
} 