'use client'

import { useState } from 'react'
import { ArrowPathIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '../layout'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import UploadModal from '@/components/upload/upload-modal'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'

const suppliers = [
  {
    id: 1,
    name: 'Tech Innovations Ltd',
    totalPayables: '$42,000',
    dueNext30Days: '$42,000',
    dueNext60Days: '$0',
    dueNext90Days: '$0',
    lastPayment: 'Jun 15, 2023',
    nextPayment: 'Jul 12, 2023',
    status: 'On Time',
  },
  {
    id: 2,
    name: 'Global Shipping Co.',
    totalPayables: '$18,500',
    dueNext30Days: '$18,500',
    dueNext60Days: '$0',
    dueNext90Days: '$0',
    lastPayment: 'Jun 10, 2023',
    nextPayment: 'Jul 15, 2023',
    status: 'On Time',
  },
  {
    id: 3,
    name: 'Office Supplies Inc.',
    totalPayables: '$3,250',
    dueNext30Days: '$3,250',
    dueNext60Days: '$0',
    dueNext90Days: '$0',
    lastPayment: 'Jun 5, 2023',
    nextPayment: 'Jul 20, 2023',
    status: 'On Time',
  },
  {
    id: 4,
    name: 'Manufacturing Partners',
    totalPayables: '$67,800',
    dueNext30Days: '$67,800',
    dueNext60Days: '$0',
    dueNext90Days: '$0',
    lastPayment: 'Jun 20, 2023',
    nextPayment: 'Jul 28, 2023',
    status: 'On Time',
  },
]

export default function SuppliersPage() {
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
  
  const handleSubmitFiles = async () => {
    const sourceIds = Object.keys(sourceFiles).filter(id => sourceFiles[id] && sourceFiles[id].length > 0);
    if (sourceIds.length === 0) return;
    setIsUploading('processing');
    
    const allInvoices: any[] = []; // Array to hold all invoice objects

    try {
      for (const id of sourceIds) {
        const files = sourceFiles[id];
        for (const file of files) {
          if (file.name.endsWith('.json')) {
            const text = await file.text();
            try {
              const json = JSON.parse(text);
              // If the JSON is an array of invoices, add them all
              if (Array.isArray(json)) {
                allInvoices.push(...json);
              } else {
                // Otherwise, assume it's a single invoice object
                allInvoices.push(json);
              }
            } catch (parseError) {
              console.error(`Error parsing JSON from file ${file.name}:`, parseError);
              // Optionally, inform the user about the specific file error
              alert(`Error parsing JSON from file ${file.name}. Please check its format.`);
              // Continue to next file or stop? For now, continue.
            }
          }
        }
      }

      if (allInvoices.length > 0) {
        console.log(`Uploading ${allInvoices.length} invoices in bulk.`);
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allInvoices), // Send the array of invoices
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }
        // Handle successful bulk upload response if needed
        // const result = await response.json(); 
        // console.log('Bulk upload successful:', result);
      }

      const newUploadedSources = { ...uploadedSources };
      sourceIds.forEach(id => {
        newUploadedSources[id] = true;
      });
      setUploadedSources(newUploadedSources);
      setIsUploading(null);
      setSourceFiles({});
      setIsUploadModalOpen(false);
    } catch (error) {
      setIsUploading(null);
      // Optionally show error to user
      alert('Error uploading file(s): ' + (error as Error).message);
    }
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
      // Show all supplier page data sources if none specifically selected
      return PAGE_DATA_SOURCES.suppliers;
    }
    // Filter to show only the active data sources
    return ALL_DATA_SOURCES.filter(source => 
      activeDataSources.includes(source.id)
    );
  };
  
  const isSuppliersDataVisible = isDataSourceUploaded('accountsPayable');
  
  const renderSourceContent = (source: { id: string, name: string }) => {
    // Always render the MultiFileUpload component inside the modal
    // The isDataSourceUploaded state is for the main page, not for the modal's active session.
    return (
      <div className="mt-3">
        <MultiFileUpload
          onFilesChange={(files) => handleFilesChange(source.id, files)}
          maxFiles={50} // Or your desired config
          maxSize={10} // Or your desired config
          accept=".xlsx,.xls,.csv,.json"
          label="" // No redundant label needed if source.name is displayed by UploadModal
          buttonText="Select Files"
          disabled={isUploading === 'processing'}
        />
      </div>
    );
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            disabled={!isSuppliersDataVisible}
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
            Upload Supplier Data
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
        title="Upload Supplier Data"
        description="Please upload your supplier data files below. You can upload multiple files for each data source."
        dataSources={getFilteredDataSources()}
        isUploading={isUploading}
        onSubmit={handleSubmitFiles}
        isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
        renderSourceContent={renderSourceContent}
      />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative">
          {!isSuppliersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('supplierList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Payable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Total Payables"
            value="$131,550"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            )}
            iconColor="bg-red-500"
          />
        </div>

        <div className="relative">
          {!isSuppliersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('supplierList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Payable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Due in the next 30 days"
            value="$131,550"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            iconColor="bg-yellow-500"
          />
        </div>

        <div className="relative">
          {!isSuppliersDataVisible && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <button
                type="button"
                onClick={() => openUploadModal('supplierList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Payable
              </button>
            </div>
          )}
          <KeyFigureCard
            title="Total Suppliers"
            value="4"
            icon={() => (
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            iconColor="bg-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">All Suppliers</h2>
      {!isSuppliersDataVisible ? (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <div className="p-12 text-center bg-white">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No supplier data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload Accounts Payable data to view your suppliers.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openUploadModal('supplierList')}
                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              >
                <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Accounts Payable
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
                  Supplier
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Payables
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Due in 30 Days
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
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {supplier.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{supplier.totalPayables}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{supplier.dueNext30Days}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{supplier.lastPayment}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{supplier.nextPayment}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={clsx(
                      'inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium',
                      supplier.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link 
                      href={`/dashboard/suppliers/${supplier.id}`} 
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {supplier.name}</span>
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