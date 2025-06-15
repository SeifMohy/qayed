'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ChevronRightIcon, PencilIcon } from '@heroicons/react/20/solid'
import { TruckIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import PaymentTermsEditor from '@/components/shared/PaymentTermsEditor'
import type { PaymentTermsData } from '@/types/paymentTerms'
import { formatCurrency } from '@/lib/format'

interface InvoiceWithMatches {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  currency: string;
  invoiceStatus: string;
  dueDate: string;
  paidAmount: number;
  remainingAmount: number;
  paidDate: string | null;
}

interface MatchedTransaction {
  id: number;
  transactionDate: string;
  amount: number;
  description: string | null;
  bankName: string;
  matchScore: number;
  invoiceNumber: string;
}

interface SupplierDetail {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  relationshipSince: string;
  purchasesPastYear: number;
  paymentTerms: number;
  paymentTermsData: PaymentTermsData | null;
  paymentStatus: string;
  supplierRating: string;
  dueNext30Days: number;
  averageInvoiceAmount: number;
  country: string;
  totalPayables: number;
  averagePaymentTime: number | null;
  onTimePaymentPercentage: number | null;
  recentPayments: number;
  invoices: InvoiceWithMatches[];
  matchedTransactions: MatchedTransaction[];
  notes: string;
}

export default function SupplierProfile({ params }: { params: { id: string } }) {
  const supplierId = parseInt(params.id)
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingPaymentTerms, setIsEditingPaymentTerms] = useState(false)
  const [paymentTermsData, setPaymentTermsData] = useState<PaymentTermsData>({
    paymentPeriod: 'Net 30',
    downPayment: { required: false, dueDate: 'Due on signing' },
    installments: []
  })

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplierData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch supplier data')
        }
        const data = await response.json()
        setSupplier(data)
        
        // Initialize payment terms data
        if (data.paymentTermsData) {
          setPaymentTermsData(data.paymentTermsData)
        } else {
          // Convert legacy payment terms to new structure
          const legacyTerms = data.paymentTerms || 30
          setPaymentTermsData({
            paymentPeriod: `Net ${legacyTerms}`,
            downPayment: { required: false, dueDate: 'Due on signing' },
            installments: []
          })
        }
      } catch (err) {
        console.error('Error fetching supplier data:', err)
        setError('Could not load supplier data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplierData()
  }, [supplierId])

  const handlePaymentTermsUpdate = async () => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentTermsData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment terms')
      }

      if (supplier) {
        setSupplier({ 
          ...supplier, 
          paymentTermsData,
          // Update legacy field for backward compatibility
          paymentTerms: paymentTermsData.paymentPeriod.includes('Net ') 
            ? parseInt(paymentTermsData.paymentPeriod.replace('Net ', '')) || 30
            : paymentTermsData.paymentPeriod === 'Due on receipt' ? 0 : 30
        })
      }
      setIsEditingPaymentTerms(false)
    } catch (err) {
      console.error('Error updating payment terms:', err)
    }
  }

  const getPaymentTermsDisplay = () => {
    if (!supplier?.paymentTermsData) {
      return `${supplier?.paymentTerms || 30} days`
    }
    
    const terms = supplier.paymentTermsData
    let display = terms.paymentPeriod
    
    if (terms.downPayment?.required) {
      const amount = terms.downPayment.percentage 
        ? `${terms.downPayment.percentage}%` 
        : terms.downPayment.amount 
          ? `$${terms.downPayment.amount}` 
          : 'TBD'
      display += ` + ${amount} down payment`
    }
    
    if (terms.installments && terms.installments.length > 0) {
      display += ` + ${terms.installments.length} installments`
    }
    
    return display
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading supplier data...</p>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Supplier not found'}</p>
        <Link href="/dashboard/suppliers" className="mt-4 inline-flex items-center text-sm text-[#595CFF] hover:text-[#484adb]">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Suppliers
        </Link>
      </div>
    )
  }

  // Calculate metrics for overview
  const fullyPaidInvoices = supplier.invoices.filter(inv => inv.paidDate).length
  const onTimePayments = supplier.invoices.filter(invoice => {
    if (!invoice.paidDate) return false
    const paidDate = new Date(invoice.paidDate)
    const dueDate = new Date(invoice.dueDate)
    return paidDate <= dueDate
  }).length

  // If in Overview tab, render supplier overview metrics
  const renderOverviewContent = () => {
    if (!supplier) return null;
    
    return (
      <div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Due Next 30 Days</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(supplier.dueNext30Days || 0)}</p>
            <p className="mt-1 text-sm text-gray-500">Upcoming payments</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Average Payment Time</h3>
            <p className="text-2xl font-bold text-gray-900">
              {supplier.averagePaymentTime !== null ? `${supplier.averagePaymentTime} days` : 'N/A'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {supplier.averagePaymentTime !== null ? 'From invoice to payment' : 'No payment data yet'}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Total Outstanding</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(supplier.totalPayables)}
            </p>
            <p className="mt-1 text-sm text-gray-500">Amount owed</p>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Recent Invoices</h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplier.invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(invoice.paidAmount, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(invoice.remainingAmount, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      invoice.remainingAmount <= 0.01 ? 'bg-green-100 text-green-800' : 
                      invoice.invoiceStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {invoice.remainingAmount <= 0.01 ? 'Paid' : invoice.invoiceStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {supplier.invoices.length > 5 && (
            <div className="bg-gray-50 px-6 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[#595CFF] hover:text-[#484adb]"
                onClick={() => setActiveTab('invoices')}
              >
                View all invoices
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'invoices':
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Invoice History</h3>
              <p className="text-sm text-gray-500">{supplier?.invoices.length || 0} total invoices</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplier?.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(invoice.paidAmount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(invoice.remainingAmount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        invoice.remainingAmount <= 0.01 ? 'bg-green-100 text-green-800' : 
                        invoice.invoiceStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {invoice.remainingAmount <= 0.01 ? 'Paid' : invoice.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'transactions':
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Matched Transactions</h3>
              <p className="text-sm text-gray-500">{supplier?.matchedTransactions.length || 0} transactions</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplier?.matchedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {transaction.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.bankName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        transaction.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                        transaction.matchScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {transaction.matchScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {supplier?.matchedTransactions.length === 0 && (
              <div className="px-6 py-12 text-center">
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Transactions will appear here once bank statements are matched with invoices.</p>
              </div>
            )}
          </div>
        );
      case 'notes':
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Supplier Notes</h3>
              <p className="mt-1 text-sm text-gray-500">Notes functionality will be implemented in a future update</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-500 italic">No notes available for this supplier.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link 
          href="/dashboard/suppliers" 
          className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Suppliers
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
      </div>

      {/* Supplier Summary Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 flex items-start">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <TruckIcon className="h-10 w-10 text-blue-600" aria-hidden="true" />
          </div>
          <div className="ml-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.contact}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.country}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                  {!isEditingPaymentTerms ? (
                    <div className="flex items-center space-x-1">
                      <span>{getPaymentTermsDisplay()}</span>
                      <button
                        onClick={() => setIsEditingPaymentTerms(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Since</dt>
                <dd className="mt-1 text-sm text-gray-900">{supplier.relationshipSince}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms Editor Modal/Overlay */}
      {isEditingPaymentTerms && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Payment Terms</h3>
              <button
                onClick={() => setIsEditingPaymentTerms(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <PaymentTermsEditor
              value={paymentTermsData}
              onChange={setPaymentTermsData}
              className="mb-6"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditingPaymentTerms(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#595CFF]"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentTermsUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#595CFF] hover:bg-[#484adb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#595CFF]"
              >
                Save Payment Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: ClockIcon },
              { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon },
              { id: 'transactions', label: 'Transactions', icon: CurrencyDollarIcon },
              { id: 'notes', label: 'Notes', icon: DocumentTextIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  activeTab === tab.id
                    ? 'border-[#595CFF] text-[#595CFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center'
                )}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
} 