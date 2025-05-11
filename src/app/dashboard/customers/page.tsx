import { ArrowPathIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/20/solid'
import { CreditCardIcon, CurrencyDollarIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const stats = [
  {
    name: 'Total Delivered Sales',
    value: '$1,250,000',
    icon: CreditCardIcon,
    iconColor: 'bg-blue-500',
    change: '+5.2% from last quarter',
    changeType: 'increase',
  },
  {
    name: 'Upcoming Incoming Payments',
    value: '$200,000',
    icon: CurrencyDollarIcon,
    iconColor: 'bg-green-500',
    change: '+12.3% from last month',
    changeType: 'increase',
  },
  {
    name: 'Ratio of Sales to Delivered',
    value: '2.8x',
    icon: CalendarIcon,
    iconColor: 'bg-purple-500',
    change: '+0.3x from last quarter',
    changeType: 'increase',
  },
  {
    name: 'Average Payment Time',
    value: '34 days',
    icon: UserGroupIcon,
    iconColor: 'bg-yellow-500',
    change: '-2 days from last quarter',
    changeType: 'decrease',
  },
]

const customers = [
  {
    id: 1,
    name: 'Enterprise Solutions',
    salesPastYear: '$1,250,000',
    deliveredSales: '$850,000',
    nonDeliveredSalesOrders: '$400,000',
    amountPaid: '$750,000',
    pendingPayments: '$100,000',
    percentPaid: '88%',
    numberOfOrders: 25,
  },
  {
    id: 2,
    name: 'Retail Chain Corp',
    salesPastYear: '$850,000',
    deliveredSales: '$700,000',
    nonDeliveredSalesOrders: '$150,000',
    amountPaid: '$550,000',
    pendingPayments: '$150,000',
    percentPaid: '79%',
    numberOfOrders: 18,
  },
  {
    id: 3,
    name: 'Digital Services LLC',
    salesPastYear: '$720,000',
    deliveredSales: '$600,000',
    nonDeliveredSalesOrders: '$120,000',
    amountPaid: '$580,000',
    pendingPayments: '$20,000',
    percentPaid: '97%',
    numberOfOrders: 14,
  },
  {
    id: 4,
    name: 'Financial Partners',
    salesPastYear: '$450,000',
    deliveredSales: '$380,000',
    nonDeliveredSalesOrders: '$70,000',
    amountPaid: '$320,000',
    pendingPayments: '$60,000',
    percentPaid: '84%',
    numberOfOrders: 9,
  },
  {
    id: 5,
    name: 'Tech Innovations Inc',
    salesPastYear: '$280,000',
    deliveredSales: '$230,000',
    nonDeliveredSalesOrders: '$50,000',
    amountPaid: '$210,000',
    pendingPayments: '$20,000',
    percentPaid: '91%',
    numberOfOrders: 6,
  },
]

export default function Customers() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
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
            Add Account Receivable
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={clsx('absolute rounded-md p-3', stat.iconColor)}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={clsx(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  stat.changeType === 'increase' 
                    ? 'text-green-600' 
                    : stat.changeType === 'decrease' 
                      ? (stat.name === 'Average Payment Time' ? 'text-green-600' : 'text-red-600') 
                      : 'text-gray-500'
                )}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Customers Overview</h3>
          <p className="mt-1 text-sm text-gray-500">
            A summary of all your customer relationships and payment histories.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sales Past Year
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Delivered Sales
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Non-Delivered Sales Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount Paid
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pending Payments
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  % Paid of Sales
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Number of Orders
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View Details</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.salesPastYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.deliveredSales}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.nonDeliveredSalesOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.amountPaid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.pendingPayments}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.percentPaid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.numberOfOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href={`/dashboard/customers/${customer.id}`} 
                      className="text-[#595CFF] hover:text-[#4749cc] inline-flex items-center"
                    >
                      View Details
                      <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 