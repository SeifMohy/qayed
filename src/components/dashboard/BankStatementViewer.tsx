'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/format';
import { parseBankStatementStructureSSE } from '@/lib/sse-utils';

type Transaction = {
  date: string;
  credit_amount: string;
  debit_amount: string;
  description: string;
  balance?: string;
  page_number?: string;
  entity_name?: string;
};

type AccountStatement = {
  bank_name: string;
  account_number: string;
  statement_period: {
    start_date: string;
    end_date: string;
  };
  account_type?: string;
  account_currency?: string;
  starting_balance: string;
  ending_balance: string;
  transactions: Transaction[];
};

type StructuredBankData = {
  account_statements: AccountStatement[];
};

export default function BankStatementViewer() {
  const [parsedFiles, setParsedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredBankData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'structured'>('raw');
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  
  // Load parsed files from session storage on component mount
  useEffect(() => {
    const filesJson = sessionStorage.getItem('bankstatement_files');
    if (filesJson) {
      try {
        const files = JSON.parse(filesJson) as string[];
        setParsedFiles(files);
        
        // Auto-select the first file if available
        if (files.length > 0 && !selectedFile) {
          setSelectedFile(files[0]);
          const content = sessionStorage.getItem(`bankstatement_${files[0]}`);
          setFileContent(content);
          
          // Check if structured data exists for this file
          const structuredJson = sessionStorage.getItem(`bankstatement_structured_${files[0]}`);
          if (structuredJson) {
            setStructuredData(JSON.parse(structuredJson));
            setActiveTab('structured'); // Default to structured view if available
          } else {
            setStructuredData(null);
            setActiveTab('raw');
          }
        }
      } catch (error) {
        console.error('Error parsing stored files:', error);
      }
    }
  }, []);
  
  // Load file content when a file is selected
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    const content = sessionStorage.getItem(`bankstatement_${fileName}`);
    setFileContent(content);
    
    // Check if structured data exists for this file
    const structuredJson = sessionStorage.getItem(`bankstatement_structured_${fileName}`);
    if (structuredJson) {
      try {
        setStructuredData(JSON.parse(structuredJson));
        setSelectedAccountIndex(0); // Reset to first account
      } catch (error) {
        console.error('Error parsing structured data:', error);
        setStructuredData(null);
      }
    } else {
      setStructuredData(null);
      setActiveTab('raw');
    }
    
    setProcessingError(null);
  };
  
  // Process the raw text to extract structured data
  const processStatement = async () => {
    if (!selectedFile || !fileContent) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const response = await fetch('/api/structure-bankstatement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statementText: fileContent,
          fileName: selectedFile
        }),
      });
      
      // Handle SSE stream with utility function
      const finalResult = await parseBankStatementStructureSSE(response);
      
      // Store the structured data
      setStructuredData(finalResult.structuredData);
      sessionStorage.setItem(
        `bankstatement_structured_${selectedFile}`, 
        JSON.stringify(finalResult.structuredData)
      );
      
      // Switch to structured view
      setActiveTab('structured');
      
    } catch (error: any) {
      console.error('Error structuring bank statement:', error);
      setProcessingError(error.message || 'An unexpected error occurred while processing.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Clear all stored bank statements
  const clearAllFiles = () => {
    if (confirm('Are you sure you want to clear all parsed bank statements?')) {
      // Remove all bank statement items from session storage
      parsedFiles.forEach(fileName => {
        sessionStorage.removeItem(`bankstatement_${fileName}`);
        sessionStorage.removeItem(`bankstatement_structured_${fileName}`);
      });
      sessionStorage.removeItem('bankstatement_files');
      
      // Reset state
      setParsedFiles([]);
      setSelectedFile(null);
      setFileContent(null);
      setStructuredData(null);
    }
  };
  
  // Get current account statement
  const getCurrentAccountStatement = (): AccountStatement | null => {
    if (!structuredData || !structuredData.account_statements || structuredData.account_statements.length === 0) {
      return null;
    }
    
    // Check if the account exists at the selected index
    if (selectedAccountIndex >= structuredData.account_statements.length) {
      return structuredData.account_statements[0]; // Fallback to first account
    }
    
    const account = structuredData.account_statements[selectedAccountIndex];
    
    // Ensure the account has all the required properties with defaults
    return {
      bank_name: account.bank_name || 'Unknown Bank',
      account_number: account.account_number || 'Unknown',
      statement_period: account.statement_period || { start_date: '', end_date: '' },
      account_type: account.account_type || 'N/A',
      account_currency: account.account_currency || 'N/A',
      starting_balance: account.starting_balance || '0.00',
      ending_balance: account.ending_balance || '0.00',
      transactions: Array.isArray(account.transactions) ? account.transactions.map(t => ({
        ...t,
        balance: t.balance || 'N/A',
        page_number: t.page_number || 'N/A',
        entity_name: t.entity_name || 'N/A',
      })) : []
    };
  };
  
  if (parsedFiles.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No parsed bank statements found in storage.</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload bank statements on the upload page to see them here.
        </p>
      </div>
    );
  }
  
  const currentAccount = getCurrentAccountStatement();
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex border-b">
        {/* File list sidebar */}
        <div className="w-64 border-r bg-gray-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Parsed Statements</h3>
            <button
              onClick={clearAllFiles}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {parsedFiles.map((fileName) => (
              <button
                key={fileName}
                className={`w-full text-left p-3 text-sm truncate hover:bg-gray-100 ${
                  selectedFile === fileName 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-700'
                }`}
                onClick={() => handleFileSelect(fileName)}
              >
                {fileName}
                {sessionStorage.getItem(`bankstatement_structured_${fileName}`) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Structured
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* File content */}
        <div className="flex-1 p-6">
          {selectedFile ? (
            <>
              <div className="mb-4 pb-2 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{selectedFile}</h2>
                
                {/* Tab switcher and process button */}
                <div className="flex items-center">
                  {structuredData && (
                    <div className="mr-4 border rounded-md overflow-hidden">
                      <button
                        className={`px-3 py-1 text-sm ${
                          activeTab === 'raw' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveTab('raw')}
                      >
                        Raw Text
                      </button>
                      <button
                        className={`px-3 py-1 text-sm ${
                          activeTab === 'structured' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveTab('structured')}
                      >
                        Structured
                      </button>
                    </div>
                  )}
                  
                  {fileContent && !structuredData && (
                    <button
                      onClick={processStatement}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Structure Data'
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {processingError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {processingError}
                </div>
              )}
              
              {/* Content display */}
              {activeTab === 'raw' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap" style={{ maxHeight: '65vh' }}>
                    {fileContent ? (
                      <pre className="text-sm text-gray-700 font-mono">{fileContent}</pre>
                    ) : (
                      <p className="text-gray-500 italic">No content available for this file.</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => {
                        if (fileContent) {
                          navigator.clipboard.writeText(fileContent);
                          alert('Content copied to clipboard!');
                        }
                      }}
                      disabled={!fileContent}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </>
              )}
              
              {activeTab === 'structured' && structuredData && (
                <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                  {/* Account selector (if multiple accounts) */}
                  {structuredData.account_statements && structuredData.account_statements.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Account ({structuredData.account_statements.length} accounts found)
                      </label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={selectedAccountIndex}
                        onChange={(e) => setSelectedAccountIndex(parseInt(e.target.value))}
                      >
                        {structuredData.account_statements.map((account, idx) => (
                          <option key={idx} value={idx}>
                            {account.bank_name || 'Unknown'} - {account.account_number || 'Unknown Account'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {currentAccount ? (
                    <>
                      {/* Account Information */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 mb-3">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Bank Name</p>
                            <p className="font-medium">{currentAccount.bank_name || 'Not available'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Number</p>
                            <p className="font-medium">{currentAccount.account_number || 'Not available'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="font-medium">{currentAccount.account_type || 'Not available'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Account Currency</p>
                            <p className="font-medium">{currentAccount.account_currency || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Statement Period</p>
                            <p className="font-medium">
                              {currentAccount.statement_period?.start_date || 'Unknown'} to {currentAccount.statement_period?.end_date || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Balance</p>
                            <p className="font-medium">
                              Starting: {formatCurrency(parseFloat(currentAccount.starting_balance || '0'), currentAccount.account_currency || 'USD')} |
                              Ending: {formatCurrency(parseFloat(currentAccount.ending_balance || '0'), currentAccount.account_currency || 'USD')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Transactions Table */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Transactions ({currentAccount.transactions ? currentAccount.transactions.length : 0})
                        </h3>
                        
                        {currentAccount.transactions && currentAccount.transactions.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entity Name
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Debit
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Credit
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Page
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {currentAccount.transactions.map((transaction, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {transaction.date || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {transaction.description || 'No description'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                      {transaction.entity_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                                      {transaction.debit_amount ? formatCurrency(parseFloat(transaction.debit_amount), currentAccount.account_currency || 'USD') : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                      {transaction.credit_amount ? formatCurrency(parseFloat(transaction.credit_amount), currentAccount.account_currency || 'USD') : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                                      {transaction.balance || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                      {transaction.page_number || 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No transactions found for this account.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">No account data found or data is in an unexpected format.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Select a file to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 