'use client'

import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import { CurrencyDollarIcon, BanknotesIcon, CreditCardIcon, ArrowTrendingUpIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import KeyFigureCard from '@/components/key-figure-card'
import type { ChangeType } from '@/components/key-figure-card'
import { useUploadedSources } from './layout'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

// Data sources and their uploaded state
const dataSources = [
    { id: 'bankStatements', name: 'Bank Statements', format: 'Excel', description: 'Cashflow for the previous period', uploaded: false },
    { id: 'bankPosition', name: 'Bank Position', format: 'Excel', description: 'Scheduled obligations, Limits / Interest, Credit Facilities', uploaded: false },
    { id: 'accountsReceivable', name: 'Accounts Receivable', format: 'ERP / Electronic Invoices', description: 'Scheduled incoming money for the period', uploaded: false },
    { id: 'accountsPayable', name: 'Accounts Payable', format: 'ERP / Electronic Invoices', description: 'Scheduled procurement payments', uploaded: false }
]

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
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
    
    const handleFileSelect = (sourceId: string, file: File) => {
        setSelectedFiles(prev => ({
            ...prev,
            [sourceId]: file
        }));
    };
    
    const handleSubmitFiles = () => {
        // Get all source IDs that have files selected
        const sourceIds = Object.keys(selectedFiles).filter(id => selectedFiles[id] !== null);
        
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
            setSelectedFiles({});
            setIsUploadModalOpen(false);
        }, 2000);
    };
    
    const areAllSourcesUploaded = dataSources.every(source => isDataSourceUploaded(source.id));
    
    // Only require bank statements for the chart
    const isChartVisible = isDataSourceUploaded('bankStatements');
                         
    const isSupplierPaymentsVisible = isDataSourceUploaded('accountsPayable');
    const isCustomerPaymentsVisible = isDataSourceUploaded('accountsReceivable');
    const isBankObligationsVisible = isDataSourceUploaded('bankPosition');

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            {/* Data Upload and Refresh Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
                <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
                    onClick={() => setIsUploadModalOpen(true)}
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

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Data Sources</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Upload your data sources to view the dashboard. Each source provides different insights.
                        </p>
                        
                        <div className="space-y-4 mt-4">
                            {dataSources.map(source => (
                                <div key={source.id} className="border border-gray-200 rounded-md p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{source.name}</h4>
                                            <p className="text-sm text-gray-500">{source.format}</p>
                                            <p className="text-xs text-gray-400 mt-1">{source.description}</p>
                                        </div>
                                        <div>
                                            {isDataSourceUploaded(source.id) ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                                                    Uploaded
                                                </span>
                                            ) : selectedFiles[source.id] ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
                                                    Selected
                                                </span>
                                            ) : (
                                                <label className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer">
                                                    <span>Select File</span>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept=".xlsx,.xls,.csv" 
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileSelect(source.id, e.target.files[0])
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setSelectedFiles({});
                                }}
                                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitFiles}
                                disabled={Object.keys(selectedFiles).length === 0 || isUploading === 'processing'}
                                className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading === 'processing' ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>Upload Files</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.title} className="relative">
                        {!isDataSourceUploaded(item.dataSource) && (
                            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                                >
                                    <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Upload {dataSources.find(s => s.id === item.dataSource)?.name}
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
                                    onClick={() => setIsUploadModalOpen(true)}
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
                                    onClick={() => setIsUploadModalOpen(true)}
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
                                    onClick={() => setIsUploadModalOpen(true)}
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
                                    onClick={() => setIsUploadModalOpen(true)}
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