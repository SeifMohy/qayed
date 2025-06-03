'use client'

import { useState, useEffect } from 'react'
import { ArrowDownIcon, ArrowUpIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import { CurrencyDollarIcon, BanknotesIcon, CreditCardIcon, ArrowTrendingUpIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import type { ChangeType } from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/hooks/useUploadedSources'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import UploadModal from '@/components/upload/upload-modal'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'

// Dynamically import Chart.js components
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false })

const stats = [
    {
        title: 'Total Cash On Hand',
        value: '$1,423,982',
        change: '3.2%',
        changeType: 'increase' as ChangeType,
        icon: CurrencyDollarIcon,
        iconColor: 'bg-green-500',
        dataSource: 'bankStatements'
    },
    {
        title: 'Outstanding Payables (30 days)',
        value: '$459,871',
        change: '1.8%',
        changeType: 'decrease' as ChangeType,
        icon: BanknotesIcon,
        iconColor: 'bg-red-500',
        interpretation: 'positive' as const,
        dataSource: 'accountsPayable'
    },
    {
        title: 'Outstanding Receivables (30 days)',
        value: '$681,120',
        change: '5.2%',
        changeType: 'increase' as ChangeType,
        icon: CreditCardIcon,
        iconColor: 'bg-blue-500',
        dataSource: 'accountsReceivable'
    },
    {
        title: 'Outstanding Bank Payments',
        value: '$181,000',
        change: '2.3%',
        changeType: 'increase' as ChangeType,
        icon: ArrowTrendingUpIcon,
        iconColor: 'bg-purple-500',
        interpretation: 'negative' as const,
        dataSource: 'bankPosition'
    },
]

const supplierPayments = [
    { id: 1, supplier: 'Tech Innovations Ltd', amount: '$42,000', dueDate: 'Jul 12, 2023', status: 'Pending' },
    { id: 2, supplier: 'Global Shipping Co.', amount: '$18,500', dueDate: 'Jul 15, 2023', status: 'Pending' },
    { id: 3, supplier: 'Office Supplies Inc.', amount: '$3,250', dueDate: 'Jul 20, 2023', status: 'Scheduled' },
    { id: 4, supplier: 'Manufacturing Partners', amount: '$67,800', dueDate: 'Jul 28, 2023', status: 'Scheduled' },
]

const customerPayments = [
    { id: 1, customer: 'Enterprise Solutions', amount: '$86,000', dueDate: 'Jul 13, 2023', status: 'Scheduled' },
    { id: 2, customer: 'Retail Chain Corp', amount: '$34,200', dueDate: 'Jul 18, 2023', status: 'Pending' },
    { id: 3, customer: 'Digital Services LLC', amount: '$27,500', dueDate: 'Jul 22, 2023', status: 'Pending' },
    { id: 4, customer: 'Financial Partners', amount: '$52,300', dueDate: 'Jul 30, 2023', status: 'Pending' },
]

const bankingObligations = [
    { id: 1, bank: 'First National Bank', amount: '$18,750', dueDate: 'Jul 15, 2023', type: 'Loan Payment' },
    { id: 2, bank: 'Central Finance', amount: '$35,000', dueDate: 'Jul 22, 2023', type: 'Credit Line' },
    { id: 3, bank: 'International Banking', amount: '$7,200', dueDate: 'Jul 25, 2023', type: 'Interest' },
    { id: 4, bank: 'First National Bank', amount: '$120,000', dueDate: 'Aug 1, 2023', type: 'Facility Renewal' },
]

