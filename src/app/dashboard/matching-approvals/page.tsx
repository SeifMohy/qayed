'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import PotentialMatchesViewer from '@/components/matching/PotentialMatchesViewer';

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

export default function MatchingApprovalsPage() {
  const [matchingStats, setMatchingStats] = useState<MatchingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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
        <h1 className="text-3xl font-bold text-gray-900">Matching Approvals</h1>
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