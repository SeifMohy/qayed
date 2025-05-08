'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { UserGroupIcon, ClockIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

// Mock customer data - in a real app this would come from an API
const customers = [
  {
    id: 1,
    name: 'Enterprise Solutions',
    contact: 'Sarah Johnson',
    email: 'sarah@enterprise-solutions.com',
    phone: '(555) 123-4567',
    industry: 'Technology',
    relationshipSince: 'Jan 2018',
    salesPastYear: '$1,250,000',
    grantedFacilities: '$250,000',
    paymentTerms: 'Net 30',
    percentOfTotalSales: '35%',
    paymentStatus: 'On Time',
    creditScore: '85/100',
    history: [
      { id: 1, date: '2023-06-15', invoice: 'INV-2023-0568', amount: '$86,000', status: 'Paid', dueDate: '2023-07-15', paidDate: '2023-07-13' },
      { id: 2, date: '2023-05-02', invoice: 'INV-2023-0432', amount: '$124,500', status: 'Paid', dueDate: '2023-06-01', paidDate: '2023-06-03' },
      { id: 3, date: '2023-04-18', invoice: 'INV-2023-0365', amount: '$53,200', status: 'Paid', dueDate: '2023-05-18', paidDate: '2023-05-15' },
      { id: 4, date: '2023-03-07', invoice: 'INV-2023-0287', amount: '$97,300', status: 'Paid', dueDate: '2023-04-07', paidDate: '2023-04-06' },
      { id: 5, date: '2023-02-22', invoice: 'INV-2023-0143', amount: '$112,000', status: 'Paid', dueDate: '2023-03-22', paidDate: '2023-03-20' },
    ],
    notes: 'Strategic enterprise client with consistent growth. Recent expansion of their operations suggests potential for increased sales volume in the next quarter. Credit line increase may be appropriate to consider.',
  },
  {
    id: 2,
    name: 'Retail Chain Corp',
    contact: 'Michael Chen',
    email: 'mchen@retailchain.com',
    phone: '(555) 987-6543',
    industry: 'Retail',
    relationshipSince: 'Mar 2019',
    salesPastYear: '$850,000',
    grantedFacilities: '$150,000',
    paymentTerms: 'Net 45',
    percentOfTotalSales: '24%',
    paymentStatus: 'Late (15 days)',
    creditScore: '72/100',
    history: [
      { id: 1, date: '2023-06-01', invoice: 'INV-2023-0522', amount: '$34,200', status: 'Overdue', dueDate: '2023-07-16', paidDate: null },
      { id: 2, date: '2023-05-15', invoice: 'INV-2023-0496', amount: '$56,300', status: 'Paid', dueDate: '2023-06-30', paidDate: '2023-07-12' },
      { id: 3, date: '2023-04-02', invoice: 'INV-2023-0344', amount: '$78,500', status: 'Paid', dueDate: '2023-05-17', paidDate: '2023-05-23' },
      { id: 4, date: '2023-03-18', invoice: 'INV-2023-0312', amount: '$45,700', status: 'Paid', dueDate: '2023-05-02', paidDate: '2023-05-01' },
      { id: 5, date: '2023-02-05', invoice: 'INV-2023-0124', amount: '$92,300', status: 'Paid', dueDate: '2023-03-22', paidDate: '2023-04-05' },
    ],
    notes: 'Seasonal business with occasional payment delays. Recent market expansion has stretched their cashflow. Consider discussing payment terms or offering early payment incentives.',
  },
  // Additional customers would be listed here
]

// Payment patterns chart data (simplified)
const paymentPatternData = [
  { month: 'Jan', onTime: 3, late: 0, early: 1 },
  { month: 'Feb', onTime: 2, late: 1, early: 0 },
  { month: 'Mar', onTime: 2, late: 0, early: 2 },
  { month: 'Apr', onTime: 1, late: 2, early: 1 },
  { month: 'May', onTime: 3, late: 0, early: 1 },
  { month: 'Jun', onTime: 2, late: 1, early: 0 },
]

export default function CustomerProfile({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id)
  const customer = customers.find(c => c.id === customerId) || customers[0]
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate metrics
  const totalInvoiced = customer.history.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace('$', '').replace(',', '')), 0)
  const onTimePayments = customer.history.filter(invoice => invoice.status === 'Paid' && new Date(invoice.paidDate!) <= new Date(invoice.dueDate)).length
  const latePayments = customer.history.filter(invoice => invoice.status === 'Paid' && new Date(invoice.paidDate!) > new Date(invoice.dueDate)).length
  const paymentRatio = customer.history.length > 0 ? Math.round((onTimePayments / customer.history.length) * 100) : 0

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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Financial Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Annual Sales</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{customer.salesPastYear}</div>
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
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Granted Facilities</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{customer.grantedFacilities}</div>
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
                      <dt className="truncate text-sm font-medium text-gray-500">On-Time Payment %</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{paymentRatio}%</div>
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
                    <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">% of Total Sales</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{customer.percentOfTotalSales}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Patterns Chart */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Patterns</h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="w-full">
                  <div className="flex justify-between mb-2">
                    {paymentPatternData.map(month => (
                      <div key={month.month} className="text-xs text-gray-500">{month.month}</div>
                    ))}
                  </div>
                  
                  <div className="flex h-40 items-end">
                    {paymentPatternData.map(month => (
                      <div key={month.month} className="flex-1 flex flex-col items-center space-y-1">
                        {month.late > 0 && (
                          <div 
                            style={{height: `${month.late * 20}px`}} 
                            className="w-4/6 bg-red-300 rounded-t"
                          ></div>
                        )}
                        {month.onTime > 0 && (
                          <div 
                            style={{height: `${month.onTime * 20}px`}} 
                            className="w-4/6 bg-blue-300 rounded-t"
                          ></div>
                        )}
                        {month.early > 0 && (
                          <div 
                            style={{height: `${month.early * 20}px`}} 
                            className="w-4/6 bg-green-300 rounded-t"
                          ></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-4 space-x-6">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-sm bg-green-300 mr-1"></span>
                      <span className="text-xs text-gray-600">Early</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-sm bg-blue-300 mr-1"></span>
                      <span className="text-xs text-gray-600">On Time</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-sm bg-red-300 mr-1"></span>
                      <span className="text-xs text-gray-600">Late</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice History</h3>
            <p className="mt-1 text-sm text-gray-500">
              A complete list of invoices and payment history.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.history.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        invoice.status === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'Overdue' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      )}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Notes</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-900">{customer.notes}</p>
            <div className="mt-6">
              <label htmlFor="new-note" className="block text-sm font-medium text-gray-700">Add a note</label>
              <div className="mt-1">
                <textarea
                  id="new-note"
                  name="new-note"
                  rows={4}
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Add your notes here..."
                ></textarea>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#595CFF] hover:bg-[#4749cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 