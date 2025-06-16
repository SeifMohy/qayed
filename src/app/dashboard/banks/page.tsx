'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon, PlusIcon, DocumentArrowUpIcon, BuildingLibraryIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/hooks/useUploadedSources'
import UploadModal from '@/components/upload/upload-modal'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'
import { processBankStatements } from '@/components/upload/BankStatementUploader'
import { isFacilityAccount, getFacilityDisplayType } from '@/utils/bankStatementUtils'
import { formatCurrencyByCode, formatEGP } from '@/lib/format'

type Bank = {
  id: number;
  name: string;
  cashBalance: string;
  bankPayments: string;
  lastUpdate: string;
  currency: string;
}

type CreditFacility = {
  id: number;
  name: string;
  bankId?: number;
  facilityType: string;
  limit: string;
  used: string;
  available: string;
  interestRate: string;
  tenor: string;
  currency: string;
}

// New type for grouped credit facilities
type GroupedCreditFacility = {
  bankName: string;
  bankId: number;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  facilityCount: number;
  facilities: CreditFacility[];
  currency: string;
}

type Transaction = {
  id: number;
  bank: string;
  date: string;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
  currency: string;
}

const defaultBankAccounts: Bank[] = [
  {
    id: 1,
    name: 'First National Bank',
    cashBalance: '$758,492.32',
    bankPayments: '$42,000.00',
    lastUpdate: 'Today at 9:41 AM',
    currency: 'USD',
  },
  {
    id: 2,
    name: 'Central Finance',
    cashBalance: '$245,872.12',
    bankPayments: '$18,750.00',
    lastUpdate: 'Today at 9:41 AM',
    currency: 'USD',
  },
  {
    id: 3,
    name: 'International Banking',
    cashBalance: '$419,617.65',
    bankPayments: '$0.00',
    lastUpdate: 'Today at 9:41 AM',
    currency: 'USD',
  },
]

const defaultCreditFacilities: CreditFacility[] = [
  {
    id: 1,
    name: 'First National Bank',
    facilityType: 'Line of Credit',
    limit: '$1,000,000.00',
    used: '$350,000.00',
    available: '$650,000.00',
    interestRate: '5.25%',
    tenor: '5 years',
    currency: 'USD',
  },
  {
    id: 2,
    name: 'Central Finance',
    facilityType: 'Term Loan',
    limit: '$500,000.00',
    used: '$500,000.00',
    available: '$0.00',
    interestRate: '4.75%',
    tenor: '3 years',
    currency: 'USD',
  },
]

const defaultRecentTransactions: Transaction[] = [
  {
    id: 1,
    bank: 'First National Bank',
    date: 'Jul 5, 2023',
    description: 'Payment from Enterprise Solutions',
    amount: '$86,000.00',
    type: 'credit',
    currency: 'USD',
  },
  {
    id: 2,
    bank: 'First National Bank',
    date: 'Jul 3, 2023',
    description: 'Payment to Tech Innovations Ltd',
    amount: '$42,000.00',
    type: 'debit',
    currency: 'USD',
  },
  {
    id: 3,
    bank: 'Central Finance',
    date: 'Jul 1, 2023',
    description: 'Quarterly Loan Payment',
    amount: '$18,750.00',
    type: 'debit',
    currency: 'USD',
  },
  {
    id: 4,
    bank: 'International Banking',
    date: 'Jun 28, 2023',
    description: 'Payment from Retail Chain Corp (EUR)',
    amount: '€32,450.00',
    type: 'credit',
    currency: 'EUR',
  },
  {
    id: 5,
    bank: 'First National Bank',
    date: 'Jun 25, 2023',
    description: 'Payment to Global Shipping Co.',
    amount: '$18,500.00',
    type: 'debit',
    currency: 'USD',
  },
]

