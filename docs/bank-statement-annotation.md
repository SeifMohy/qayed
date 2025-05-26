Detailed Implementation Plan: Bank Statement Annotation System
Based on my analysis of the current codebase, here's a comprehensive implementation plan to add the annotation step for bank statements:
🏗️ PHASE 1: Database Schema Extensions
1.1 Update Prisma Schema
The current BankStatement model needs these additions:
Apply
1.2 Migration Strategy
Add new fields with default values to avoid breaking existing data
Update the Prisma client generation
🗂️ PHASE 2: File Storage Integration
2.1 Supabase Storage Setup
Create a storage bucket for bank statement files
Implement file upload to Supabase Storage during the upload process
Store the public URL in the fileUrl field
2.2 Update Upload Flow
Modify BankStatementUploader.tsx to:
Upload files to Supabase Storage first
Store file URLs in the database
Set parsed = false initially
After successful parsing, set parsed = true
Redirect to annotation page instead of just refreshing
📱 PHASE 3: Annotation UI Components
3.1 Create New Route Structure
3.2 Annotation Overview Page (/dashboard/annotation/statements)
Components needed:
AnnotationStatementsTable.tsx - Table showing all statements with validation status
Columns: Bank Name, Account Number, Date Range, Validation Status, Actions
Filter by validation status
Search functionality
3.3 Annotation Detail Page (/dashboard/annotation/statements/[id])
Components needed:
3.3.1 StatementMetadataForm.tsx
Editable form for bank statement metadata
Fields: Bank Name, Account Number, Statement Period, Balances, Currency, Account Type
Real-time validation
Save functionality
3.3.2 ValidationCheck.tsx
Automatic balance validation component
Calculate: Starting Balance + Credits - Debits = Expected Ending Balance
Show validation result with clear pass/fail indicators
Display discrepancy amount if validation fails
3.3.3 DocumentViewer.tsx
PDF viewer using iframe or PDF.js
Side-by-side layout with annotation form
Responsive design for mobile
3.3.4 TransactionManager.tsx
Table showing all transactions
Download as Excel functionality
Upload Excel to replace transactions
Individual transaction editing capability
🔄 PHASE 4: API Routes & Backend Logic
4.1 New API Routes
4.2 File Storage API
4.3 Excel Export/Import Logic
Use libraries like xlsx for Excel operations
Export: Convert transaction data to Excel format
Import: Parse Excel and update transaction records
🔐 PHASE 5: Updated Upload Flow
5.1 Modified Upload Process
File Upload: Upload to Supabase Storage, get URL
Text Extraction: Parse PDF content (existing functionality)
Data Structuring: Structure data into database (existing functionality)
Set Status: Mark as parsed = true, validated = false
Redirect: Navigate to annotation page instead of refreshing
5.2 Upload Flow Integration
Update BankStatementUploader.tsx:
Add file storage step before parsing
Update success handler to redirect to annotation
Show progress indicators for each step
🎨 PHASE 6: UI/UX Enhancements
6.1 Navigation Updates
Add "Annotation" as a new page
Update breadcrumbs to include annotation flow
Add status badges throughout the interface
6.2 Status Indicators
Color-coded status badges (pending/passed/failed)
Progress indicators showing completion percentage
Clear visual feedback for validation results
🔒 PHASE 7: Permissions & Security
7.2 Data Validation
Server-side validation for all form inputs
Sanitization of uploaded Excel files
File type and size restrictions
📊 PHASE 8: Implementation Order
Week 1: Foundation
✅ Update Prisma schema and run migrations
✅ Set up Supabase Storage integration
✅ Create basic API routes for annotation
Week 2: Core Components
✅ Build annotation overview page
✅ Create statement metadata form
✅ Implement validation check logic
Week 3: Advanced Features
✅ Add PDF viewer component
✅ Build transaction manager with Excel export/import
✅ Update upload flow integration
Week 4: Polish & Testing
✅ Add permissions and security
✅ Implement responsive design
✅ Testing and bug fixes
🧪 Technical Considerations
Dependencies to Add
Apply
}
Environment Variables
Apply
operations
File Structure Changes
Apply
utilities
This implementation plan provides a comprehensive roadmap for adding the annotation system while maintaining the existing functionality and following the established architectural patterns in the codebase.
Would you like me to start implementing any specific phase of this plan?
