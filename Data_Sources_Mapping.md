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

## Data Source Upload Process

1. User clicks on the "Upload Data Sources" button on any page
2. A modal appears with all available data sources for upload
3. User selects and uploads a file for each required data source
4. The system processes the file (validation, extraction, etc.) with a loading indicator
5. Upon successful upload, relevant sections of the application update to show the data
6. The upload status is maintained across all pages using browser storage

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