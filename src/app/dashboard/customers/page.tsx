'use client'

import { useState } from 'react'
import { ArrowPathIcon, PlusIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/key-figure-card'
import { useUploadedSources } from '../layout'
import UploadModal from '@/components/upload-modal'
import MultiFileUpload from '@/components/multi-file-upload'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/utils/data-sources'

// Mock customer data
const customers = [
  {
    id: 1,
    name: 'Enterprise Solutions',
    totalReceivables: '$86,000',
    overdueAmount: '$0',
    lastPayment: 'Jun 28, 2023',
    nextPayment: 'Jul 13, 2023',
    status: 'On Time',
  },
  {
    id: 2,
    name: 'Retail Chain Corp',
    totalReceivables: '$34,200',
    overdueAmount: '$0',
    lastPayment: 'Jun 15, 2023',
    nextPayment: 'Jul 18, 2023',
    status: 'On Time',
  },
  {
    id: 3,
    name: 'Digital Services LLC',
    totalReceivables: '$27,500',
    overdueAmount: '$5,200',
    lastPayment: 'May 30, 2023',
    nextPayment: 'Jul 22, 2023',
    status: 'Overdue',
  },
  {
    id: 4,
    name: 'Financial Partners',
    totalReceivables: '$52,300',
    overdueAmount: '$0',
    lastPayment: 'Jun 25, 2023',
    nextPayment: 'Jul 30, 2023',
    status: 'On Time',
  },
]

export default function CustomersPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  
  const handleFilesChange = (sourceId: string, files: File[]) => {
    setSourceFiles(prev => ({
      ...prev,
      [sourceId]: files
    }));
  };
  
  const handleSubmitFiles = () => {
    // Get all source IDs that have files selected
    const sourceIds = Object.keys(sourceFiles).filter(id => sourceFiles[id] && sourceFiles[id].length > 0);
    
    if (sourceIds.length === 0) return;
    
    // Start uploading process
    setIsUploading('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      const newUploadedSources = { ...uploadedSources };
      
      // Mark all sources with selected files as uploaded
      sourceIds.forEach(id => {
        newUploadedSources[id] = true;
      });
      
      setUploadedSources(newUploadedSources);
      setIsUploading(null);
      setSourceFiles({});
      setIsUploadModalOpen(false);
    }, 2000);
  };
  
  const renderSourceContent = (source: { id: string, name: string }) => {
    if (isDataSourceUploaded(source.id)) {
      return (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
            Uploaded
          </span>
        </div>
      );
    }
    
    return (
      <div className="mt-3">
        <MultiFileUpload
          onFilesChange={(files) => handleFilesChange(source.id, files)}
          maxFiles={5}
          maxSize={10}
          accept=".xlsx,.xls,.csv"
          label=""
          buttonText="Select Files"
          disabled={isUploading === 'processing'}
        />
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
    setIsUploadModalOpen(true);
  };
  
  // Get the filtered data sources to display in the modal
  const getFilteredDataSources = () => {
    if (activeDataSources.length === 0) {
      // Show all customer page data sources if none specifically selected
      return PAGE_DATA_SOURCES.customers;
    }
    // Filter to show only the active data sources
    return ALL_DATA_SOURCES.filter(source => 
      activeDataSources.includes(source.id)
    );
  };
  
  const isCustomersDataVisible = isDataSourceUploaded('accountsReceivable');
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            disabled={!isCustomersDataVisible}
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
            Upload Customer Data
          </button>
        </div>
      </div>

      {/* Upload Modal using the shared component */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSourceFiles({});
          setActiveDataSources([]);
        }}
        title="Upload Customer Data"
        description="Please upload your customer data files below. You can upload multiple files for each data source."
        dataSources={getFilteredDataSources()}
        isUploading={isUploading}
        onSubmit={handleSubmitFiles}
        isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
        renderSourceContent={renderSourceContent}
      />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative">
          {!isCustomersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('customerList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Receivable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Total Receivables"
            value="$200,000"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
            iconColor="bg-blue-500"
          />
        </div>

        <div className="relative">
          {!isCustomersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('customerList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Receivable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Average Payment Time"
            value="23 days"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            iconColor="bg-green-500"
          />
        </div>

        <div className="relative">
          {!isCustomersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('customerList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Receivable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Overdue Receivables"
            value="$5,200"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            iconColor="bg-red-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">All Customers</h2>
      {!isCustomersDataVisible ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No customer data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload Accounts Receivable data to view your customers.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openUploadModal('customerList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Receivable
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
                  Customer
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Receivables
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Overdue Amount
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Last Payment
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Next Payment
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {customer.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{customer.totalReceivables}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{customer.overdueAmount}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.lastPayment}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.nextPayment}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={clsx(
                      'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium',
                      customer.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link 
                      href={`/dashboard/customers/${customer.id}`} 
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {customer.name}</span>
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