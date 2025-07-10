'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowPathIcon, DocumentArrowUpIcon, CurrencyDollarIcon, CalendarIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/contexts/uploaded-sources-context'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import UploadModal from '@/components/upload/upload-modal'
import EditEntityDialog from '@/components/shared/edit-entity-dialog'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'
import { formatEGP, formatEGPForKeyCard } from '@/lib/format'
import { useAuth } from '@/contexts/auth-context'
import { useInvoiceUpload } from '@/hooks/useInvoiceUpload'

// Interface for supplier data
interface Supplier {
  id: number;
  name: string;
  totalPayables: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueAmount: number;
  lastPayment: string | null;
  nextPayment: string | null;
  status: string;
  country?: string | null;
}

export default function SuppliersPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPayables, setTotalPayables] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { session } = useAuth();

  // Invoice upload hook
  const { uploadInvoices, isUploading: invoiceUploading } = useInvoiceUpload({
    onSuccess: () => {
      console.log('✅ Supplier invoice upload completed successfully');
      // Update uploaded sources state
      const newUploadedSources = { ...uploadedSources };
      Object.keys(sourceFiles).forEach(id => {
        if (sourceFiles[id]?.length > 0) {
          newUploadedSources[id] = true;
        }
      });
      setUploadedSources(newUploadedSources);
      
      // Clear the uploaded files
      setSourceFiles({});
      setIsUploadModalOpen(false);

      // Fetch updated suppliers data
      console.log('🔄 Fetching updated supplier data...');
      fetchSuppliers();
    },
    onError: (error) => {
      console.error('❌ Supplier invoice upload failed:', error);
      alert(`Error uploading file(s): ${error}`);
    }
  });

  // Fetch suppliers data
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📊 Attempting to fetch suppliers data...');
      
      // Check if user is authenticated
      if (!session?.access_token) {
        console.log('❌ No session or access token available');
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API call failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch suppliers');
      }
      
      const data = await response.json();
      console.log('✅ Received suppliers data:', {
        success: data.success,
        count: data.count,
        dataLength: Array.isArray(data.data) ? data.data.length : 'Not an array',
        sample: Array.isArray(data.data) && data.data.length > 0 ? {
          id: data.data[0].id,
          name: data.data[0].name,
          totalPayables: data.data[0].totalPayables
        } : null
      });

      // Extract the actual suppliers array from the response
      const suppliersArray = (data.success && Array.isArray(data.data)) ? data.data : [];
      setSuppliers(suppliersArray);
      
      // Calculate total payables
      const total = suppliersArray.reduce((sum: number, supplier: Supplier) => sum + supplier.totalPayables, 0);
      setTotalPayables(total);
    } catch (error) {
      console.error('❌ Error fetching suppliers:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);
  
  useEffect(() => {
    console.log('🔍 Checking data source state:', {
      isAccountsPayableUploaded: isDataSourceUploaded('accountsPayable'),
      allUploadedSources: uploadedSources
    });
    
    // Always try to fetch data initially
    fetchSuppliers();
  }, [uploadedSources, fetchSuppliers]);

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
    
    try {
      // Process all uploaded files using the unified hook
      for (const sourceId of sourceIds) {
        const files = sourceFiles[sourceId];
        if (files && files.length > 0) {
          await uploadInvoices(files, sourceId);
        }
      }
    } catch (error: any) {
      console.error('❌ Error during upload process:', error);
      // Error handling is done in the hook's onError callback
    } finally {
      setIsUploading('idle');
    }
  };
  
  const renderSourceContent = (source: { id: string, name: string }) => {
    return (
      <div className="mt-3">
        <MultiFileUpload
          onFilesChange={(files) => handleFilesChange(source.id, files)}
          maxFiles={200}
          maxSize={10}
          accept=".xlsx,.xls,.csv,.json"
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
      setActiveDataSources(getSourcesForComponent(componentId));
    } else {
      setActiveDataSources([]);
    }
    setIsUploadModalOpen(true);
  };
  
  // Get the filtered data sources to display in the modal
  const getFilteredDataSources = () => {
    if (activeDataSources.length === 0) {
      return PAGE_DATA_SOURCES.suppliers;
    }
    return ALL_DATA_SOURCES.filter(source => 
      activeDataSources.includes(source.id)
    );
  };
  
  // Format currency - Updated to use EGP
  const formatCurrency = (amount: number) => {
    return formatEGPForKeyCard(amount);
  };

  // Overview metrics card rendering
  const renderOverviewMetrics = () => {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <KeyFigureCard
          title="Total Payables"
          value={formatCurrency(totalPayables)}
          icon={CurrencyDollarIcon}
          iconColor="bg-purple-600"
          changeType="increase"
          change={Array.isArray(suppliers) && suppliers.length > 0 ? `${suppliers.length} suppliers` : "No suppliers"}
        />
        <KeyFigureCard
          title="Total Paid"
          value={formatCurrency(Array.isArray(suppliers) ? suppliers.reduce((sum, supplier) => sum + supplier.totalPaid, 0) : 0)}
          icon={CalendarIcon}
          iconColor="bg-green-600"
          changeType="increase"
        />
        <KeyFigureCard
          title="Average Payment Time"
          value="N/A"
          icon={ClockIcon}
          iconColor="bg-cyan-600"
          subtitle="Requires bank statement data"
        />
      </div>
    );
  };

  // Supplier list rendering
  const renderSuppliersList = () => {
    if (error) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Error loading suppliers</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={fetchSuppliers}
            >
              <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Retry Loading
            </button>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Loading suppliers data...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your supplier information.</p>
        </div>
      );
    }

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No suppliers found</h3>
          <p className="mt-1 text-sm text-gray-500">Upload invoices to add supplier data.</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => openUploadModal('suppliersData')}
            >
              <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Invoices
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Supplier
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Total Payables
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Paid
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(suppliers) && suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {supplier.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(supplier.totalPayables)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(supplier.totalPaid)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      supplier.status === 'On Time' ? 'bg-green-100 text-green-800' :
                      supplier.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}
                  >
                    {supplier.status}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit supplier"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit {supplier.name}</span>
                    </button>
                    <Link
                      href={`/dashboard/suppliers/${supplier.id}`}
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {supplier.name}</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Handle edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  // Handle save supplier
  const handleSaveSupplier = async (data: { name: string; country?: string }) => {
    if (!selectedSupplier) {
      return { success: false, message: 'No supplier selected' };
    }

    // Check if user is authenticated
    if (!session?.access_token) {
      return { success: false, message: 'Authentication required' };
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh suppliers data
        await fetchSuppliers();
        return {
          success: true,
          message: result.message,
          reconciledInvoices: result.reconciledInvoices
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to update supplier'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update supplier'
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={fetchSuppliers}
          >
            <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Refresh Data
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
            onClick={() => openUploadModal()}
          >
            <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Upload Invoices
          </button>
        </div>
      </div>

      {renderOverviewMetrics()}
      {renderSuppliersList()}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Supplier Data"
        description="Upload your supplier invoices to see your accounts payable data."
        dataSources={getFilteredDataSources()}
        isUploading={isUploading}
        onSubmit={handleSubmitFiles}
        isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
        renderSourceContent={renderSourceContent}
      />

      {selectedSupplier && (
        <EditEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedSupplier(null);
          }}
          entityType="supplier"
          entity={selectedSupplier}
          onSave={handleSaveSupplier}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
} 