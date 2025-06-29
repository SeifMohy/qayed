'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon, PlusIcon, DocumentArrowUpIcon, BuildingLibraryIcon, BanknotesIcon, CreditCardIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/hooks/useUploadedSources'
import UploadModal from '@/components/upload/upload-modal'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'
import { processBankStatements } from '@/components/upload/BankStatementUploader'
import { isFacilityAccount, getFacilityDisplayType } from '@/utils/bankStatementUtils'
import { formatCurrencyByCode, formatEGP, formatEGPForKeyCard } from '@/lib/format'
import { currencyCache } from '@/lib/services/currencyCache'

type Bank = {
  id: number;
  name: string;
  cashBalance: string;
  bankPayments: string;
  lastUpdate: string;
  currency: string;
  updateStatus?: 'current' | 'slightly_behind' | 'needs_update' | 'no_data';
  daysBehind?: number;
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

// New interface for metadata
interface BanksMetadata {
  referenceDate: string;
  referenceDateFormatted: string;
  bankName: string;
  accountNumber?: string;
  note: string;
  totalBanks: number;
  banksNeedingUpdate: number;
  banksSlightlyBehind: number;
}

export default function BanksPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();

  const [bankAccounts, setBankAccounts] = useState<Bank[]>([]);
  const [creditFacilities, setCreditFacilities] = useState<CreditFacility[]>([]);
  const [groupedCreditFacilities, setGroupedCreditFacilities] = useState<GroupedCreditFacility[]>([]);
  const [totalCash, setTotalCash] = useState<number>(0);
  const [totalObligations, setTotalObligations] = useState<number>(0);
  const [totalCreditAvailable, setTotalCreditAvailable] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [focusedComponent, setFocusedComponent] = useState<string | null>(null);
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<BanksMetadata | null>(null);
  
  // Fetch bank statements from API
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch banks with their statements and transactions
        const response = await fetch('/api/banks');
        const data = await response.json();
        
        if (data.success && data.banks && data.banks.length > 0) {
          // Process the banks data (now async)
          await processBanksData(data.banks);
          
          // Set metadata
          if (data.metadata) {
            setMetadata(data.metadata);
          }
        } else {
          // If no data is available, leave arrays empty
          console.log('No bank data available from database');
          setBankAccounts([]);
          setCreditFacilities([]);
          setGroupedCreditFacilities([]);
        }
      } catch (error) {
        console.error('Error fetching bank data:', error);
        // On error, leave arrays empty instead of using defaults
        setBankAccounts([]);
        setCreditFacilities([]);
        setGroupedCreditFacilities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBankData();
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

  // Helper function to get status indicator
  const getStatusIndicator = (status?: string, daysBehind?: number) => {
    switch (status) {
      case 'current':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Current
          </span>
        );
      case 'slightly_behind':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            {daysBehind} days behind
          </span>
        );
      case 'needs_update':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Needs update ({daysBehind} days)
          </span>
        );
      case 'no_data':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            No data
          </span>
        );
      default:
        return null;
    }
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

    // First, collect all unique currencies from bank statements
    const uniqueCurrencies = new Set<string>();
    for (const bank of banks) {
      for (const statement of bank.bankStatements) {
        const statementCurrency = statement.accountCurrency?.trim() || 'EGP';
        uniqueCurrencies.add(statementCurrency);
      }
    }

    // Preload all currency rates in one API call
    const currencyList = Array.from(uniqueCurrencies).filter(currency => currency !== 'EGP');
    if (currencyList.length > 0) {
      console.log('🔄 Bank Page - Preloading currency rates for:', currencyList);
      await currencyCache.preloadRates(currencyList);
    }
    
    // Process banks for display
    const processedBanks: Bank[] = [];
    let totalPositiveBalance = 0;
    let totalNegativeBalance = 0;
    let totalAvailableCredit = 0;
    const facilityBankStatements: any[] = [];
    
    // Process each bank
    for (const bank of banks) {
      let totalCashBalanceEGP = 0;
      let bankFacilityBalanceEGP = 0; // Track facility balance per bank in EGP
      let latestUpdate = new Date(0);
      
      console.log(`\n🏦 Processing bank: ${bank.name}`);
      
      // Group bank statements by account number to get latest statement for each account
      const accountGroups = bank.bankStatements.reduce((groups: { [key: string]: any[] }, statement: any) => {
        const accountNumber = statement.accountNumber;
        if (!groups[accountNumber]) {
          groups[accountNumber] = [];
        }
        groups[accountNumber].push(statement);
        return groups;
      }, {});
      
      // Process latest statement for each unique account
      for (const [accountNumber, statements] of Object.entries(accountGroups)) {
        // Get the statement with the latest end date for this account
        const latestStatement = (statements as any[]).reduce((latest: any, current: any) => {
          return new Date(current.statementPeriodEnd) > new Date(latest.statementPeriodEnd) 
            ? current 
            : latest;
        });
        
        const endingBalance = parseFloat(latestStatement.endingBalance?.toString() || '0');
        const statementCurrency = latestStatement.accountCurrency?.trim() || 'EGP';
        
        console.log(`  📋 Latest Statement for Account ${accountNumber}: ${endingBalance} ${statementCurrency} (Date: ${latestStatement.statementPeriodEnd})`);
        
        // Convert amount to EGP if needed using cached rates
        let balanceInEGP = endingBalance;
        if (statementCurrency !== 'EGP' && endingBalance !== 0) {
          try {
            const conversion = await currencyCache.convertCurrency(
              Math.abs(endingBalance),
              statementCurrency,
              'EGP'
            );
            
            balanceInEGP = endingBalance < 0 ? -conversion.convertedAmount : conversion.convertedAmount;
            console.log(`💱 Converted ${endingBalance} ${statementCurrency} to ${balanceInEGP} EGP for ${bank.name} (cached)`);
          } catch (error) {
            console.error('Currency conversion error:', error);
            // Fallback to default rate
            const defaultRate = statementCurrency === 'USD' ? 50 : 1;
            balanceInEGP = endingBalance * defaultRate;
            console.log(`❌ Conversion failed, using default rate: ${endingBalance} × ${defaultRate} = ${balanceInEGP} EGP`);
          }
        }
        
        // Determine if this is a facility account using the new logic
        const isFacility = isFacilityAccount(latestStatement.accountType, endingBalance);
        
        console.log(`  💳 Account Type: ${latestStatement.accountType}, Is Facility: ${isFacility}, Balance in EGP: ${balanceInEGP}`);
        
        if (isFacility) {
          const facilityAmountEGP = Math.abs(balanceInEGP);
          bankFacilityBalanceEGP += facilityAmountEGP;
          totalNegativeBalance += facilityAmountEGP;
          
          console.log(`  🏭 Facility: +${facilityAmountEGP} to bank facilities, total bank facilities: ${bankFacilityBalanceEGP}`);
          
          // Add to facility bank statements for later processing
          if (facilityAmountEGP !== 0) {
            facilityBankStatements.push({
              ...latestStatement,
              endingBalanceEGP: balanceInEGP,
              bankName: bank.name
            });
          }
          
          // Add available credit from facility available limit
          if (latestStatement.availableLimit) {
            let availableLimitEGP = parseFloat(latestStatement.availableLimit?.toString() || '0');
            if (statementCurrency !== 'EGP' && availableLimitEGP !== 0) {
              try {
                const conversion = await currencyCache.convertCurrency(
                  availableLimitEGP,
                  statementCurrency,
                  'EGP'
                );
                availableLimitEGP = conversion.convertedAmount;
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
        const statementEndDate = new Date(latestStatement.statementPeriodEnd);
        if (statementEndDate > latestUpdate) {
          latestUpdate = statementEndDate;
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
        currency: 'EGP',
        updateStatus: bank.updateStatus,
        daysBehind: bank.daysBehind
      });
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
            const conversion = await currencyCache.convertCurrency(
              availableLimitEGP,
              statementCurrency,
              'EGP'
            );
            availableLimitEGP = conversion.convertedAmount;
          } catch (error) {
            console.error('Facility limit conversion error:', error);
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
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banks & Accounts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your bank accounts, balances, and credit facilities
          </p>
        </div>
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

      {/* Reference Date Information */}
      {metadata && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Data as of <span className="font-semibold">{metadata.referenceDateFormatted}</span>
              </p>
              {(metadata.banksNeedingUpdate > 0 || metadata.banksSlightlyBehind > 0) && (
                <p className="mt-1 text-sm text-blue-700">
                  {metadata.banksNeedingUpdate > 0 && (
                    <span className="text-red-700">
                      {metadata.banksNeedingUpdate} bank{metadata.banksNeedingUpdate > 1 ? 's' : ''} need{metadata.banksNeedingUpdate === 1 ? 's' : ''} updating
                    </span>
                  )}
                  {metadata.banksNeedingUpdate > 0 && metadata.banksSlightlyBehind > 0 && ', '}
                  {metadata.banksSlightlyBehind > 0 && (
                    <span className="text-yellow-700">
                      {metadata.banksSlightlyBehind} bank{metadata.banksSlightlyBehind > 1 ? 's' : ''} slightly behind
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
            value={formatEGPForKeyCard(totalCash)}
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
                onClick={() => openUploadModal('bankObligations')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Bank Data
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Bank Obligations"
            value={formatEGPForKeyCard(totalObligations)}
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
            value={totalCreditAvailable > 0 ? formatEGPForKeyCard(totalCreditAvailable) : 'N/A'}
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
                  Status
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {getStatusIndicator(account.updateStatus, account.daysBehind)}
                  </td>
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
    </div>
  )
}