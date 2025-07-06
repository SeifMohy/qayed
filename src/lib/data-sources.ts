// Data source definitions
export type DataSource = {
  id: string
  name: string
  format: string
  description: string
}

// All available data sources
export const ALL_DATA_SOURCES: DataSource[] = [
  { 
    id: 'bankStatements', 
    name: 'Bank Statements', 
    format: 'Excel', 
    description: 'Cashflow for the previous period'
  },
  { 
    id: 'bankPosition', 
    name: 'Bank Position', 
    format: 'Excel', 
    description: 'Scheduled obligations, Limits / Interest, Credit Facilities'
  },
  { 
    id: 'invoices', 
    name: 'Invoices', 
    format: 'ERP / Electronic Invoices', 
    description: 'Customer and supplier invoices for accounts receivable and payable'
  },
  { 
    id: 'accountsReceivable', 
    name: 'Accounts Receivable', 
    format: 'ERP / Electronic Invoices', 
    description: 'Scheduled incoming money for the period'
  },
  { 
    id: 'accountsPayable', 
    name: 'Accounts Payable', 
    format: 'ERP / Electronic Invoices', 
    description: 'Scheduled procurement payments'
  },
  { 
    id: 'expenses', 
    name: 'General Expenses', 
    format: 'Excel / CSV', 
    description: 'Operating costs such as salaries, rent, utilities, etc.'
  }
]

// Data sources for each page
export const PAGE_DATA_SOURCES = {
  dashboard: ALL_DATA_SOURCES,
  banks: ALL_DATA_SOURCES.filter(source => 
    ['bankStatements'].includes(source.id)
  ),
  suppliers: ALL_DATA_SOURCES.filter(source => 
    ['accountsPayable'].includes(source.id)
  ),
  customers: ALL_DATA_SOURCES.filter(source => 
    ['accountsReceivable'].includes(source.id)
  ),
  expenses: ALL_DATA_SOURCES.filter(source => 
    ['expenses'].includes(source.id)
  )
}

// Get sources required for a specific component
export function getSourcesForComponent(componentId: string): string[] {
  switch (componentId) {
    // Dashboard components
    case 'cashOnHandKPI':
      return ['bankStatements']
    case 'outstandingPayablesKPI': 
      return ['accountsPayable']
    case 'outstandingReceivablesKPI':
      return ['accountsReceivable']
    case 'outstandingBankPaymentsKPI':
      return ['bankPosition']
    case 'cashPositionChart':
      return ['bankStatements']
    case 'supplierPayments':
      return ['accountsPayable']
    case 'customerPayments':
      return ['accountsReceivable']
    case 'bankingObligations':
      return ['bankPosition']
    
    // Bank page components
    case 'bankAccounts':
      return ['bankStatements']
    case 'creditFacilities':
      return ['bankPosition']
    case 'recentTransactions':
      return ['bankStatements', 'bankPosition']
      
    // Customer page components
    case 'customerList':
      return ['accountsReceivable']
      
    // Supplier page components
    case 'supplierList':
      return ['accountsPayable']
      
    // Expense page components
    case 'expenseSummary':
      return ['expenses']
    case 'expenseBreakdown':
      return ['expenses']
    case 'expenseCategories':
      return ['expenses']
      
    default:
      return []
  }
} 