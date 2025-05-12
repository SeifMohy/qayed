'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, ArrowPathIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { CurrencyDollarIcon, CalendarIcon, HashtagIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useUploadedSources } from '../../layout'
import { useParams } from 'next/navigation'
import UploadModal from '@/components/upload-modal'
import MultiFileUpload from '@/components/multi-file-upload'
import { PAGE_DATA_SOURCES, ALL_DATA_SOURCES, getSourcesForComponent } from '@/utils/data-sources'

// Dynamically import Chart.js components
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false })

// Sample data for expense categories (same as in main page for demo)
const expenseCategories = [
  { id: '1', category: 'Salaries', description: 'Employee compensation', amount: '$48,500', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: '2', category: 'Rent', description: 'Office space', amount: '$12,000', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: '3', category: 'Utilities', description: 'Electricity, water, internet', amount: '$2,750', frequency: 'Monthly', lastPaymentDate: 'Jul 5, 2023' },
  { id: '4', category: 'Marketing', description: 'Digital advertising', amount: '$8,500', frequency: 'Monthly', lastPaymentDate: 'Jul 10, 2023' },
  { id: '5', category: 'Software', description: 'SaaS subscriptions', amount: '$4,200', frequency: 'Monthly', lastPaymentDate: 'Jul 15, 2023' },
  { id: '6', category: 'Insurance', description: 'Business insurance', amount: '$3,200', frequency: 'Monthly', lastPaymentDate: 'Jul 1, 2023' },
  { id: '7', category: 'Legal', description: 'Legal services', amount: '$2,500', frequency: 'Quarterly', lastPaymentDate: 'Jun 15, 2023' },
  { id: '8', category: 'Travel', description: 'Business travel', amount: '$3,800', frequency: 'Variable', lastPaymentDate: 'Jun 28, 2023' },
  { id: '9', category: 'Office Supplies', description: 'Stationery, etc.', amount: '$1,200', frequency: 'Monthly', lastPaymentDate: 'Jul 12, 2023' },
  { id: '10', category: 'Equipment', description: 'Hardware, furniture', amount: '$5,470', frequency: 'Variable', lastPaymentDate: 'May 20, 2023' },
]

// Sample transactions for each category
const generateTransactions = (categoryId: string) => {
  const numTransactions = Math.floor(Math.random() * 8) + 5; // 5-12 transactions
  const transactions = [];
  
  const today = new Date();
  let date = new Date();
  date.setDate(today.getDate() - 180); // Start 180 days ago
  
  for (let i = 0; i < numTransactions; i++) {
    // Move forward 10-30 days for each transaction
    date.setDate(date.getDate() + Math.floor(Math.random() * 20) + 10);
    
    if (date > today) {
      date = today;
    }
    
    const category = expenseCategories.find(cat => cat.id === categoryId);
    let baseAmount = parseInt(category?.amount.replace(/[$,]/g, '') || '1000');
    
    // Vary the amount by ±20%
    const variance = baseAmount * 0.2;
    const randomAmount = baseAmount - variance + Math.random() * (variance * 2);
    
    transactions.push({
      id: `${categoryId}-${i}`,
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      description: `${category?.category} Payment`,
      amount: `$${Math.round(randomAmount).toLocaleString()}`,
      paymentMethod: ['Credit Card', 'Bank Transfer', 'Check', 'Cash'][Math.floor(Math.random() * 4)],
      notes: Math.random() > 0.7 ? 'Regular payment' : ''
    });
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Monthly spend data for trendline
const generateTrendData = (categoryId: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const category = expenseCategories.find(cat => cat.id === categoryId);
  let baseAmount = parseInt(category?.amount.replace(/[$,]/g, '') || '1000');
  
  const data = months.map(month => {
    // Vary the amount by ±30%
    const variance = baseAmount * 0.3;
    return baseAmount - variance + Math.random() * (variance * 2);
  });
  
  return {
    labels: months,
    datasets: [
      {
        label: `Monthly ${category?.category} Expenses`,
        data: data,
        fill: false,
        borderColor: 'rgb(89, 92, 255)',
        tension: 0.1
      }
    ]
  };
};

// Types for generated data
type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: string;
  paymentMethod: string;
  notes: string;
};

type TrendData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
};

export default function ExpenseCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const { uploadedSources, setUploadedSources, isDataSourceUploaded } = useUploadedSources();
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceFiles, setSourceFiles] = useState<{ [key: string]: File[] }>({});
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  const [chartLoaded, setChartLoaded] = useState(false);
  
  // State for client-side generated data
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [avgMonthlyExpense, setAvgMonthlyExpense] = useState(0);
  
  // Get the current expense category
  const currentCategory = expenseCategories.find(category => category.id === categoryId);
  
  // Client-side data generation
  useEffect(() => {
    // Generate data only on the client side
    const generatedTransactions = generateTransactions(categoryId);
    setTransactions(generatedTransactions);
    
    const generatedTrendData = generateTrendData(categoryId);
    setTrendData(generatedTrendData);
    
    // Calculate totals
    const calculatedTotal = generatedTransactions.reduce((sum, transaction) => {
      return sum + parseInt(transaction.amount.replace(/[$,]/g, ''));
    }, 0);
    setTotalExpenses(calculatedTotal);
    setAvgMonthlyExpense(Math.round(calculatedTotal / 12));
    
    // Mark as loaded
    setIsLoading(false);
  }, [categoryId]);
  
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
        Legend 
      } = await import('chart.js');
      
      Chart.register(
        CategoryScale, 
        LinearScale, 
        PointElement, 
        LineElement, 
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

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <div className="ml-3 h-10 bg-gray-200 rounded w-24"></div>
              <div className="ml-3 h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
        
        <div className="mt-8">
          <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <nav className="flex mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link 
                    href="/dashboard/expenses"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Expenses
                  </Link>
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl font-semibold text-gray-900">
              {currentCategory?.category} Expenses
            </h1>
            <p className="mt-1 text-sm text-gray-500">{currentCategory?.description}</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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
      </div>

      {/* Remove the upload data prompt and always show content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total (Last 12 Months)</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">${totalExpenses.toLocaleString()}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Monthly Spend</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">${avgMonthlyExpense.toLocaleString()}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HashtagIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Number of Transactions</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{transactions.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Last Payment Date</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{transactions[0]?.date}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trendline Chart */}
      {chartLoaded && trendData && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trend</h2>
          <div className="h-80">
            <Line 
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      }
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw as number;
                        return `$${value.toLocaleString()}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center mb-4">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            <p className="mt-2 text-sm text-gray-700">
              A list of all transactions in this expense category.
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
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Payment Method
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {transaction.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.description}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.amount}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.paymentMethod}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.notes}</td>
                      </tr>
                    ))}
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
        description="Upload your expense data to see details for this category."
        dataSources={getFilteredDataSources()}
        renderSourceContent={renderSourceContent}
        onSubmit={handleSubmitFiles}
        isUploading={isUploading}
        isUploadDisabled={isUploading === 'processing'}
      />
    </div>
  )
} 