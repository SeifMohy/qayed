'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { BanknotesIcon, BuildingLibraryIcon, DocumentTextIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

// Mock bank data - in a real app this would come from an API
const banks = [
    {
        id: 1,
        name: 'First National Bank',
        logoBackground: 'bg-blue-100',
        relationshipManager: 'Robert Thompson',
        email: 'r.thompson@firstnational.com',
        phone: '(555) 123-9876',
        relationshipSince: 'Jan 2015',
        bankingFees: '$1,850/quarter',
        nextReviewDate: 'Dec 15, 2023',
        accounts: [
            {
                id: 1,
                accountNumber: 'xxxx-xxxx-8475',
                balance: '$758,492.32',
                type: 'Operating Account',
                currency: 'USD',
                interestRate: '0.75%',
                lastUpdate: 'Today at 9:41 AM',
            },
            {
                id: 2,
                accountNumber: 'xxxx-xxxx-7392',
                balance: '$125,000.00',
                type: 'Reserve Account',
                currency: 'USD',
                interestRate: '1.25%',
                lastUpdate: 'Today at 9:41 AM',
            }
        ],
        facilities: [
            {
                id: 1,
                facilityType: 'Line of Credit',
                limit: '$1,000,000.00',
                used: '$350,000.00',
                available: '$650,000.00',
                interestRate: '5.25%',
                expiryDate: 'Dec 31, 2024',
                covenants: 'Current ratio > 1.2x, Debt service ratio > 1.5x',
            }
        ],
        transactions: [
            { id: 1, date: '2023-07-05', account: 'xxxx-xxxx-8475', description: 'Payment from Enterprise Solutions', amount: '$86,000.00', type: 'credit' },
            { id: 2, date: '2023-07-03', account: 'xxxx-xxxx-8475', description: 'Payment to Tech Innovations Ltd', amount: '$42,000.00', type: 'debit' },
            { id: 3, date: '2023-06-30', account: 'xxxx-xxxx-8475', description: 'Monthly Service Fee', amount: '$125.00', type: 'debit' },
            { id: 4, date: '2023-06-28', account: 'xxxx-xxxx-8475', description: 'Interest Payment', amount: '$354.21', type: 'credit' },
            { id: 5, date: '2023-06-25', account: 'xxxx-xxxx-8475', description: 'Payment to Global Shipping Co.', amount: '$18,500.00', type: 'debit' },
        ],
        notes: 'Primary banking relationship with favorable terms. Recent facility review secured additional $250,000 on line of credit. Relationship manager suggested exploring trade financing options for international expansion.'
    },
    {
        id: 2,
        name: 'Central Finance',
        logoBackground: 'bg-green-100',
        relationshipManager: 'Jessica Miller',
        email: 'jessica.miller@centralfinance.com',
        phone: '(555) 456-7890',
        relationshipSince: 'Mar 2018',
        bankingFees: '$1,200/quarter',
        nextReviewDate: 'Feb 28, 2024',
        accounts: [
            {
                id: 1,
                accountNumber: 'xxxx-xxxx-3829',
                balance: '$245,872.12',
                type: 'Savings Account',
                currency: 'USD',
                interestRate: '1.85%',
                lastUpdate: 'Today at 9:41 AM',
            }
        ],
        facilities: [
            {
                id: 1,
                facilityType: 'Term Loan',
                limit: '$500,000.00',
                used: '$500,000.00',
                available: '$0.00',
                interestRate: '4.75%',
                expiryDate: 'Jun 30, 2025',
                covenants: 'Debt-to-equity ratio < 0.5, Interest coverage > 3.0x',
            }
        ],
        transactions: [
            { id: 1, date: '2023-07-01', account: 'xxxx-xxxx-3829', description: 'Quarterly Loan Payment', amount: '$18,750.00', type: 'debit' },
            { id: 2, date: '2023-06-30', account: 'xxxx-xxxx-3829', description: 'Interest Income', amount: '$1,247.65', type: 'credit' },
            { id: 3, date: '2023-06-15', account: 'xxxx-xxxx-3829', description: 'Transfer from Operating Account', amount: '$50,000.00', type: 'credit' },
            { id: 4, date: '2023-06-01', account: 'xxxx-xxxx-3829', description: 'Service Fees', amount: '$95.00', type: 'debit' },
            { id: 5, date: '2023-05-30', account: 'xxxx-xxxx-3829', description: 'Interest Income', amount: '$1,183.42', type: 'credit' },
        ],
        notes: 'Secondary banking relationship, primarily for backup liquidity and term loans. Higher interest on savings but less flexible on credit facilities. Good option for longer-term deposits.'
    },
    {
        id: 3,
        name: 'International Banking',
        logoBackground: 'bg-purple-100',
        relationshipManager: 'Michael Zhang',
        email: 'm.zhang@intlbanking.com',
        phone: '(555) 789-0123',
        relationshipSince: 'Sep 2020',
        bankingFees: '€1,500/quarter',
        nextReviewDate: 'Oct 15, 2023',
        accounts: [
            {
                id: 1,
                accountNumber: 'xxxx-xxxx-9231',
                balance: '€419,617.65',
                type: 'Foreign Currency Account (EUR)',
                currency: 'EUR',
                interestRate: '0.25%',
                lastUpdate: 'Today at 9:41 AM',
            }
        ],
        facilities: [],
        transactions: [
            { id: 1, date: '2023-06-28', account: 'xxxx-xxxx-9231', description: 'Payment from Retail Chain Corp', amount: '€32,450.00', type: 'credit' },
            { id: 2, date: '2023-06-15', account: 'xxxx-xxxx-9231', description: 'Payment to European Suppliers Ltd', amount: '€24,785.00', type: 'debit' },
            { id: 3, date: '2023-06-05', account: 'xxxx-xxxx-9231', description: 'Foreign Exchange Fee', amount: '€175.50', type: 'debit' },
            { id: 4, date: '2023-06-01', account: 'xxxx-xxxx-9231', description: 'Service Charge', amount: '€125.00', type: 'debit' },
            { id: 5, date: '2023-05-22', account: 'xxxx-xxxx-9231', description: 'Payment from EU Distribution', amount: '€45,890.00', type: 'credit' },
        ],
        notes: 'International banking relationship for European operations. Provides efficient forex services and international wire transfers. Consider negotiating banking fees down at next review based on increased transaction volume.'
    }
]

