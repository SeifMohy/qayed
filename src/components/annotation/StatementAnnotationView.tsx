'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatementMetadataForm from './StatementMetadataForm';
import ValidationCheck from './ValidationCheck';
import TransactionManager from './TransactionManager';

interface BankStatement {
  id: number;
  bankName: string;
  accountNumber: string;
  statementPeriodStart: string | Date;
  statementPeriodEnd: string | Date;
  accountType?: string;
  accountCurrency?: string;
  startingBalance: number;
  endingBalance: number;
  validationStatus: 'pending' | 'passed' | 'failed';
  validated: boolean;
  parsed: boolean;
  locked: boolean;
  fileUrl?: string;
  validationNotes?: string;
  validatedAt?: string;
  validatedBy?: string;
  fileName?: string;
  googleSheetId?: string;
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

interface StatementAnnotationViewProps {
  statementId: number;
}

export default function StatementAnnotationView({ statementId }: StatementAnnotationViewProps) {
  const [statement, setStatement] = useState<BankStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/annotation/statements/${statementId}`);
      const result = await response.json();

      if (result.success) {
        setStatement(result.data);
      } else {
        setError(result.error || 'Failed to fetch statement');
      }
    } catch (err: any) {
      console.error('Error fetching statement:', err);
      setError(err.message || 'Failed to fetch statement');
    } finally {
      setLoading(false);
    }
  }, [statementId]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const handleTransactionsUpdate = useCallback(async () => {
    try {
      // Refresh the statement data after transactions are updated
      await fetchStatement();
    } catch (error) {
      console.error('Error refreshing statement after transaction update:', error);
    }
  }, [fetchStatement]);

  const handleMetadataUpdate = async (updatedData: Partial<BankStatement>) => {
    if (!statement) return;
    
    const { transactions, ...metadataOnly } = updatedData;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/annotation/statements/${statementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadataOnly),
      });

      const result = await response.json();

      if (result.success) {
        setStatement(result.data);
        
        if (result.message) {
          setSuccessMessage(result.message);
        } else {
          setSuccessMessage('Statement updated successfully.');
        }
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);

        // Automatically trigger validation after metadata updates that affect balance
        if (updatedData.startingBalance !== undefined || updatedData.endingBalance !== undefined) {
          // Small delay to ensure state is updated
          setTimeout(async () => {
            try {
              await handleValidation();
            } catch (error) {
              console.error('Auto-validation after metadata update failed:', error);
              // Don't show error to user for auto-validation
            }
          }, 300);
        }
      } else {
        throw new Error(result.error || 'Failed to update statement');
      }
    } catch (err: any) {
      console.error('Error updating statement metadata:', err);
      setError(err.message || 'Failed to update statement');
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };

  const handleValidation = useCallback(async () => {
    if (!statement) {
      throw new Error('No statement data available for validation');
    }

    if (validating) {
      console.log('Validation already in progress, skipping...');
      return null;
    }

    try {
      setValidating(true);
      setError(null);
      
      const response = await fetch(`/api/annotation/statements/${statementId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStatement(result.data.statement);
        return result.data.validation;
      } else {
        throw new Error(result.error || 'Failed to validate statement');
      }
    } catch (err: any) {
      console.error('Error validating statement:', err);
      setError(err.message || 'Failed to validate statement');
      return null;
    } finally {
      setValidating(false);
    }
  }, [statement, statementId, validating]);

  const handleViewDocument = () => {
    if (statement?.fileUrl) {
      window.open(statement.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !statement) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={fetchStatement}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try again
              </button>
              <button
                onClick={() => router.back()}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Statement not found.</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'passed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✓ Validation Passed
        </span>
      );
    } else if (status === 'failed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          ✗ Validation Failed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          ⏳ Pending Validation
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link href="/annotation/statements" className="text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Bank Statements</span>
                      Statements
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {statement.bankName} - {statement.accountNumber}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Bank Statement Annotation
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(statement.validationStatus)}
            {statement.fileUrl && (
              <button
                onClick={handleViewDocument}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Document
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Layout */}
      <div className="space-y-6">
        {/* Top Row - Statement Info & Validation side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statement Metadata */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Statement Information</h3>
              <StatementMetadataForm
                statement={statement}
                onUpdate={handleMetadataUpdate}
                disabled={statement.locked}
                saving={saving}
              />
            </div>
          </div>

          {/* Validation Check */}
          <div className="bg-white shadow rounded-lg">
            <ValidationCheck
              statement={statement}
              onValidate={handleValidation}
              disabled={statement.locked}
              validating={validating}
            />
          </div>
        </div>

        {/* Bottom Row - Transactions (full width) */}
        <div className="bg-white shadow rounded-lg">
          <TransactionManager
            statementId={statementId}
            transactions={statement.transactions}
            onUpdate={handleTransactionsUpdate}
            onValidate={handleValidation}
            disabled={statement.locked}
            googleSheetId={statement.googleSheetId}
            startingBalance={statement.startingBalance}
          />
        </div>
      </div>
    </div>
  );
} 