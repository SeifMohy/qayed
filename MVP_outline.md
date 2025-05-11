# MVP Outline: Cashflow Management Dashboard

## 🎯 Purpose
The MVP aims to help medium-sized enterprises clearly visualize their cash positions, forecast upcoming obligations, and optimize financial operations through actionable insights.

## 📌 Landing Page
**Objective**: Clearly articulate the product's value proposition and allow users to sign up or sign in.

**Components**:
- **Hero Section**
  - Concise product tagline
  - Short description highlighting value to users
- **Problem Statement**
  - Challenges faced by target users
- **Solution Overview**
  - Explanation of how the product solves the problem
- **Features Summary**
  - Key features briefly described
- **Call to Action (CTA)**
  - Sign-Up button
  - Sign-In button/link
- **Footer**
  - Basic contact info, social media, privacy policy link

## 🔐 Authentication (Sign-Up / Sign-In)
**Components**:
- **Sign-Up form**:
  - Email address, Password, Confirm Password
  - Email verification
- **Sign-In form**:
  - Email, Password, "Forgot Password?" link
- **Backend**:
  - User authentication, password encryption, session management

## 📲 App Structure & Navbar
After login, users have access to a navbar with links:
- Dashboard
- Banks
- Customers
- Suppliers
- User Profile (Account settings, logout)

## 📊 Page 1: Dashboard
**Objective**: Showcase a snapshot of key financial metrics and immediate obligations.

**Components**:
- **Summary KPIs (at the top)**:
  - Total Cash On Hand (across all banks/currencies)
  - Total Outstanding Payables (30 days)
  - Total Outstanding Receivables (30 days)
  - Outstanding Bank Payments
- **Interactive Chart**:
  - Visualize historical cash position and forecasted cashflow over time in different colors (rolling 90 days)
- **Summary Cards (below the chart)**:
  - Upcoming supplier payments (total value, due dates)
  - Upcoming customer payments (total value, due dates)
  - Upcoming banking obligations (total value, due dates)

## 🏦 Page 2: Banks
**Objective**: Show users a comprehensive view of their banking positions and obligations.

**Components**:
- **Main Banks Page**:
  - **Key figures and summaries (top)**:
    - Total Cash
    - Upcoming Bank Obligations
    - Total Facilities
    - Facility Utilization Rate
  - **Banks Table**:
    - Bank Name | Cash Balance | Bank Payments | Last Updated

- **Bank Profile Page**:
  - Bank Name as Title
  - **Accounts Table**:
    - Account Number | Currency | Account Balance | Interest Rate
  - **Limits Table**:
    - Limit Account Number | Total Limit | Utilized Portion | Interest Rate
  - **Important Transactions Table**:
    - Amount | Linked Limit Number | Interest | Disbursement Date | Payment Date

## 👥 Page 3: Customers
**Objective**: Provide visibility into customers' payment habits, outstanding balances, and delivered sales.

**Components**:
- **Customers Overview Page**:
  - **Key figures and summaries (top)**:
    - Total Delivered Sales
    - Upcoming Incoming Payments
    - Ratio of Sales to Delivered
  - **Customers Table**:
    - Customer Name | Sales Past Year | Delivered Sales | Non-Delivered Sales Orders | Amount Paid of Delivered Sales | Pending Payments | % Paid of Sales | Number of Orders

- **Customer Profile Page**:
  - Customer Name as Title
  - **Summary Figures**:
    - Total Sales
    - Delivered Sales
    - Current Held Cash
    - Payment Rate (e.g., days to pay)
  - **Order History Table**:
    - Order Date | Delivery % | Paid % | Payment Remaining

## 🚚 Page 4: Suppliers
**Objective**: Allow users to effectively manage their supplier relationships and track procurement obligations.

**Components**:
- **Suppliers Overview Page**:
  - **Key figures and summaries (top)**:
    - Total Received Orders
    - Upcoming Payments
    - Ratio of Purchases to Orders
  - **Suppliers Table**:
    - Supplier Name | Purchases Past Year | Received Orders | Orders in Transit | Outstanding Payments | % Paid Orders | Number of Orders

- **Supplier Profile Page**:
  - Supplier Name as Title
  - **Summary Figures**:
    - Total Purchases
    - Received Orders
    - Current Required Payments
    - Payment Rate (days overdue or early)
  - **Order History Table**:
    - Order Date | Delivery % | Paid % | Payment Remaining

## 📥 Data Upload & Management
Allow data import through Excel uploads or ERP API integration.

Real-time data refresh option per relevant page:
- Bank statements on Banks page
- AR data on Customers page
- AP data on Suppliers page

## 🛠️ Additional Requirements:
**UI/UX Considerations**:
- Simple, intuitive interface with clear calls to action
- Responsive design for web and mobile browsers
- Consistent branding throughout

**Backend & Data Processing**:
- Secure user authentication and data management
- Robust error handling and data validation
- Audit trails for user actions (e.g., data uploads, modifications) 