// Cash flow forecast data
const cashFlowForecast = [
    { month: 'Aug', inflows: 425000, outflows: 372000 },
    { month: 'Sep', inflows: 478000, outflows: 391000 },
    { month: 'Oct', inflows: 512000, outflows: 435000 },
    { month: 'Nov', inflows: 498000, outflows: 452000 },
    { month: 'Dec', inflows: 587000, outflows: 513000 },
    { month: 'Jan', inflows: 432000, outflows: 389000 },
]

export default function BankProfile({ params }: { params: { id: string } }) {
    const bankId = parseInt(params.id)
    const bank = banks.find(b => b.id === bankId) || banks[0]
    const [activeTab, setActiveTab] = useState('overview')

    // Calculate metrics
    const totalBalance = bank.accounts.reduce((sum, account) => {
        let balance = account.balance.replace(/[^0-9.-]+/g, '')
        return sum + parseFloat(balance)
    }, 0)

    const totalCredit = bank.facilities.reduce((sum, facility) => {
        let limit = facility.limit.replace(/[^0-9.-]+/g, '')
        return sum + parseFloat(limit)
    }, 0)

    const totalAvailable = bank.facilities.reduce((sum, facility) => {
        let available = facility.available.replace(/[^0-9.-]+/g, '')
        return sum + parseFloat(available)
    }, 0)

    return (
        <div>
            <div className="flex items-center mb-6">
                <Link
                    href="/dashboard/banks"
                    className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Banks
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900">{bank.name}</h1>
            </div>

            {/* Bank Summary Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="p-6 flex items-start">
                    <div className={`flex-shrink-0 h-16 w-16 rounded-full ${bank.logoBackground} flex items-center justify-center`}>
                        <BuildingLibraryIcon className="h-10 w-10 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="ml-6">
                        <h2 className="text-xl font-medium text-gray-900">{bank.name}</h2>
                        <div className="mt-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                            <div>
                                <dt className="text-gray-500">Relationship Manager</dt>
                                <dd className="font-medium text-gray-900">{bank.relationshipManager}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Email</dt>
                                <dd className="font-medium text-gray-900">{bank.email}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Phone</dt>
                                <dd className="font-medium text-gray-900">{bank.phone}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Relationship</dt>
                                <dd className="font-medium text-gray-900">Since {bank.relationshipSince}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Banking Fees</dt>
                                <dd className="font-medium text-gray-900">{bank.bankingFees}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Next Review</dt>
                                <dd className="font-medium text-gray-900">{bank.nextReviewDate}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Total Accounts</dt>
                                <dd className="font-medium text-gray-900">{bank.accounts.length}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Credit Facilities</dt>
                                <dd className="font-medium text-gray-900">{bank.facilities.length}</dd>
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
                        onClick={() => setActiveTab('accounts')}
                        className={clsx(
                            activeTab === 'accounts'
                                ? 'border-[#595CFF] text-[#595CFF]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('facilities')}
                        className={clsx(
                            activeTab === 'facilities'
                                ? 'border-[#595CFF] text-[#595CFF]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        Facilities
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={clsx(
                            activeTab === 'transactions'
                                ? 'border-[#595CFF] text-[#595CFF]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
                        )}
                    >
                        Transactions
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <BanknotesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Total Cash Balance</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{`$${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}</div>
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
                                            <dt className="truncate text-sm font-medium text-gray-500">Total Credit Limit</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{`$${totalCredit.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}</div>
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
                                        <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Available Credit</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{`$${totalAvailable.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow Forecast Chart */}
                    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Cash Flow</h3>
                        </div>
                        <div className="p-6">
                            <div className="h-64">
                                <Bar
                                    data={{
                                        labels: cashFlowForecast.map(month => month.month),
                                        datasets: [
                                            {
                                                label: 'Cash Inflows',
                                                data: cashFlowForecast.map(month => month.inflows),
                                                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                                                borderColor: 'rgb(34, 197, 94)',
                                                borderWidth: 1,
                                            },
                                            {
                                                label: 'Cash Outflows',
                                                data: cashFlowForecast.map(month => month.outflows),
                                                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                                                borderColor: 'rgb(239, 68, 68)',
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                            title: {
                                                display: false,
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    footer: (tooltipItems) => {
                                                        const datasetIndex = tooltipItems[0].datasetIndex;
                                                        const index = tooltipItems[0].dataIndex;

                                                        if (datasetIndex === 0 || datasetIndex === 1) {
                                                            const inflow = cashFlowForecast[index].inflows;
                                                            const outflow = cashFlowForecast[index].outflows;
                                                            const netFlow = inflow - outflow;
                                                            return `Net Flow: ${netFlow >= 0 ? '+' : ''}$${netFlow.toLocaleString()}`;
                                                        }
                                                        return '';
                                                    },
                                                },
                                            },
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    display: false,
                                                },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: function (value) {
                                                        return '$' + (value).toLocaleString();
                                                    }
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-4">
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium">Total Inflows:</span> ${cashFlowForecast.reduce((acc, month) => acc + month.inflows, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium">Total Outflows:</span> ${cashFlowForecast.reduce((acc, month) => acc + month.outflows, 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-900 font-medium">
                                    <span>Net Flow:</span> $
                                    {cashFlowForecast.reduce((acc, month) => acc + (month.inflows - month.outflows), 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Accounts</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            All accounts with {bank.name}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Currency
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest Rate
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bank.accounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {account.accountNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {account.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {account.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {account.balance}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {account.interestRate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {account.lastUpdate}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Account Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Transfer Funds
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Download Statement
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Credit Facilities</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            All credit facilities with {bank.name}
                        </p>
                    </div>
                    {bank.facilities.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Limit
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Used
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Available
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Interest Rate
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expiry Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bank.facilities.map((facility) => (
                                            <tr key={facility.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {facility.facilityType}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.limit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.used}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.available}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.interestRate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {facility.expiryDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900">Covenants</h4>
                                <p className="mt-1 text-sm text-gray-700">{bank.facilities[0]?.covenants || "No covenants"}</p>
                            </div>
                        </>
                    ) : (
                        <div className="px-6 py-4 text-center text-sm text-gray-500">
                            No credit facilities available for this bank.
                        </div>
                    )}

                    {/* Facility Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Request New Facility
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Review Covenants
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Last 30 days of transaction history.
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
                                        Account
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bank.transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.account}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className={clsx(
                                            "px-6 py-4 whitespace-nowrap text-sm font-medium text-right",
                                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {transaction.type === 'credit' ? '+' : '-'} {transaction.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Transaction Analysis */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900">Transaction Summary</h4>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500">Total Credits</p>
                                <p className="text-lg font-medium text-green-600">
                                    ${bank.transactions
                                        .filter(t => t.type === 'credit')
                                        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0)
                                        .toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500">Total Debits</p>
                                <p className="text-lg font-medium text-red-600">
                                    ${bank.transactions
                                        .filter(t => t.type === 'debit')
                                        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0)
                                        .toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500">Net Flow</p>
                                <p className="text-lg font-medium text-gray-900">
                                    ${(
                                        bank.transactions
                                            .filter(t => t.type === 'credit')
                                            .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0) -
                                        bank.transactions
                                            .filter(t => t.type === 'debit')
                                            .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]+/g, '')), 0)
                                    ).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Bank Notes</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-900">{bank.notes}</p>
                        <div className="mt-6">
                            <label htmlFor="new-note" className="block text-sm font-medium text-gray-700">Add a note</label>
                            <div className="mt-1">
                                <textarea
                                    id="new-note"
                                    name="new-note"
                                    rows={4}
                                    className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                                    placeholder="Add your notes about this banking relationship here..."
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