export default function BanksPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();

  const [bankAccounts, setBankAccounts] = useState<Bank[]>(defaultBankAccounts);
  const [creditFacilities, setCreditFacilities] = useState<CreditFacility[]>(defaultCreditFacilities);
  const [groupedCreditFacilities, setGroupedCreditFacilities] = useState<GroupedCreditFacility[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalCash, setTotalCash] = useState<number>(0);
  const [totalObligations, setTotalObligations] = useState<number>(0);
  const [totalCreditAvailable, setTotalCreditAvailable] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [focusedComponent, setFocusedComponent] = useState<string | null>(null);
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  
  // Fetch bank statements from API
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch banks with their statements and transactions
        const response = await fetch('/api/banks');
        const data = await response.json();
        
        if (data.success && data.banks) {
          // Process the banks data (now async)
          await processBanksData(data.banks);
        } else {
          // If no data is available, use default data
          setBankAccounts(defaultBankAccounts);
          setCreditFacilities(defaultCreditFacilities);
          setGroupedCreditFacilities(groupCreditFacilities(defaultCreditFacilities));
          setRecentTransactions(defaultRecentTransactions);
        }
      } catch (error) {
        console.error('Error fetching bank data:', error);
        // Use default data on error
        setBankAccounts(defaultBankAccounts);
        setCreditFacilities(defaultCreditFacilities);
        setGroupedCreditFacilities(groupCreditFacilities(defaultCreditFacilities));
        setRecentTransactions(defaultRecentTransactions);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBankData();
    console.log(recentTransactions,'recentTransactions');
  }, []);
  
  // Helper function to format interest rate
  const formatInterestRate = (rate: string | null): string => {
    if (!rate || rate.trim() === '') return 'N/A';
    const cleanRate = rate.trim();
    // Only add % if it doesn't already contain % or other symbols
    if (cleanRate.includes('%') || cleanRate.includes('+') || cleanRate.toLowerCase().includes('prime') || cleanRate.toLowerCase().includes('libor') || cleanRate.toLowerCase().includes('variable')) {
      return cleanRate;
    }
    // If it's just a number, add %
    if (!isNaN(parseFloat(cleanRate))) {
      return `${cleanRate}%`;
    }
    return cleanRate;
  };

  // Helper function to format tenor
  const formatTenor = (tenor: string | null): string => {
    if (!tenor || tenor.trim() === '') return 'N/A';
    const cleanTenor = tenor.trim();
    // Only add 'days' if it doesn't already contain time units
    if (cleanTenor.toLowerCase().includes('day') || 
        cleanTenor.toLowerCase().includes('month') || 
        cleanTenor.toLowerCase().includes('year') || 
        cleanTenor.toLowerCase().includes('week') ||
        cleanTenor.toLowerCase().includes('revolving')) {
      return cleanTenor;
    }
    // If it's just a number, add 'days'
    if (!isNaN(parseFloat(cleanTenor))) {
      return `${cleanTenor} days`;
    }
    return cleanTenor;
  };
  
  // Helper function to group credit facilities by bank name
  const groupCreditFacilities = (facilities: CreditFacility[]): GroupedCreditFacility[] => {
    const facilitiesGroupedByBank = facilities.reduce((groups: { [key: string]: CreditFacility[] }, facility) => {
      const bankName = facility.name;
      if (!groups[bankName]) {
        groups[bankName] = [];
      }
      groups[bankName].push(facility);
      return groups;
    }, {});
    
    return Object.entries(facilitiesGroupedByBank).map(([bankName, bankFacilities]) => {
      // Use the bankId from the first facility in the group (they should all have the same bankId)
      const bankId = bankFacilities[0]?.bankId || 1; // Fallback to 1 if not found
      
      const totalLimit = bankFacilities.reduce((sum, facility) => {
        const limitValue = facility.limit === 'N/A' ? 0 : parseFloat(facility.limit.replace(/[^0-9.-]/g, ''));
        return sum + (isNaN(limitValue) ? 0 : limitValue);
      }, 0);
      
      const totalUsed = bankFacilities.reduce((sum, facility) => {
        const usedValue = parseFloat(facility.used.replace(/[^0-9.-]/g, ''));
        return sum + (isNaN(usedValue) ? 0 : usedValue);
      }, 0);
      
      const totalAvailable = bankFacilities.reduce((sum, facility) => {
        const availableValue = facility.available === 'N/A' ? 0 : parseFloat(facility.available.replace(/[^0-9.-]/g, ''));
        return sum + (isNaN(availableValue) ? 0 : availableValue);
      }, 0);
      
      return {
        bankName,
        bankId,
        totalLimit,
        totalUsed,
        totalAvailable,
        facilityCount: bankFacilities.length,
        facilities: bankFacilities,
        currency: 'EGP' // All facilities now in EGP
      };
    });
  };
  
  // Process banks data from the new API
  const processBanksData = async (banks: any[]) => {
    if (!banks || banks.length === 0) {
      return;
    }
    
    // Process banks for display
    const processedBanks: Bank[] = [];
    let totalPositiveBalance = 0;
    let totalNegativeBalance = 0;
    let totalAvailableCredit = 0;
    const allTransactions: any[] = [];
    const facilityBankStatements: any[] = [];
    
    // Process each bank
    for (const bank of banks) {
      let totalCashBalanceEGP = 0;
      let bankFacilityBalanceEGP = 0; // Track facility balance per bank in EGP
      let latestUpdate = new Date(0);
      
      console.log(`\n🏦 Processing bank: ${bank.name}`);
      
      // Process each bank statement
      for (const statement of bank.bankStatements) {
        const endingBalance = parseFloat(statement.endingBalance?.toString() || '0');
        const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
        
        console.log(`  📋 Statement ${statement.id}: ${endingBalance} ${statementCurrency} (Account: ${statement.accountNumber})`);
        
        // Convert amount to EGP if needed
        let balanceInEGP = endingBalance;
        if (statementCurrency !== 'EGP' && endingBalance !== 0) {
          try {
            // Convert to EGP using the currency conversion API
            const response = await fetch('/api/currency/convert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: Math.abs(endingBalance),
                fromCurrency: statementCurrency,
                toCurrency: 'EGP'
              }),
            });
            
            const conversionData = await response.json();
            if (conversionData.success) {
              balanceInEGP = endingBalance < 0 ? -conversionData.conversion.convertedAmount : conversionData.conversion.convertedAmount;
              console.log(`💱 Converted ${endingBalance} ${statementCurrency} to ${balanceInEGP} EGP for ${bank.name}`);
            } else {
              // Fallback to a default exchange rate if conversion fails
              const defaultRate = statementCurrency === 'USD' ? 50 : 1; // 50 EGP per USD as per user's calculation
              balanceInEGP = endingBalance * defaultRate;
              console.log(`⚠️ Using default rate for ${statementCurrency}: ${endingBalance} × ${defaultRate} = ${balanceInEGP} EGP`);
            }
          } catch (error) {
            console.error('Currency conversion error:', error);
            // Fallback to default rate
            const defaultRate = statementCurrency === 'USD' ? 50 : 1;
            balanceInEGP = endingBalance * defaultRate;
            console.log(`❌ Conversion failed, using default rate: ${endingBalance} × ${defaultRate} = ${balanceInEGP} EGP`);
          }
        }
        
        // Determine if this is a facility account using the new logic
        const isFacility = isFacilityAccount(statement.accountType, endingBalance);
        
        console.log(`  💳 Account Type: ${statement.accountType}, Is Facility: ${isFacility}, Balance in EGP: ${balanceInEGP}`);
        
        if (isFacility) {
          const facilityAmountEGP = Math.abs(balanceInEGP);
          bankFacilityBalanceEGP += facilityAmountEGP;
          totalNegativeBalance += facilityAmountEGP;
          
          console.log(`  🏭 Facility: +${facilityAmountEGP} to bank facilities, total bank facilities: ${bankFacilityBalanceEGP}`);
          
          // Add to facility bank statements
          if (facilityAmountEGP !== 0) facilityBankStatements.push({
            ...statement,
            endingBalanceEGP: balanceInEGP
          });
          
          // Add available credit from facility available limit
          if (statement.availableLimit) {
            let availableLimitEGP = parseFloat(statement.availableLimit?.toString() || '0');
            if (statementCurrency !== 'EGP' && availableLimitEGP !== 0) {
              try {
                const response = await fetch('/api/currency/convert', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: availableLimitEGP,
                    fromCurrency: statementCurrency,
                    toCurrency: 'EGP'
                  }),
                });
                
                const conversionData = await response.json();
                if (conversionData.success) {
                  availableLimitEGP = conversionData.conversion.convertedAmount;
                }
              } catch (error) {
                console.error('Limit conversion error:', error);
                const defaultRate = statementCurrency === 'USD' ? 50 : 1;
                availableLimitEGP = availableLimitEGP * defaultRate;
              }
            }
            
            if (availableLimitEGP > 0) {
              // Available credit = Total Limit - Used Amount
              const availableCredit = Math.max(0, availableLimitEGP - facilityAmountEGP);
              totalAvailableCredit += availableCredit;
            }
          }
        } else {
          // Regular account - both positive and negative balances contribute to cash position
          totalCashBalanceEGP += balanceInEGP; // This can be negative for current accounts
          totalPositiveBalance += balanceInEGP; // Include negative balances in total cash calculation
          
          console.log(`  🏦 Regular Account: +${balanceInEGP} to bank cash, bank total: ${totalCashBalanceEGP}, global total: ${totalPositiveBalance}`);
        }
        
        // Track the latest update date
        const statementEndDate = new Date(statement.statementPeriodEnd);
        if (statementEndDate > latestUpdate) {
          latestUpdate = statementEndDate;
        }
        
        // Collect transactions for this statement
        if (statement.transactions && statement.transactions.length > 0) {
          console.log(statement.transactions,'statement.transactions');
          statement.transactions.forEach((transaction: any) => {
            allTransactions.push({
              ...transaction,
              bankName: bank.name,
              statementId: statement.id
            });
          });
        }
      }
      
      console.log(`🏦 ${bank.name} FINAL: Cash=${formatEGP(totalCashBalanceEGP)}, Facilities=${formatEGP(bankFacilityBalanceEGP)}`);
      
      // Add bank to processed banks using EGP currency
      processedBanks.push({
        id: bank.id,
        name: bank.name,
        cashBalance: formatEGP(totalCashBalanceEGP),
        bankPayments: formatEGP(bankFacilityBalanceEGP),
        lastUpdate: latestUpdate.toLocaleDateString(),
        currency: 'EGP'
      });
    }
    
    console.log('All collected transactions:', allTransactions);
    
    // Debug: Verify total calculation by summing up displayed bank balances
    const manualTotal = processedBanks.reduce((sum, bank) => {
      const balance = parseFloat(bank.cashBalance.replace(/[^0-9.-]/g, ''));
      console.log(`🏦 ${bank.name}: ${bank.cashBalance} (parsed: ${balance})`);
      return sum + balance;
    }, 0);
    
    console.log('🧮 Manual total from displayed balances:', formatEGP(manualTotal));
    console.log('🏧 System calculated total:', formatEGP(totalPositiveBalance));
    console.log('📊 Difference:', formatEGP(Math.abs(manualTotal - totalPositiveBalance)));
    
    if (Math.abs(manualTotal - totalPositiveBalance) > 0.01) {
      console.warn('⚠️ MISMATCH: Manual calculation does not match system total!');
    } else {
      console.log('✅ VERIFIED: Manual calculation matches system total');
    }
    
    // Set total cash, obligations, and available credit
    setTotalCash(totalPositiveBalance);
    setTotalObligations(totalNegativeBalance);
    setTotalCreditAvailable(totalAvailableCredit);
    
    // Update banks state
    setBankAccounts(processedBanks);
    
    // Process credit facilities from facility accounts (convert to EGP)
    const processedFacilities: CreditFacility[] = [];
    for (const statement of facilityBankStatements) {
      const facilityBalance = Math.abs(statement.endingBalanceEGP || 0);
      let availableLimitEGP = 0;
      
      if (statement.availableLimit) {
        availableLimitEGP = parseFloat(statement.availableLimit?.toString() || '0');
        const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
        
        if (statementCurrency !== 'EGP' && availableLimitEGP !== 0) {
          try {
            const response = await fetch('/api/currency/convert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: availableLimitEGP,
                fromCurrency: statementCurrency,
                toCurrency: 'EGP'
              }),
            });
            
            const conversionData = await response.json();
            if (conversionData.success) {
              availableLimitEGP = conversionData.conversion.convertedAmount;
            }
          } catch (error) {
            const defaultRate = statementCurrency === 'USD' ? 50 : 1;
            availableLimitEGP = availableLimitEGP * defaultRate;
          }
        }
      }
      
      // Find the bank that contains this statement to get the correct bank ID
      const parentBank = banks.find(bank => 
        bank.bankStatements.some((bs: any) => bs.id === statement.id)
      );
      
      processedFacilities.push({
        id: statement.id,
        name: statement.bankName,
        bankId: parentBank ? parentBank.id : 1,
        facilityType: getFacilityDisplayType(statement.accountType, parseFloat(statement.endingBalance?.toString() || '0')),
        limit: availableLimitEGP > 0 ? formatEGP(availableLimitEGP) : 'N/A',
        used: formatEGP(facilityBalance),
        available: availableLimitEGP > 0 
          ? formatEGP(Math.max(0, availableLimitEGP - facilityBalance))
          : 'N/A',
        interestRate: formatInterestRate(statement.interestRate),
        tenor: formatTenor(statement.tenor),
        currency: 'EGP'
      });
    }
    
    setCreditFacilities(processedFacilities);
    
    // Group credit facilities by bank name using the helper function
    setGroupedCreditFacilities(groupCreditFacilities(processedFacilities));
    
    // Process recent transactions (convert to EGP)
    console.log(allTransactions,'allTransactions');
    const sortedTransactions = allTransactions.sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    ).slice(0, 5);
    
    console.log('Sorted transactions:', sortedTransactions);
    
    const processedTransactions: Transaction[] = [];
    for (const [index, transaction] of sortedTransactions.entries()) {
      console.log('Processing transaction:', transaction);
      
      const isCredit = parseFloat(transaction.creditAmount || '0') > 0;
      let amount = isCredit 
        ? parseFloat(transaction.creditAmount || '0') 
        : parseFloat(transaction.debitAmount || '0');
      
      // Convert transaction amount to EGP if needed
      const transactionCurrency = transaction.currency || 'EGP';
      if (transactionCurrency !== 'EGP' && amount !== 0) {
        try {
          const response = await fetch('/api/currency/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amount,
              fromCurrency: transactionCurrency,
              toCurrency: 'EGP'
            }),
          });
          
          const conversionData = await response.json();
          if (conversionData.success) {
            amount = conversionData.conversion.convertedAmount;
          }
        } catch (error) {
          const defaultRate = transactionCurrency === 'USD' ? 50 : 1;
          amount = amount * defaultRate;
        }
      }
      
      const processedTransaction = {
        id: index,
        bank: transaction.bankName,
        date: new Date(transaction.transactionDate).toLocaleDateString(),
        description: transaction.description || 'Unknown Transaction',
        amount: formatEGP(amount),
        type: (isCredit ? 'credit' : 'debit') as 'credit' | 'debit',
        currency: 'EGP'
      };
      
      console.log('Processed transaction:', processedTransaction);
      processedTransactions.push(processedTransaction);
    }
    
    console.log('Final processed transactions:', processedTransactions);
    setRecentTransactions(processedTransactions);
  };
  
  // Format currency (updated to always use EGP)
  const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
    return formatEGP(amount);
  };
  
  const handleFilesChange = (sourceId: string, files: File[]) => {
    // Validate PDF files for bank statements
    if (sourceId === 'bankStatements') {
      const invalidFiles = files.filter(file => !file.type.includes('pdf'));
      if (invalidFiles.length > 0) {
        alert(`Please select only PDF files for bank statements. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
    }
    
    setSourceFiles(prev => ({
      ...prev,
      [sourceId]: files
    }));
  };
  
  const handleSubmitFiles = () => {
    // Get all source IDs that have files selected
    const sourceIds = Object.keys(sourceFiles).filter(id => sourceFiles[id] && sourceFiles[id].length > 0);
    
    if (sourceIds.length === 0) return;
    
    // Check if bank statements are being uploaded
    const hasBankStatements = sourceIds.includes('bankStatements');
    
    if (hasBankStatements) {
      // Handle bank statement processing
      handleBankStatementProcessing(sourceFiles['bankStatements'] || []);
    } else {
      // Handle regular file uploads
      handleRegularFileUploads(sourceIds);
    }
  };
  
  const handleBankStatementProcessing = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    
    try {
      setIsUploading('processing');
      
      // Process bank statements
      await processBankStatements(files);
      
      // Mark as uploaded and clear files
      const newUploadedSources = { ...uploadedSources };
      newUploadedSources['bankStatements'] = true;
      setUploadedSources(newUploadedSources);
      
      // Clear the bank statement files
      const newSourceFiles = { ...sourceFiles };
      delete newSourceFiles['bankStatements'];
      setSourceFiles(newSourceFiles);
      
      // Close modal after short delay
      setTimeout(() => {
        setIsUploadModalOpen(false);
        // Refresh the page to show updated data
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error processing bank statements:', error);
      alert(`Error processing bank statements: ${error.message}`);
      // Keep the modal open to show the error
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleRegularFileUploads = (sourceIds: string[]) => {
    // Start uploading process
    setIsUploading('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      const newUploadedSources = { ...uploadedSources };
      const newSourceFiles = { ...sourceFiles };
      
      // Mark all sources with selected files as uploaded
      sourceIds.forEach(id => {
        newUploadedSources[id] = true;
        // Only clear the source files that were successfully uploaded
        delete newSourceFiles[id];
      });
      
      setUploadedSources(newUploadedSources);
      setSourceFiles(newSourceFiles);
      setIsUploading(null);
      // Keep modal open to allow for more uploads
      if (Object.keys(newSourceFiles).length === 0) {
        setIsUploadModalOpen(false);
      }
    }, 2000);
  };
  
  const renderSourceContent = (source: { id: string, name: string }) => {
    if (source.id === 'bankStatements') {
      return (
        <div className="mt-3">
          <MultiFileUpload
            onFilesChange={(files) => handleFilesChange(source.id, files)}
            maxFiles={10}
            maxSize={50}
            accept=".pdf"
            label=""
            buttonText="Select PDF Files"
            disabled={isUploading === 'processing'}
            compact={isDataSourceUploaded(source.id)}
          />
          
          {sourceFiles[source.id]?.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {sourceFiles[source.id].length} bank statement {sourceFiles[source.id].length === 1 ? 'file' : 'files'} selected
              </p>
            </div>
          )}
        </div>
      );
    }
    
    const hasUploadedFiles = isDataSourceUploaded(source.id);
    const hasSelectedFiles = sourceFiles[source.id]?.length > 0;
    
    return (
      <div className="mt-3">
        {hasUploadedFiles && (
          <div className="mb-2 flex items-center">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 mr-3">
              Uploaded
            </span>
            <span className="text-sm text-gray-500">You can upload additional files if needed</span>
          </div>
        )}
        
        <MultiFileUpload
          onFilesChange={(files) => handleFilesChange(source.id, files)}
          maxFiles={5}
          maxSize={10}
          accept=".xlsx,.xls,.csv,.pdf"
          label=""
          buttonText={hasUploadedFiles ? "Upload More Files" : "Select Files"}
          disabled={isUploading === 'processing'}
          compact={hasUploadedFiles} // Use compact mode if already uploaded
        />
        
        {hasSelectedFiles && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {sourceFiles[source.id].length} {sourceFiles[source.id].length === 1 ? 'file' : 'files'} selected
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Function to open modal with specific data sources
  const openUploadModal = (componentId?: string) => {
    if (componentId) {
      // Get only the data sources required for this component
      setActiveDataSources(getSourcesForComponent(componentId));
    } else {
      // Show all data sources when opening from the main button
      setActiveDataSources([]);
    }
    // Keep the sourceFiles state intact when opening the modal
    setIsUploadModalOpen(true);
  };
  
  // Get the filtered data sources to display in the modal
  const getFilteredDataSources = () => {
    if (activeDataSources.length === 0) {
      // Show all bank page data sources if none specifically selected
      return PAGE_DATA_SOURCES.banks;
    }
    // Filter to show only the active data sources
    return ALL_DATA_SOURCES.filter(source => 
      activeDataSources.includes(source.id)
    );
  };
  
  // Determine upload button text based on data sources
  const getUploadButtonText = () => {
    const hasBankStatements = Object.keys(sourceFiles).includes('bankStatements') && 
                             sourceFiles['bankStatements']?.length > 0;
    
    if (hasBankStatements) {
      return isUploading === 'processing' ? 'Processing Bank Statements...' : 'Process Bank Statements';
    }
    
    return isUploading === 'processing' ? 'Processing...' : 'Upload Files';
  };

  const areAllSourcesUploaded = PAGE_DATA_SOURCES.banks.every(source => isDataSourceUploaded(source.id));
  
  // Determine what data sections to show based on data availability
  const isBanksVisible = !isLoading && (bankAccounts.length > 0 || isDataSourceUploaded('bankStatements'));
  const isCreditFacilitiesVisible = !isLoading && (groupedCreditFacilities.length > 0 || isDataSourceUploaded('bankPosition'));
  const isTransactionsVisible = !isLoading && (recentTransactions.length > 0 || isDataSourceUploaded('bankStatements'));
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Banks & Accounts</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => window.location.reload()}
          >
            <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Refresh Data
          </button>
          <button
            type="button"
            onClick={() => openUploadModal()}
            className="ml-3 inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
          >
            <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Upload Bank Data
          </button>
        </div>
      </div>

      {/* Upload Modal using the shared component */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          // Don't reset sourceFiles to keep state between modal opens
        }}
        title="Upload Bank Data"
        description="Please upload your bank data sources below. You can upload multiple files for each data source."
        dataSources={getFilteredDataSources()}
        isUploading={isUploading}
        onSubmit={handleSubmitFiles}
        isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
        renderSourceContent={renderSourceContent}
        customButtonText={getUploadButtonText()}
      />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !isBanksVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('bankAccounts')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Statements
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Total Cash on Hand"
            value={formatEGP(totalCash)}
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            iconColor="bg-blue-500"
          />
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !isCreditFacilitiesVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('recentTransactions')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Data
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Bank Obligations"
            value={formatEGP(totalObligations)}
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            )}
            iconColor="bg-red-500"
          />
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !isCreditFacilitiesVisible && totalCreditAvailable === 0 && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('creditFacilities')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Position
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Total Credit Available"
            value={totalCreditAvailable > 0 ? formatEGP(totalCreditAvailable) : 'N/A'}
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            iconColor="bg-green-500"
          />
        </div>

      </div>

      {/* Bank Accounts */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Banks</h2>
      {isLoading ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bank accounts...</p>
          </div>
        </div>
      ) : !isBanksVisible ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No bank data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload Bank Statements to view your banking information.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openUploadModal('bankAccounts')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Statements
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Bank Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Cash Balance
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Bank Obligations
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Last Updated
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bankAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {account.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{account.cashBalance}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{account.bankPayments}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{account.lastUpdate}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link 
                      href={`/dashboard/banks/${account.id}`} 
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {account.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Credit Facilities */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Credit Facilities</h2>
      {isLoading ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading credit facilities...</p>
          </div>
        </div>
      ) : !isCreditFacilitiesVisible ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No facility data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload Bank Position data to view your credit facilities.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openUploadModal('creditFacilities')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Position
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Bank Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Limit
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Used
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Available
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Facilities Count
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {groupedCreditFacilities.map((group, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {group.bankName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                    {group.totalLimit > 0 ? formatEGP(group.totalLimit) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                    {formatEGP(group.totalUsed)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                    {group.totalAvailable > 0 ? formatEGP(group.totalAvailable) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {group.facilityCount} {group.facilityCount === 1 ? 'facility' : 'facilities'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link 
                      href={`/dashboard/banks/${group.bankId}?tab=facilities`}
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {group.bankName}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Transactions */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Recent Transactions</h2>
      {isLoading ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      ) : !isTransactionsVisible ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No transaction data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload Bank Statements to view recent transactions.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openUploadModal('recentTransactions')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Statements
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Bank
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {transaction.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{transaction.bank}</td>
                  <td className="px-3 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className={clsx(
                    'whitespace-nowrap px-3 py-4 text-sm text-right font-medium',
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {transaction.type === 'credit' ? '+' : '-'} {transaction.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}