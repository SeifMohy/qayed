'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { CurrencyDollarIcon, ReceiptPercentIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import { useUploadedSources } from '@/hooks/useUploadedSources'
import UploadModal from '@/components/upload/upload-modal'
import MultiFileUpload from '@/components/upload/multi-file-upload'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/lib/data-sources'
import type { ChangeType } from '@/components/visualization/key-figure-card'
import Link from 'next/link'

// Dynamically import Chart.js components
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false })
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false })

// Sample data for key figures
const expenseStats = [
  {
    title: 'Average Monthly Operating Expenses',
    value: '$87,450',
    change: '2.5%',
    changeType: 'increase' as ChangeType,
    icon: CurrencyDollarIcon,
    iconColor: 'bg-red-500',
    interpretation: 'negative' as const,
    dataSource: 'expenses'
  },
  {
    title: 'Last Month Operating Expenses',
    value: '$92,120',
    change: '5.3%',
    changeType: 'increase' as ChangeType,
    icon: CreditCardIcon,
    iconColor: 'bg-orange-500',
    interpretation: 'negative' as const,
    dataSource: 'expenses'
  },
  {
    title: '% of Expenses vs Revenue',
    value: '36.8%',
    change: '1.2%',
    changeType: 'decrease' as ChangeType,
    icon: ReceiptPercentIcon,
    iconColor: 'bg-green-500',
    interpretation: 'positive' as const,
    dataSource: 'expenses'
  },
]

// Sample data for expense categories
const expenseCategories = [
  { id: 1, category: 'Salaries', description: 'Employee compensation', amount: '$48,500', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: 2, category: 'Rent', description: 'Office space', amount: '$12,000', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: 3, category: 'Utilities', description: 'Electricity, water, internet', amount: '$2,750', frequency: 'Monthly', lastPaymentDate: 'Jul 5, 2023' },
  { id: 4, category: 'Marketing', description: 'Digital advertising', amount: '$8,500', frequency: 'Monthly', lastPaymentDate: 'Jul 10, 2023' },
  { id: 5, category: 'Software', description: 'SaaS subscriptions', amount: '$4,200', frequency: 'Monthly', lastPaymentDate: 'Jul 15, 2023' },
  { id: 6, category: 'Insurance', description: 'Business insurance', amount: '$3,200', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: 7, category: 'Legal', description: 'Legal services', amount: '$2,500', frequency: 'Quarterly', lastPaymentDate: 'Jun 15, 2023' },
  { id: 8, category: 'Travel', description: 'Business travel', amount: '$3,800', frequency: 'Variable', lastPaymentDate: 'Jun 28, 2023' },
  { id: 9, category: 'Office Supplies', description: 'Stationery, etc.', amount: '$1,200', frequency: 'Monthly', lastPaymentDate: 'Jul 12, 2023' },
  { id: 10, category: 'Equipment', description: 'Hardware, furniture', amount: '$5,470', frequency: 'Variable', lastPaymentDate: 'May 20, 2023' },
]

// Sample data for breakdown chart
const breakdownData = {
  labels: ['Salaries', 'Rent', 'Utilities', 'Marketing', 'Software', 'Insurance', 'Legal', 'Travel', 'Office Supplies', 'Equipment'],
  datasets: [
    {
      label: 'Expense Breakdown',
      data: [48500, 12000, 2750, 8500, 4200, 3200, 2500, 3800, 1200, 5470],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(78, 180, 100, 0.7)',
        'rgba(255, 99, 13, 0.7)'
      ],
      borderWidth: 1
    }
  ]
}

