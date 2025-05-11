'use client'

import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import Link from 'next/link'
import KeyFigureCard from '@/components/key-figure-card'

const bankAccounts = [
  {
    id: 1,
    name: 'First National Bank',
    cashBalance: '$758,492.32',
    bankPayments: '$42,000.00',
    lastUpdate: 'Today at 9:41 AM',
  },
  {
    id: 2,
    name: 'Central Finance',
    cashBalance: '$245,872.12',
    bankPayments: '$18,750.00',
    lastUpdate: 'Today at 9:41 AM',
  },
  {
    id: 3,
    name: 'International Banking',
    cashBalance: '$419,617.65',
    bankPayments: '$0.00',
    lastUpdate: 'Today at 9:41 AM',
  },
]

const creditFacilities = [
  {
    id: 1,
    name: 'First National Bank',
    facilityType: 'Line of Credit',
    limit: '$1,000,000.00',
    used: '$350,000.00',
    available: '$650,000.00',
    interestRate: '5.25%',
    expiryDate: 'Dec 31, 2024',
  },
  {
    id: 2,
    name: 'Central Finance',
    facilityType: 'Term Loan',
    limit: '$500,000.00',
    used: '$500,000.00',
    available: '$0.00',
    interestRate: '4.75%',
    expiryDate: 'Jun 30, 2025',
  },
]

const recentTransactions = [
  {
    id: 1,
    bank: 'First National Bank',
    date: 'Jul 5, 2023',
    description: 'Payment from Enterprise Solutions',
    amount: '$86,000.00',
    type: 'credit',
  },
  {
    id: 2,
    bank: 'First National Bank',
    date: 'Jul 3, 2023',
    description: 'Payment to Tech Innovations Ltd',
    amount: '$42,000.00',
    type: 'debit',
  },
  {
    id: 3,
    bank: 'Central Finance',
    date: 'Jul 1, 2023',
    description: 'Quarterly Loan Payment',
    amount: '$18,750.00',
    type: 'debit',
  },
  {
    id: 4,
    bank: 'International Banking',
    date: 'Jun 28, 2023',
    description: 'Payment from Retail Chain Corp (EUR)',
    amount: '€32,450.00',
    type: 'credit',
  },
  {
    id: 5,
    bank: 'First National Bank',
    date: 'Jun 25, 2023',
    description: 'Payment to Global Shipping Co.',
    amount: '$18,500.00',
    type: 'debit',
  },
]

export default function BanksPage() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Banks & Accounts</h1>
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Refresh Data
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-[#595CFF] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#484adb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#595CFF]"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Bank Account
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <KeyFigureCard
          title="Total Cash on Hand"
          value="$1,423,982.09"
          icon={() => (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          iconColor="bg-blue-500"
        />

        <KeyFigureCard
          title="Total Credit Available"
          value="$650,000.00"
          icon={() => (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          iconColor="bg-green-500"
        />

        <KeyFigureCard
          title="Upcoming Bank Obligations (30 days)"
          value="$60,950.00"
          icon={() => (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          )}
          iconColor="bg-red-500"
        />
      </div>

      {/* Bank Accounts */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Banks</h2>
      <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Bank Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Cash Balance
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Bank Obligations
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Last Updated
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {bankAccounts.map((account) => (
              <tr key={account.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {account.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{account.cashBalance}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{account.bankPayments}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{account.lastUpdate}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link 
                    href={`/dashboard/banks/${account.id}`} 
                    className="text-[#595CFF] hover:text-[#484adb]"
                  >
                    View<span className="sr-only">, {account.name}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Credit Facilities */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Credit Facilities</h2>
      <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Bank
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Facility Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Limit
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Used
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Available
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Interest Rate
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Expiry Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {creditFacilities.map((facility) => (
              <tr key={facility.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {facility.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{facility.facilityType}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{facility.limit}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{facility.used}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{facility.available}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{facility.interestRate}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{facility.expiryDate}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link 
                    href={`/dashboard/banks/${facility.id}`} 
                    className="text-[#595CFF] hover:text-[#484adb]"
                  >
                    View<span className="sr-only">, {facility.name}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Important Transactions</h2>
      <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Date
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Bank
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Description
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                Amount
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {recentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                  {transaction.date}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.bank}</td>
                <td className="px-3 py-4 text-sm text-gray-500">{transaction.description}</td>
                <td className={clsx(
                  "whitespace-nowrap px-3 py-4 text-sm font-medium text-right",
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.type === 'credit' ? '+' : '-'} {transaction.amount}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link 
                    href={`/dashboard/banks/${transaction.id}`} 
                    className="text-[#595CFF] hover:text-[#484adb]"
                  >
                    View<span className="sr-only">, {transaction.description}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 