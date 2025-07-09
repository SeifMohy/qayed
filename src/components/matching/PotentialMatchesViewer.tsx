'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';

interface Transaction {
  id: number;
  date: string;
  description: string | null;
  creditAmount: number | null;
  debitAmount: number | null;
  entityName: string | null;
  bankStatement: {
    bankName: string;
    accountNumber: string;
    fileName: string | null;
  };
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  issuerName: string;
  receiverName: string;
  total: number;
  currency: string;
  customer?: { id: number; name: string } | null;
  supplier?: { id: number; name: string } | null;
}

interface PotentialMatch {
  id: number;
  matchScore: number;
  matchReason: string[];
  matchType: string;
  passedStrictCriteria: boolean;
  status: string;
  createdAt: string;
  transactionCategory: string;
  transaction: Transaction;
  invoice: Invoice | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PotentialMatchesViewerProps {
  onMatchUpdate?: () => void;
}

interface ProcessedMatch {
  id: number;
  action: 'approve' | 'reject' | 'dispute';
  isProcessing: boolean;
  isCompleted: boolean;
  error?: string;
}



export default function PotentialMatchesViewer({ onMatchUpdate }: PotentialMatchesViewerProps) {
  const [matches, setMatches] = useState<PotentialMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('PENDING');
  
  // Enhanced state for bulk operations and optimistic updates
  const [processedMatches, setProcessedMatches] = useState<Map<number, ProcessedMatch>>(new Map());
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

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


  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!session?.access_token) {
        console.log('❌ No session or access token available');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/matching/pending?page=${currentPage}&limit=10&status=${filter}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        setPagination(data.pagination);
        // Clear processed matches when switching pages/filters
        setProcessedMatches(new Map());
        setSelectedMatches(new Set());
      } else {
        console.error('Failed to fetch matches:', data.error);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, filter, session]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);



  const handleMatchAction = async (matchId: number, action: 'approve' | 'reject' | 'dispute', notes?: string) => {
    console.log('Attempting to update match:', { matchId, action, notes });
    
    // Optimistic update
    setProcessedMatches(prev => new Map(prev).set(matchId, {
      id: matchId,
      action,
      isProcessing: true,
      isCompleted: false
    }));

    try {
      const requestBody = { matchId, action, notes };
      console.log('Request body:', requestBody);

      const response = await fetch('/api/matching/pending', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Mark as completed
        setProcessedMatches(prev => new Map(prev).set(matchId, {
          id: matchId,
          action,
          isProcessing: false,
          isCompleted: true
        }));
        
        // Remove from selected if it was selected
        setSelectedMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchId);
          return newSet;
        });

        // Refresh the data to show updated state
        setTimeout(() => {
          fetchMatches();
          if (onMatchUpdate) {
            onMatchUpdate();
          }
        }, 500); // Small delay to ensure database is updated
      } else {
        // Mark as error
        setProcessedMatches(prev => new Map(prev).set(matchId, {
          id: matchId,
          action,
          isProcessing: false,
          isCompleted: false,
          error: data.error
        }));
        
        console.error('Match action failed:', data);
      }
    } catch (error: any) {
      console.error('Network error during match action:', error);
      
      setProcessedMatches(prev => new Map(prev).set(matchId, {
        id: matchId,
        action,
        isProcessing: false,
        isCompleted: false,
        error: 'Network error'
      }));
      
      console.error('Network error while updating match:', error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedMatches.size === 0) {
      console.log('No matches selected');
      return;
    }

    const matchIds = Array.from(selectedMatches);
    console.log(`Processing ${matchIds.length} matches for bulk ${action}...`);

    // Process all selected matches
    const promises = matchIds.map(matchId => handleMatchAction(matchId, action));
    
    try {
      await Promise.allSettled(promises);
      console.log(`Bulk ${action} completed for ${matchIds.length} matches`);
      setSelectedMatches(new Set());
      
      // Refresh data after bulk action
      setTimeout(() => {
        fetchMatches();
        if (onMatchUpdate) {
          onMatchUpdate();
        }
      }, 1000); // Longer delay for bulk operations
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    }
  };

  const toggleMatchSelection = (matchId: number) => {
    setSelectedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = matches
      .filter(match => !processedMatches.get(match.id)?.isCompleted)
      .map(match => match.id);
    setSelectedMatches(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedMatches(new Set());
  };

  const isMatchProcessed = (matchId: number) => {
    const processed = processedMatches.get(matchId);
    return processed?.isCompleted || false;
  };

  const isMatchProcessing = (matchId: number) => {
    const processed = processedMatches.get(matchId);
    return processed?.isProcessing || false;
  };

  const getMatchStatus = (matchId: number) => {
    return processedMatches.get(matchId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.9) return '🎯';
    if (score >= 0.7) return '⭐';
    return '🔍';
  };

  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionAmount = (transaction: Transaction) => {
    return transaction.creditAmount || transaction.debitAmount || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header with filters, stats, and bulk actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Potential Matches Review</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review AI-suggested matches between transactions and invoices
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isBulkMode 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Square3Stack3DIcon className="h-4 w-4 mr-1" />
              Bulk Mode
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISPUTED">Disputed</option>
            </select>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="matchScore_desc">Highest Score</option>
              <option value="matchScore_asc">Lowest Score</option>
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {isBulkMode && filter === 'PENDING' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedMatches.size} of {matches.filter(m => !isMatchProcessed(m.id)).length} matches selected
                </span>
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All Visible
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Selection
                </button>
              </div>
              {selectedMatches.size > 0 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Bulk Reject ({selectedMatches.size})
                  </button>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Bulk Approve ({selectedMatches.size})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {pagination && (
          <div className="text-sm text-gray-600">
            Showing {matches.length} of {pagination.totalCount} matches
          </div>
        )}
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'PENDING' 
              ? 'No pending matches to review. Try running AI matching first.' 
              : `No ${filter.toLowerCase()} matches found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const matchStatus = getMatchStatus(match.id);
            const isProcessed = isMatchProcessed(match.id);
            const isProcessing = isMatchProcessing(match.id);
            const isSelected = selectedMatches.has(match.id);

            return (
              <div 
                key={match.id} 
                className={`bg-white rounded-lg border overflow-hidden transition-all duration-200 ${
                  isProcessed ? 'border-green-200 bg-green-50' :
                  isSelected ? 'border-blue-300 bg-blue-50' :
                  'border-gray-200'
                }`}
              >
                {/* Match Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {isBulkMode && filter === 'PENDING' && !isProcessed && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMatchSelection(match.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                      )}
                      <span className="text-2xl">{getScoreIcon(match.matchScore)}</span>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(match.matchScore)}`}>
                          {(match.matchScore * 100).toFixed(0)}% Match
                        </span>
                        {match.passedStrictCriteria && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <StarIcon className="h-3 w-3 mr-1" />
                            High Confidence
                          </span>
                        )}
                        {isProcessed && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            matchStatus?.action === 'approve' ? 'bg-green-100 text-green-800' :
                            matchStatus?.action === 'reject' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <CheckIcon className="h-3 w-3 mr-1" />
                            {matchStatus?.action?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(match.createdAt)}
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Matching Reasons:</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.matchReason.map((reason, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transaction and Invoice Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Transaction Details */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CreditCardIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Bank Transaction</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(match.transaction.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(getTransactionAmount(match.transaction))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">
                            {match.transaction.creditAmount ? 'Credit' : 'Debit'}
                          </span>
                        </div>
                        {match.transaction.description && (
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="mt-1 text-gray-900 break-words">{match.transaction.description}</p>
                          </div>
                        )}
                        {match.transaction.entityName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Entity:</span>
                            <span className="font-medium">{match.transaction.entityName}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-blue-200">
                          <span className="text-gray-600">Bank:</span>
                          <p className="font-medium">{match.transaction.bankStatement.bankName}</p>
                          <p className="text-xs text-gray-500">
                            Account: {match.transaction.bankStatement.accountNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    {match.invoice && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <DocumentTextIcon className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium text-green-900">Invoice</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Invoice #:</span>
                            <span className="font-medium">{match.invoice.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{formatDate(match.invoice.date)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(match.invoice.total, match.invoice.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">{match.invoice.issuerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">{match.invoice.receiverName}</span>
                          </div>
                          {(match.invoice.customer || match.invoice.supplier) && (
                            <div className="pt-2 border-t border-green-200">
                              <span className="text-gray-600">Type:</span>
                              {match.invoice.customer && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Customer: {match.invoice.customer.name}
                                </span>
                              )}
                              {match.invoice.supplier && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Supplier: {match.invoice.supplier.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {filter === 'PENDING' && !isProcessed && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Category: <span className="font-medium">{match.transactionCategory.replace('_', ' ')}</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleMatchAction(match.id, 'reject')}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          ) : (
                            <XMarkIcon className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </button>
                        <button
                          onClick={() => handleMatchAction(match.id, 'dispute')}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                          ) : (
                            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                          )}
                          Dispute
                        </button>
                        <button
                          onClick={() => handleMatchAction(match.id, 'approve')}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 