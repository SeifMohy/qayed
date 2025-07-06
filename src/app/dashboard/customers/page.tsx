'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon, PlusIcon, DocumentArrowUpIcon, CurrencyDollarIcon, ClockIcon, UserGroupIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/hooks/useUploadedSources'
import UploadModal from '@/components/upload/upload-modal'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import EditEntityDialog from '@/components/shared/edit-entity-dialog'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'
import { formatEGP, formatEGPForKeyCard } from '@/lib/format'
import { useAuth } from '@/contexts/auth-context'

// Interface for customer data
interface Customer {
  id: number;
  name: string;
  totalReceivables: number;
  overdueAmount: number;
  paidAmount: number;
  lastPayment: string | null;
  nextPayment: string | null;
  status: string;
  country?: string | null;
}

export default function CustomersPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { session } = useAuth();

  // Fetch customers data
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📊 Attempting to fetch customers data...');
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      console.log('✅ Received customers data:', {
        count: data.length,
        sample: data.length > 0 ? {
          id: data[0].id,
          name: data[0].name,
          totalReceivables: data[0].totalReceivables
        } : null
      });

      setCustomers(data);

      // Calculate total receivables
      const total = data.reduce((sum: number, customer: Customer) => sum + customer.totalReceivables, 0);
      setTotalReceivables(total);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Checking data source state:', {
      isAccountsReceivableUploaded: isDataSourceUploaded('accountsReceivable'),
      allUploadedSources: uploadedSources
    });

    // Always try to fetch data initially
    fetchCustomers();
  }, [uploadedSources]);

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
      console.log('📤 Starting file upload process...');
      for (const id of sourceIds) {
        const files = sourceFiles[id];
        console.log(`📄 Processing ${files.length} files for source '${id}'`);

        // Process all files directly (no more upload-json dependency)
        for (const file of files) {
          try {
            if (!file.name.endsWith('.json')) {
              console.warn(`⚠️ Skipping non-JSON file: ${file.name}`);
              continue;
            }

            console.log(`🔍 Processing JSON file: ${file.name}`);
            const text = await file.text();
            const json = JSON.parse(text);
            
            if (Array.isArray(json)) {
              console.log(`✅ Adding ${json.length} invoices from ${file.name}`);
              allInvoices.push(...json);
            } else {
              console.log(`✅ Adding single invoice from ${file.name}`);
              allInvoices.push(json);
            }
          } catch (parseError) {
            console.error(`❌ Error parsing file ${file.name}:`, parseError);
            alert(`Error parsing file ${file.name}. Please check its format.`);
          }
        }
      }

      if (allInvoices.length > 0) {
        console.log(`📤 Uploading ${allInvoices.length} invoices in bulk...`);
        
        // Check if user is authenticated
        if (!session?.user?.id) {
          throw new Error('User not authenticated. Please log in again.');
        }

        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseUserId: session.user.id,
            invoices: allInvoices
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || `Server responded with ${response.status}`;
          } catch {
            // If response is not JSON (e.g., HTML error page)
            errorMessage = `Server error (${response.status}). Please check the console for details.`;
            console.error('Server returned non-JSON response:', errorText);
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Successfully uploaded invoices with LLM name normalization');
        console.log('📊 Processing summary:', result);

        // Update uploaded sources state
        const newUploadedSources = { ...uploadedSources };
        sourceIds.forEach(id => {
          console.log(`✅ Marking source '${id}' as uploaded`);
          newUploadedSources[id] = true;
        });
        setUploadedSources(newUploadedSources);

        // Clear the uploaded files
        setSourceFiles({});
        setIsUploadModalOpen(false);

        // Fetch updated customers data
        console.log('🔄 Fetching updated customer data...');
        await fetchCustomers();
      }
    } catch (error: any) {
      console.error('❌ Error during upload process:', error);
      alert(`Error uploading file(s): ${error.message}`);
    } finally {
      setIsUploading('idle');
    }
  };

  const renderSourceContent = (source: { id: string, name: string }) => {
    // Always render the MultiFileUpload component inside the modal
    // The isDataSourceUploaded state is for the main page, not for the modal's active session.
    return (
      <div className="mt-3">
        <MultiFileUpload
          onFilesChange={(files) => handleFilesChange(source.id, files)}
          maxFiles={200} // Or your desired config
          maxSize={10} // Or your desired config
          accept=".xlsx,.xls,.csv,.json"
          label="" // No redundant label needed if source.name is displayed by UploadModal
          buttonText="Select Files"
          disabled={isUploading === 'processing'}
        // To show already selected files if MultiFileUpload is re-rendered with them:
        // We might need to enhance MultiFileUpload to accept an initial list of files,
        // or ensure its internal state persists correctly for `sourceFiles[source.id]`.
        // For now, MultiFileUpload manages its own displayed files based on interactions.
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

  // Format currency - Updated to use EGP
  const formatCurrency = (amount: number) => {
    return formatEGPForKeyCard(amount);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  // Handle save customer
  const handleSaveCustomer = async (data: { name: string; country?: string }) => {
    if (!selectedCustomer) {
      return { success: false, message: 'No customer selected' };
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh customers data
        await fetchCustomers();
        return {
          success: true,
          message: result.message,
          reconciledInvoices: result.reconciledInvoices
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to update customer'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update customer'
      };
    } finally {
      setIsUpdating(false);
    }
  };

  // Overview metrics card rendering
  const renderOverviewMetrics = () => {
    // Always show metrics with actual data or zero values
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KeyFigureCard
          title="Total Receivables"
          value={formatCurrency(totalReceivables)}
          icon={CurrencyDollarIcon}
          iconColor="bg-indigo-600"
          changeType="increase"
          change={customers.length > 0 ? `${customers.length} customers` : "No customers"}
        />

        <KeyFigureCard
          title="Total Paid"
          value={formatCurrency(customers.reduce((sum, customer) => sum + customer.paidAmount, 0))}
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
        <KeyFigureCard
          title="Customer Count"
          value={customers.length.toString()}
          icon={UserGroupIcon}
          iconColor="bg-emerald-600"
          changeType={customers.length > 0 ? "increase" : "neutral"}
          change={customers.length > 0 ? `${customers.length} active` : "No customers"}
        />
      </div>
    );
  };

  // Customer list rendering
  const renderCustomersList = () => {
    if (error) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Error loading customers</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={fetchCustomers}
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
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Loading customers data...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we fetch your customer information.</p>
        </div>
      );
    }

    if (customers.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">Upload invoices to add customer data.</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => openUploadModal('customersData')}
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
                Customer
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Total Receivables
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
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {customer.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(customer.totalReceivables)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(customer.paidAmount)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      customer.status === 'On Time' ? 'bg-green-100 text-green-800' :
                        customer.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                    )}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit customer"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Edit {customer.name}</span>
                    </button>
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="text-[#595CFF] hover:text-[#484adb]"
                    >
                      View<span className="sr-only">, {customer.name}</span>
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

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={fetchCustomers}
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
      {renderCustomersList()}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Customer Data"
        description="Upload your customer invoices to see your accounts receivable data."
        dataSources={getFilteredDataSources()}
        isUploading={isUploading}
        onSubmit={handleSubmitFiles}
        isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
        renderSourceContent={renderSourceContent}
      />

      {selectedCustomer && (
        <EditEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedCustomer(null);
          }}
          entityType="customer"
          entity={selectedCustomer}
          onSave={handleSaveCustomer}
          isLoading={isUpdating}
        />
      )}
    </div>
  )
} 