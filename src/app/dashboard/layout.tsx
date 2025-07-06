'use client'

import { Fragment, createContext, useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { BanknotesIcon, UsersIcon, TruckIcon, ChartBarIcon, UserCircleIcon, CreditCardIcon, ClipboardDocumentCheckIcon, CpuChipIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/auth-context'

// Define a shared key for localStorage
const STORAGE_KEY = 'qayed_app_uploaded_sources';

// Define the context type
type UploadedSourcesContextType = {
  uploadedSources: { [key: string]: boolean };
  setUploadedSources: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  isDataSourceUploaded: (sourceId: string) => boolean;
};

// Create the context
export const UploadedSourcesContext = createContext<UploadedSourcesContextType | undefined>(undefined);

// Custom hook for accessing the context
function useUploadedSources() {
  const context = useContext(UploadedSourcesContext);
  if (context === undefined) {
    throw new Error('useUploadedSources must be used within a UploadedSourcesProvider');
  }
  return context;
}

const navigationItems = [
  { name: 'Banks', href: '/dashboard/banks', icon: BanknotesIcon },
  { name: 'Customers', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: TruckIcon },
  { name: 'Cashflow', href: '/dashboard/cashflow', icon: ChartBarIcon },
  // { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCardIcon },
  { name: 'Matching Approvals', href: '/dashboard/matching-approvals', icon: CheckCircleIcon },
  { name: 'Annotation', href: '/dashboard/annotation/statements', icon: ClipboardDocumentCheckIcon },
]

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  
  // State for tracking uploaded data sources
  const [uploadedSources, setUploadedSources] = useState<{ [key: string]: boolean }>({});
  
  // Load data from localStorage on first render
  useEffect(() => {
    console.log('🔍 Loading data sources from localStorage...');
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('✅ Loaded data sources:', parsedData);
        setUploadedSources(parsedData);
      } catch (e) {
        console.error('❌ Failed to parse stored data:', e);
        // Initialize with empty state if parsing fails
        setUploadedSources({});
      }
    } else {
      console.log('ℹ️ No stored data sources found, initializing empty state');
      setUploadedSources({});
    }
  }, []);
  
  // Save to localStorage whenever uploadedSources changes
  useEffect(() => {
    console.log('💾 Saving data sources to localStorage:', uploadedSources);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedSources));
  }, [uploadedSources]);
  
  // Helper function to check if a data source is uploaded
  const isDataSourceUploaded = (sourceId: string) => {
    const isUploaded = !!uploadedSources[sourceId];
    console.log(`🔍 Checking data source '${sourceId}':`, isUploaded);
    return isUploaded;
  };
  
  const navigation = navigationItems.map(item => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(`${item.href}/`)
  }));

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push('/login');
    }
  };

  const userNavigation = [
    { name: 'Your Profile', href: '/dashboard/profile' },
    { name: 'Settings', href: '/dashboard/settings' },
    { name: 'Sign out', action: handleLogout },
  ];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#595CFF]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen due to middleware, but good fallback)
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <UploadedSourcesContext.Provider value={{ uploadedSources, setUploadedSources, isDataSourceUploaded }}>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-white shadow-sm">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="flex flex-shrink-0 items-center">
                      <Link href="/dashboard">
                        <span className="text-xl font-semibold text-gray-900">Qayed</span>
                      </Link>
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            item.current
                              ? 'border-[#595CFF] text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8 text-gray-500" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.company.name}</p>
                          </div>
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                item.action ? (
                                  <button
                                    onClick={item.action}
                                    className={clsx(
                                      active ? 'bg-gray-100' : '',
                                      'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </button>
                                ) : (
                                  <Link
                                    href={item.href}
                                    className={clsx(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={clsx(
                        item.current
                          ? 'border-[#595CFF] bg-gray-50 text-[#595CFF]'
                          : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {item.name}
                      </div>
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-8 w-8 text-gray-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      <div className="text-xs font-medium text-gray-400">{user.company.name}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      item.action ? (
                        <button
                          key={item.name}
                          onClick={item.action}
                          className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          {item.name}
                        </Disclosure.Button>
                      )
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </UploadedSourcesContext.Provider>
  )
} 