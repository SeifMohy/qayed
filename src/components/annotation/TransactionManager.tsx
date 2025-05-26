'use client';

import { useState } from 'react';

// Helper function to safely format dates
function formatDate(dateValue: string | Date): string {
  if (!dateValue) return '-';
  
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
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

interface TransactionManagerProps {
  statementId: number;
  transactions: Transaction[];
  onUpdate: () => void;
  disabled?: boolean;
  googleSheetId?: string | null;
}

export default function TransactionManager({ 
  statementId, 
  transactions, 
  onUpdate, 
  disabled = false,
  googleSheetId 
}: TransactionManagerProps) {
  const [creatingSheet, setCreatingSheet] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);

  const formatCurrency = (amount?: any) => {
    if (amount === null || amount === undefined) return '-';
    
    // Safe number conversion
    let numValue: number;
    if (typeof amount === 'number') {
      numValue = amount;
    } else if (typeof amount === 'string') {
      numValue = parseFloat(amount);
      if (isNaN(numValue)) return '-';
    } else {
      return '-';
    }
    
    return `$${numValue.toFixed(2)}`;
  };

  const handleCreateGoogleSheet = async () => {
    setCreatingSheet(true);
    try {
      const response = await fetch(`/api/annotation/statements/${statementId}/google-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        const message = `Google Sheet created successfully with ${result.data.transactionCount} transactions!`;
        
        // You could replace this with a toast notification if you have one
        if (window.confirm(`${message}\n\nThe sheet is now editable. Would you like to open it now?`)) {
          window.open(result.data.url, '_blank');
        }
        
        // Refresh the data to get the updated googleSheetId
        onUpdate();
      } else {
        alert('Failed to create Google Sheet: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error creating Google Sheet:', error);
      alert('Failed to create Google Sheet: ' + error.message);
    } finally {
      setCreatingSheet(false);
    }
  };

  const handleSyncFromGoogleSheet = async () => {
    setSyncingSheet(true);
    try {
      const response = await fetch(`/api/annotation/statements/${statementId}/google-sheet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        const message = `Successfully synced ${result.data.transactionCount} transactions from Google Sheets!`;
        alert(message);
        
        // Refresh the data
        onUpdate();
      } else {
        alert('Failed to sync from Google Sheet: ' + result.error);
      }
    } catch (error: any) {
      console.error('Error syncing from Google Sheet:', error);
      alert('Failed to sync from Google Sheet: ' + error.message);
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleOpenGoogleSheet = () => {
    if (googleSheetId) {
      const url = `https://docs.google.com/spreadsheets/d/${googleSheetId}/edit`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
          <p className="text-sm text-gray-500">{transactions.length} transactions</p>
          {googleSheetId && (
            <p className="text-xs text-green-600 mt-1">✓ Connected to Google Sheets</p>
          )}
        </div>
        <div className="flex gap-2">
          {googleSheetId ? (
            <>
              <button
                onClick={handleOpenGoogleSheet}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4m0 0h-4" />
                </svg>
                Open Google Sheet
              </button>
              <button
                onClick={handleSyncFromGoogleSheet}
                disabled={syncingSheet}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncingSheet ? 'Syncing...' : 'Sync from Google Sheet'}
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateGoogleSheet}
              disabled={transactions.length === 0 || creatingSheet}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {creatingSheet ? 'Creating...' : 'Create Google Sheet'}
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={transaction.description}>
                      {transaction.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(transaction.creditAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(transaction.debitAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(transaction.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.entityName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No transactions found</p>
          <p className="text-gray-400 text-sm mt-1">Create a Google Sheet to start editing transactions</p>
        </div>
      )}
    </div>
  );
} 