// Cash flow forecast data for 90 days
const cashFlowData = {
    labels: ['Current', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    current: 1423982,
    historicalValues: [1380000, 1395000, 1410000, 1423982],
    projectedValues: [1423982, 1452000, 1478000, 1510000, 1545000, 1598000, 1635000, 1693000, 1724000, 1768000, 1825000, 1862000, 1892560]
}

export default function Dashboard() {
    const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
    const [chartLoaded, setChartLoaded] = useState(false);
    const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
    
    // Load chart.js when component mounts
    useEffect(() => {
      const loadChartJs = async () => {
        const { 
          Chart, 
          CategoryScale, 
          LinearScale, 
          PointElement, 
          LineElement, 
          Title, 
          Tooltip, 
          Legend, 
          Filler 
        } = await import('chart.js');
        
        Chart.register(
          CategoryScale, 
          LinearScale, 
          PointElement, 
          LineElement, 
          Title, 
          Tooltip, 
          Legend, 
          Filler
        );
        
        setChartLoaded(true);
      };
      
      loadChartJs();
    }, []);
    
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
    
    const areAllSourcesUploaded = PAGE_DATA_SOURCES.dashboard.every(source => isDataSourceUploaded(source.id));
    
    // Only require bank statements for the chart
    const isChartVisible = isDataSourceUploaded('bankStatements') && chartLoaded;
                         
    const isSupplierPaymentsVisible = isDataSourceUploaded('accountsPayable');
    const isCustomerPaymentsVisible = isDataSourceUploaded('accountsReceivable');
    const isBankObligationsVisible = isDataSourceUploaded('bankPosition');

    const renderSourceContent = (source: { id: string, name: string }) => {
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
                    accept=".xlsx,.xls,.csv"
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
            // Show all data sources when opening from the main "Upload Data Sources" button
            setActiveDataSources([]);
        }
        // Keep the sourceFiles state intact when opening the modal
        setIsUploadModalOpen(true);
    };
    
    // Get the filtered data sources to display in the modal
    const getFilteredDataSources = () => {
        if (activeDataSources.length === 0) {
            // Show all data sources if none specifically selected
            return PAGE_DATA_SOURCES.dashboard;
        }
        // Filter to show only the active data sources
        return ALL_DATA_SOURCES.filter(source => 
            activeDataSources.includes(source.id)
        );
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            {/* Data Upload and Refresh Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
                <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
                    onClick={() => openUploadModal()}
                >
                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Upload Data Sources
                </button>
                <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    disabled={!areAllSourcesUploaded}
                >
                    <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Refresh Data
                </button>
            </div>

            {/* Upload Data Modal using the shared component */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    // Don't reset sourceFiles to keep state between modal opens
                }}
                title="Upload Data Sources"
                description="Please upload your financial data sources below. You can upload multiple files for each data source."
                dataSources={getFilteredDataSources()}
                isUploading={isUploading}
                onSubmit={handleSubmitFiles}
                isUploadDisabled={Object.keys(sourceFiles).filter(id => sourceFiles[id]?.length > 0).length === 0 || isUploading === 'processing'}
                renderSourceContent={renderSourceContent}
            />

            {/* KPI Cards */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.title} className="relative">
                        {!isDataSourceUploaded(item.dataSource) && (
                            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Map dataSource to component ID
                                        const componentId = item.dataSource === 'bankStatements' ? 'cashOnHandKPI' :
                                                          item.dataSource === 'accountsPayable' ? 'outstandingPayablesKPI' :
                                                          item.dataSource === 'accountsReceivable' ? 'outstandingReceivablesKPI' :
                                                          item.dataSource === 'bankPosition' ? 'outstandingBankPaymentsKPI' : '';
                                        openUploadModal(componentId);
                                    }}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload {PAGE_DATA_SOURCES.dashboard.find(s => s.id === item.dataSource)?.name}
                                </button>
                            </div>
                        )}
                        <KeyFigureCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            iconColor={item.iconColor}
                            change={item.change}
                            changeType={item.changeType}
                            interpretation={item.interpretation}
                        />
                    </div>
                ))}
            </div>

            {/* Cash Flow Chart */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Cash Position & Forecast (90 Days)</h3>
                
                {!isChartVisible ? (
                    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No data available</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload Bank Statements to view the forecast.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => openUploadModal('cashPositionChart')}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload Bank Statements
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-80">
                        <Line
                            data={{
                                labels: cashFlowData.labels,
                                datasets: [
                                    {
                                        label: 'Historical Cash Position',
                                        data: [...cashFlowData.historicalValues, ...Array(9).fill(null)],
                                        borderColor: 'rgb(75, 192, 192)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                                        borderWidth: 2,
                                        pointBackgroundColor: 'rgb(75, 192, 192)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6,
                                        tension: 0.3,
                                        fill: false
                                    },
                                    {
                                        label: 'Projected Cash Position',
                                        data: [...Array(4).fill(null), ...cashFlowData.projectedValues],
                                        borderColor: 'rgb(89, 92, 255)',
                                        backgroundColor: 'rgba(89, 92, 255, 0.1)',
                                        borderWidth: 2,
                                        pointBackgroundColor: 'rgb(89, 92, 255)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6,
                                        tension: 0.3,
                                        fill: true
                                    }
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                        align: 'end',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                let value = context.parsed.y;
                                                return `Cash: $${value?.toLocaleString() || '0'}`;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.05)'
                                        },
                                        ticks: {
                                            callback: function(value) {
                                                return '$' + (value as number).toLocaleString();
                                            }
                                        },
                                        min: Math.floor(cashFlowData.current * 0.9 / 100000) * 100000, // Round down to nearest 100k
                                    },
                                    x: {
                                        grid: {
                                            display: false
                                        }
                                    }
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Upcoming Supplier Payments */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Supplier Payments</h3>
                        {isSupplierPaymentsVisible && (
                            <p className="mt-1 text-sm text-gray-500">Total: $131,550 due in the next 30 days</p>
                        )}
                    </div>
                    
                    {!isSupplierPaymentsVisible ? (
                        <div className="px-4 py-12 sm:p-6 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No data available</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload Accounts Payable data to view upcoming payments.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => openUploadModal('supplierPayments')}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload Accounts Payable
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flow-root">
                                <ul role="list" className="-mb-8">
                                    {supplierPayments.map((payment, paymentIdx) => (
                                        <li key={payment.id}>
                                            <div className="relative pb-8">
                                                {paymentIdx !== supplierPayments.length - 1 ? (
                                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                                            <BanknotesIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-900">{payment.supplier}</p>
                                                            <p className="text-sm text-gray-500">{payment.amount}</p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-sm">
                                                            <time className="text-gray-500">{payment.dueDate}</time>
                                                            <div className={clsx(
                                                                'mt-1 text-xs font-medium',
                                                                payment.status === 'Pending' ? 'text-yellow-600' : 'text-blue-600'
                                                            )}>
                                                                {payment.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Customer Payments */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Payments</h3>
                        {isCustomerPaymentsVisible && (
                            <p className="mt-1 text-sm text-gray-500">Total: $200,000 expected in the next 30 days</p>
                        )}
                    </div>
                    
                    {!isCustomerPaymentsVisible ? (
                        <div className="px-4 py-12 sm:p-6 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No data available</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload Accounts Receivable data to view upcoming payments.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => openUploadModal('customerPayments')}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload Accounts Receivable
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flow-root">
                                <ul role="list" className="-mb-8">
                                    {customerPayments.map((payment, paymentIdx) => (
                                        <li key={payment.id}>
                                            <div className="relative pb-8">
                                                {paymentIdx !== customerPayments.length - 1 ? (
                                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                                            <CreditCardIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-900">{payment.customer}</p>
                                                            <p className="text-sm text-gray-500">{payment.amount}</p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-sm">
                                                            <time className="text-gray-500">{payment.dueDate}</time>
                                                            <div className={clsx(
                                                                'mt-1 text-xs font-medium',
                                                                payment.status === 'Pending' ? 'text-yellow-600' : 'text-blue-600'
                                                            )}>
                                                                {payment.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Banking Obligations */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Banking Obligations</h3>
                        {isBankObligationsVisible && (
                            <p className="mt-1 text-sm text-gray-500">Total: $60,950 due in the next 30 days</p>
                        )}
                    </div>
                    
                    {!isBankObligationsVisible ? (
                        <div className="px-4 py-12 sm:p-6 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No data available</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload Bank Position data to view upcoming obligations.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => openUploadModal('bankingObligations')}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload Bank Position
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flow-root">
                                <ul role="list" className="-mb-8">
                                    {bankingObligations.map((obligation, obligationIdx) => (
                                        <li key={obligation.id}>
                                            <div className="relative pb-8">
                                                {obligationIdx !== bankingObligations.length - 1 ? (
                                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                                                            <BanknotesIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-gray-900">{obligation.bank}</p>
                                                            <p className="text-sm text-gray-500">{obligation.type}</p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-sm">
                                                            <time className="text-gray-500">{obligation.dueDate}</time>
                                                            <p className="mt-1 text-sm font-medium text-gray-900">{obligation.amount}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 