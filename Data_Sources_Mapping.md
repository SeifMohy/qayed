# Data Sources Mapping

This document outlines the relationship between data sources and the data points they generate throughout the Cashflow Management Dashboard application. This mapping helps users understand which file uploads are required to view specific information in the system.

## Data Source Overview

The application relies on four primary data sources:

1. **Bank Statements (Excel Format)**
   - Provides historical cashflow data for the previous period
   - Required for cash position visualization

2. **Bank Position (Excel Format)**
   - Provides scheduled banking obligations
   - Provides limit and interest information
   - Provides credit facility information including rates, limits and covenants
   - Required for obligation forecasting and credit facility management

3. **Accounts Receivable (ERP / Electronic Invoices)**
   - Provides scheduled incoming money for the period
   - Required for receivables forecasting

4. **Accounts Payable (ERP / Electronic Invoices)**
   - Provides scheduled procurement payments
   - Required for payables forecasting

## Data Source to UI Component Mapping

### Dashboard Page

| Component | Required Data Source(s) |
|-----------|-------------------------|
| Total Cash On Hand KPI | Bank Statements |
| Outstanding Payables KPI | Accounts Payable |
| Outstanding Receivables KPI | Accounts Receivable |
| Outstanding Bank Payments KPI | Bank Position |
| Cash Position & Forecast Chart | Bank Statements |
| Upcoming Supplier Payments | Accounts Payable |
| Customer Payments | Accounts Receivable |
| Banking Obligations | Bank Position |

### Banks Page

| Component | Required Data Source(s) |
|-----------|-------------------------|
| Total Cash on Hand KPI | Bank Statements |
| Total Credit Available KPI | Bank Position |
| Upcoming Bank Obligations KPI | Bank Position |
| Banks Table | Bank Statements |
| Credit Facilities Table | Bank Position |
| Recent Transactions Table | Bank Statements, Bank Position |

### Customers Page

| Component | Required Data Source(s) |
|-----------|-------------------------|
| Total Receivables KPI | Accounts Receivable |
| Average Payment Time KPI | Accounts Receivable |
| Overdue Receivables KPI | Accounts Receivable |
| Customers Table | Accounts Receivable |
| Payment Trends Chart | Accounts Receivable |

### Suppliers Page

| Component | Required Data Source(s) |
|-----------|-------------------------|
| Total Payables KPI | Accounts Payable |
| Payment Schedule KPI | Accounts Payable |
| Payment Efficiency KPI | Accounts Payable, Bank Statements |
| Suppliers Table | Accounts Payable |
| Upcoming Payments Chart | Accounts Payable |

## Implementation Details

### Data Source Management

The application uses a centralized approach to define and manage data sources:

1. **Data Source Definitions**
   - All data source definitions are stored in `src/utils/data-sources.ts`
   - Each data source has a unique ID, name, format, and description

2. **Page-Specific Data Sources**
   - Each page displays only the relevant data sources for upload:
     - Main Dashboard: All data sources
     - Banks Page: Bank Statements and Bank Position
     - Customers Page: Accounts Receivable
     - Suppliers Page: Accounts Payable

3. **Component-Source Relationships**
   - The application maintains a mapping of which components require which data sources
   - Components only become visible when their required data sources are uploaded

### Multi-File Upload Flow

1. User clicks on the "Upload Data Sources" button on any page
2. A modal appears with the relevant data sources for that page
3. User can select and upload multiple files for each data source using:
   - File selection dialog
   - Drag and drop functionality
4. Files are displayed with previews (for images) or appropriate icons
5. User can remove files before final submission
6. Upon submission, files are processed with a loading indicator
7. Relevant sections update automatically when uploads complete
8. Upload status is maintained across all pages

### Upload Status Persistence

1. Upload status is stored in browser localStorage
2. Status is managed through the `useUploadedSources` hook from the dashboard layout
3. All pages access the same upload status to maintain consistency

## User Journey

1. **Initial State**
   - User logs in to the dashboard
   - All components show placeholder states with upload prompts
   - No figures or data are initially visible
   - No description text shows actual figures before data is uploaded

2. **Data Upload**
   - User uploads required files through the upload modal
   - System processes each file with a loading animation
   - Upon successful processing, relevant sections become visible

3. **Complete Dashboard View**
   - Once all required files are uploaded, the full dashboard functionality is available
   - User can navigate between sections with all data visible
   - Refresh button becomes available to update data

4. **Contextual Data Requirements**
   - If a user navigates to a section without having uploaded the required data source
   - System shows a prompt explaining which data source needs to be uploaded
   - Upload button is provided directly in the component 