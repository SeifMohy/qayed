'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { UserGroupIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface InvoiceHistory {
  id: number;
  date: string;
  invoice: string;
  amount: string;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

interface CustomerDetail {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  relationshipSince: string;
  salesPastYear: string;
  grantedFacilities: string;
  paymentTerms: string;
  percentOfTotalSales: string;
  paymentStatus: string;
  creditScore: string;
  history: InvoiceHistory[];
  notes: string;
  averageInvoiceAmount?: string;
  country?: string;
}

export default function CustomerProfile({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/customers/${customerId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch customer data')
        }
        const data = await response.json()
        setCustomer(data)
      } catch (err) {
        console.error('Error fetching customer data:', err)
        setError('Could not load customer data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerId])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading customer data...</p>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Customer not found'}</p>
        <Link href="/dashboard/customers" className="mt-4 inline-flex items-center text-sm text-[#595CFF] hover:text-[#484adb]">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Customers
        </Link>
      </div>
    )
  }

  // If in Overview tab, render customer overview metrics
  const renderOverviewContent = () => {
    if (!customer) return null;
    
    // Calculate metrics
    const totalInvoiced = customer.history.reduce(
      (sum, invoice) => sum + parseFloat(invoice.amount.replace(/[$,]/g, '')), 
      0
    );
    
    // Calculate payment stats based on bank data when it becomes available
    // For now, show placeholders with explanations where relevant
    
    return (
      <div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Total Purchases</h3>
            <p className="text-2xl font-bold text-gray-900">{customer.salesPastYear}</p>
            <p className="mt-1 text-sm text-gray-500">Lifetime value</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Average Invoice</h3>
            <p className="text-2xl font-bold text-gray-900">{customer.averageInvoiceAmount || 'N/A'}</p>
            <p className="mt-1 text-sm text-gray-500">Based on {customer.history.length} invoices</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Average Payment Time</h3>
            <p className="text-2xl font-bold text-gray-900">N/A</p>
            <p className="mt-1 text-sm text-gray-500">Requires bank statement data</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">On-Time Payments</h3>
            <p className="text-2xl font-bold text-gray-900">N/A</p>
            <p className="mt-1 text-sm text-gray-500">Requires bank statement data</p>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Recent Invoices</h3>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customer.history.slice(0, 5).map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                      invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customer.history.length > 5 && (
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
              <p className="text-sm text-gray-500">{customer?.history.length || 0} total invoices</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer?.history.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'notes':
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Customer Notes</h3>
              <p className="mt-1 text-sm text-gray-500">Notes functionality will be implemented in a future update</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-500 italic">No notes available for this customer.</p>
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
          href="/dashboard/customers" 
          className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Customers
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
      </div>

      {/* Customer Summary Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 flex items-start">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <UserGroupIcon className="h-10 w-10 text-blue-600" aria-hidden="true" />
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-medium text-gray-900">{customer.name}</h2>
            <div className="mt-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-gray-500">Contact</dt>
                <dd className="font-medium text-gray-900">{customer.contact}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{customer.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Industry</dt>
                <dd className="font-medium text-gray-900">{customer.industry}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Relationship</dt>
                <dd className="font-medium text-gray-900">Since {customer.relationshipSince}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Payment Terms</dt>
                <dd className="font-medium text-gray-900">{customer.paymentTerms}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Credit Score</dt>
                <dd className="font-medium text-gray-900">{customer.creditScore}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Payment Status</dt>
                <dd className={clsx(
                  "font-medium",
                  customer.paymentStatus.includes('On Time') 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                )}>
                  {customer.paymentStatus}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              activeTab === 'overview'
                ? 'border-[#595CFF] text-[#595CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={clsx(
              activeTab === 'invoices'
                ? 'border-[#595CFF] text-[#595CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            Invoice History
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={clsx(
              activeTab === 'notes'
                ? 'border-[#595CFF] text-[#595CFF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
            )}
          >
            Notes
          </button>
        </nav>
      </div>

      {/* Render content based on active tab */}
      {renderTabContent()}
    </div>
  )
} 