export default function ExpensesPage() {
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Load chart.js when component mounts
  useEffect(() => {
    const loadChartJs = async () => {
      const { 
        Chart, 
        CategoryScale, 
        LinearScale, 
        BarElement,
        ArcElement,
        Title, 
        Tooltip, 
        Legend 
      } = await import('chart.js');
      
      Chart.register(
        CategoryScale, 
        LinearScale, 
        BarElement,
        ArcElement,
        Title, 
        Tooltip, 
        Legend
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
      // Show all data sources when opening from the main button
      setActiveDataSources([]);
    }
    // Keep the sourceFiles state intact when opening the modal
    setIsUploadModalOpen(true);
  };
  
  // Get the filtered data sources to display in the modal
  const getFilteredDataSources = () => {
    if (activeDataSources.length === 0) {
      // Show all data sources if none specifically selected
      return PAGE_DATA_SOURCES.expenses;
    }
    // Filter to show only the active data sources
    return ALL_DATA_SOURCES.filter(source => 
      activeDataSources.includes(source.id)
    );
  };

  const areAllSourcesUploaded = PAGE_DATA_SOURCES.expenses.every(source => 
    isDataSourceUploaded(source.id)
  );

  const isChartVisible = isDataSourceUploaded('expenses') && chartLoaded;

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">General Expenses</h1>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => {}}
          >
            <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
            onClick={() => openUploadModal()}
          >
            <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Upload Data
          </button>
        </div>
      </div>

      {/* Key Figures Grid - Always visible with either data or upload prompts */}
      <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {expenseStats.map((stat) => (
          <div key={stat.title} className="relative">
            {!isDataSourceUploaded(stat.dataSource) && (
              <div 
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
                onClick={() => openUploadModal(
                  stat.title === 'Average Monthly Operating Expenses' ? 'expenseSummary' : 
                  stat.title === 'Last Month Operating Expenses' ? 'expenseSummary' : 
                  'expenseBreakdown'
                )}
              >
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
                >
                  <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Upload Data
                </button>
              </div>
            )}
            <KeyFigureCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
              interpretation={stat.interpretation}
            />
          </div>
        ))}
      </div>

      {/* Expense Breakdown Chart Section - Always visible */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Expense Breakdown</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-md",
                chartType === 'pie' 
                  ? "bg-[#595CFF] text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => setChartType('pie')}
            >
              Pie Chart
            </button>
            <button
              type="button"
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-md",
                chartType === 'bar' 
                  ? "bg-[#595CFF] text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </button>
          </div>
        </div>
        
        {isChartVisible ? (
          <div className="h-80">
            {chartType === 'pie' ? (
              <Pie 
                data={breakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw as number;
                          const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => (a as number) + (b as number), 0) as number;
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <Bar 
                data={{
                  ...breakdownData,
                  datasets: [{
                    ...breakdownData.datasets[0],
                    backgroundColor: 'rgba(89, 92, 255, 0.7)',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `$${value.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center">
            <DocumentArrowUpIcon className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
            <p className="text-gray-500 text-center max-w-md mb-4">
              Upload expense data to see a detailed breakdown of your operating costs by category.
            </p>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb]"
              onClick={() => openUploadModal('expenseBreakdown')}
            >
              <DocumentArrowUpIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Data
            </button>
          </div>
        )}
      </div>

      {/* Expense Categories Table */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center mb-4">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900">Expense Categories</h2>
            <p className="mt-2 text-sm text-gray-700">
              A list of all expense categories with their descriptions, amounts, and payment frequency.
            </p>
          </div>
        </div>
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Frequency
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Last Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {areAllSourcesUploaded ? (
                      expenseCategories.map((expense) => (
                        <tr key={expense.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <Link 
                              href={`/dashboard/expenses/${expense.id}`} 
                              className="text-[#595CFF] hover:text-[#484adb]"
                            >
                              {expense.category}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{expense.description}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{expense.amount}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{expense.frequency}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{expense.lastPaymentDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                          Upload expense data to view categories
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Expense Data"
        description="Upload your expense data to see a detailed breakdown of your operating costs."
        dataSources={getFilteredDataSources()}
        renderSourceContent={renderSourceContent}
        onSubmit={handleSubmitFiles}
        isUploading={isUploading}
        isUploadDisabled={isUploading === 'processing'}
      />
    </div>
  )
} 