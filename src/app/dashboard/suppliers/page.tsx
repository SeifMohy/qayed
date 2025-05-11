import { ArrowPathIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/20/solid'
import { CreditCardIcon, CurrencyDollarIcon, TruckIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const stats = [
  {
    name: 'Total Received Orders',
    value: '$850,000',
    icon: CreditCardIcon,
    iconColor: 'bg-blue-500',
    change: '+3.8% from last quarter',
    changeType: 'increase',
  },
  {
    name: 'Upcoming Payments',
    value: '$131,550',
    icon: CurrencyDollarIcon,
    iconColor: 'bg-red-500',
    change: '+7.2% from last month',
    changeType: 'increase',
  },
  {
    name: 'Ratio of Purchases to Orders',
    value: '3.2x',
    icon: CalendarIcon,
    iconColor: 'bg-purple-500',
    change: '+0.1x from last quarter',
    changeType: 'increase',
  },
  {
    name: 'Average Payment Time',
    value: '28 days',
    icon: TruckIcon,
    iconColor: 'bg-green-500',
    change: '+2 days from last quarter',
    changeType: 'increase',
  },
]

const suppliers = [
  {
    id: 1,
    name: 'Tech Innovations Ltd',
    purchasesPastYear: '$950,000',
    receivedOrders: '$750,000',
    ordersInTransit: '$200,000',
    outstandingPayments: '$180,000',
    percentPaidOrders: '76%',
    numberOfOrders: 32,
  },
  {
    id: 2,
    name: 'Global Shipping Co.',
    purchasesPastYear: '$650,000',
    receivedOrders: '$590,000',
    ordersInTransit: '$60,000',
    outstandingPayments: '$120,000',
    percentPaidOrders: '80%',
    numberOfOrders: 24,
  },
  {
    id: 3,
    name: 'Office Supplies Inc.',
    purchasesPastYear: '$350,000',
    receivedOrders: '$320,000',
    ordersInTransit: '$30,000',
    outstandingPayments: '$50,000',
    percentPaidOrders: '84%',
    numberOfOrders: 18,
  },
  {
    id: 4,
    name: 'Manufacturing Partners',
    purchasesPastYear: '$720,000',
    receivedOrders: '$580,000',
    ordersInTransit: '$140,000',
    outstandingPayments: '$220,000',
    percentPaidOrders: '62%',
    numberOfOrders: 27,
  },
  {
    id: 5,
    name: 'Industrial Materials Corp',
    purchasesPastYear: '$290,000',
    receivedOrders: '$250,000',
    ordersInTransit: '$40,000',
    outstandingPayments: '$75,000',
    percentPaidOrders: '70%',
    numberOfOrders: 15,
  },
]

export default function Suppliers() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
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
            Add Accounts Payable
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
                    ? (stat.name === 'Upcoming Payments' || stat.name === 'Average Payment Time' ? 'text-red-600' : 'text-green-600')
                    : stat.changeType === 'decrease' 
                      ? (stat.name === 'Upcoming Payments' || stat.name === 'Average Payment Time' ? 'text-green-600' : 'text-red-600')
                      : 'text-gray-500'
                )}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Suppliers Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Suppliers Overview</h3>
          <p className="mt-1 text-sm text-gray-500">
            A summary of all your supplier relationships and procurement obligations.
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
                  Supplier Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Purchases Past Year
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Received Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Orders in Transit
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Outstanding Payments
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  % Paid Orders
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
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <TruckIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.purchasesPastYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.receivedOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.ordersInTransit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.outstandingPayments}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.percentPaidOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.numberOfOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href={`/dashboard/suppliers/${supplier.id}`} 
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