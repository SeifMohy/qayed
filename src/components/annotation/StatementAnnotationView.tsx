'use client';

import { useState, useEffect } from 'react';
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
  const router = useRouter();

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/annotation/statements/${statementId}`);
      const result = await response.json();

      if (result.success) {
        setStatement(result.data);
      } else {
        setError(result.error || 'Failed to fetch statement');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [statementId]);

  const handleMetadataUpdate = async (updatedData: Partial<BankStatement>) => {
    if (!statement) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/annotation/statements/${statementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        setStatement(result.data);
      } else {
        throw new Error(result.error || 'Failed to update statement');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update statement');
    } finally {
      setSaving(false);
    }
  };

  const handleValidation = async () => {
    if (!statement) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/annotation/statements/${statementId}/validate`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setStatement(result.data.statement);
        return result.data.validation;
      } else {
        throw new Error(result.error || 'Failed to validate statement');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate statement');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleTransactionsUpdate = () => {
    // Refresh the statement data after transactions are updated
    fetchStatement();
  };

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/dashboard/annotation/statements" className="text-gray-400 hover:text-gray-500">
                Annotation
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">
                  {statement.bankName} - {statement.accountNumber}
                </span>
              </div>
            </li>
          </ol>
        </nav>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bank Statement Annotation
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and validate the extracted data for accuracy
            </p>
          </div>
          <div className="flex items-center gap-3">
            {statement?.fileUrl && (
              <button
                onClick={handleViewDocument}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Document
              </button>
            )}
            {getStatusBadge(statement.validationStatus)}
            {statement.locked && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                🔒 Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Statement Metadata Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Statement Information</h2>
            </div>
            <StatementMetadataForm
              statement={statement}
              onUpdate={handleMetadataUpdate}
              disabled={statement.locked}
              saving={saving}
            />
          </div>

          {/* Validation Check */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Balance Validation</h2>
            </div>
            <ValidationCheck
              statement={statement}
              onValidate={handleValidation}
              disabled={statement.locked}
              validating={saving}
            />
          </div>

          {/* Transaction Management - Full Width */}
          <div className="bg-white shadow rounded-lg xl:col-span-2">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Transaction Management</h2>
            </div>
            <TransactionManager
              statementId={statement.id}
              transactions={statement.transactions}
              onUpdate={handleTransactionsUpdate}
              disabled={statement.locked}
              googleSheetId={statement.googleSheetId}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 