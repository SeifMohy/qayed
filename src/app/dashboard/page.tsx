'use client'

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import { CurrencyDollarIcon, BanknotesIcon, CreditCardIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
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

const stats = [
    {
        title: 'Total Cash On Hand',
        value: '$1,423,982',
        change: '3.2%',
        changeType: 'increase' as ChangeType,
        icon: CurrencyDollarIcon,
        iconColor: 'bg-green-500',
    },
    {
        title: 'Outstanding Payables (30 days)',
        value: '$459,871',
        change: '1.8%',
        changeType: 'decrease' as ChangeType,
        icon: BanknotesIcon,
        iconColor: 'bg-red-500',
        interpretation: 'positive' as const,
    },
    {
        title: 'Outstanding Receivables (30 days)',
        value: '$681,120',
        change: '5.2%',
        changeType: 'increase' as ChangeType,
        icon: CreditCardIcon,
        iconColor: 'bg-blue-500',
    },
    {
        title: 'Outstanding Bank Payments',
        value: '$181,000',
        change: '2.3%',
        changeType: 'increase' as ChangeType,
        icon: ArrowTrendingUpIcon,
        iconColor: 'bg-purple-500',
        interpretation: 'negative' as const,
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
    return (
        <div>
            
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            {/* Data Refresh Button */}
            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    <svg className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                    </svg>
                    Refresh Data
                </button>
            </div>

            {/* KPI Cards */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <KeyFigureCard
                        key={item.title}
                        title={item.title}
                        value={item.value}
                        icon={item.icon}
                        iconColor={item.iconColor}
                        change={item.change}
                        changeType={item.changeType}
                        interpretation={item.interpretation}
                    />
                ))}
            </div>

            {/* Cash Flow Chart */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Cash Position & Forecast (90 Days)</h3>
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
                                            return '$' + (value).toLocaleString();
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
            </div>

            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Upcoming Supplier Payments */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Supplier Payments</h3>
                        <p className="mt-1 text-sm text-gray-500">Total: $131,550 due in the next 30 days</p>
                    </div>
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
                        <div className="mt-4">
                            <a
                                href="/dashboard/suppliers"
                                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                View All Suppliers
                            </a>
                        </div>
                    </div>
                </div>

                {/* Upcoming Customer Payments */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Customer Payments</h3>
                        <p className="mt-1 text-sm text-gray-500">Total: $200,000 expected in the next 30 days</p>
                    </div>
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
                                                            payment.status === 'Scheduled' ? 'text-green-600' : 'text-yellow-600'
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
                        <div className="mt-4">
                            <a
                                href="/dashboard/customers"
                                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                View All Customers
                            </a>
                        </div>
                    </div>
                </div>

                {/* Upcoming Banking Obligations */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Banking Obligations</h3>
                        <p className="mt-1 text-sm text-gray-500">Total: $180,950 due in the next 30 days</p>
                    </div>
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
                                                        <p className="font-medium text-gray-900">{obligation.amount}</p>
                                                        <time className="text-gray-500">{obligation.dueDate}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <a
                                href="/dashboard/banks"
                                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                View All Banks
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
} 