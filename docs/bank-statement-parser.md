# Bank Statement Parser

This feature allows users to upload bank statements (PDF format), extract their text content using the Google Gemini API, and then structure the data into a usable JSON format.

## Features

- Upload single or multiple bank statement PDFs
- Extract full text content using Google's Gemini API
- Structure the extracted text into account details and transactions
- Store both raw and structured data in session storage
- View and manage parsed statements
- Tabular view of structured transaction data
- Copy extracted text to clipboard

## How It Works

1. Users upload one or more PDF bank statements
2. Files are sent to the `/api/parse-bankstatement` endpoint
3. The API endpoint processes each PDF using the Gemini API to extract text
4. Extracted text is returned to the client and stored in session storage
5. Users can view the extracted raw text in the viewer component
6. Users can trigger the structured data extraction by clicking "Structure Data"
7. The structured data extraction sends the raw text to the `/api/structure-bankstatement` endpoint
8. Gemini API processes the text to identify account details and transactions
9. The structured data is returned in a standardized JSON format and stored in session storage

## Data Structure

The structured data follows this format:
```json
{
  "account_statement": {
    "bank_name": "Bank Name",
    "account_number": "Account Number",
    "statement_period": {
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    },
    "starting_balance": "Amount",
    "ending_balance": "Amount",
    "transactions": [
      {
        "date": "YYYY-MM-DD",
        "credit_amount": "Amount",
        "debit_amount": "Amount",
        "description": "Transaction Description"
      }
    ]
  }
}
```

## Implementation Details

### API Endpoints

1. **Text Extraction Endpoint**
   - Location: `/api/parse-bankstatement/route.ts`
   - Method: POST
   - Input: PDF files sent as `multipart/form-data`
   - Processing: Uses Google Gemini API to extract text from PDFs
   - Output: JSON response with extracted text for each file

2. **Data Structuring Endpoint**
   - Location: `/api/structure-bankstatement/route.ts`
   - Method: POST
   - Input: Raw text extracted from bank statements
   - Processing: Uses Google Gemini API to analyze and structure the text
   - Output: JSON response with structured account information and transactions

### Frontend Components

1. **Bank Statement Uploader (`/components/upload/BankStatementUploader.tsx`)**
   - Drag and drop interface for file upload
   - File validation (PDF only)
   - Upload progress indication
   - Sends files to API endpoint
   - Stores results in session storage

2. **Bank Statement Viewer (`/components/dashboard/BankStatementViewer.tsx`)**
   - Lists all parsed statements
   - Allows selecting and viewing extracted text
   - Provides option to structure the extracted text
   - Displays structured data in a user-friendly format
   - Tabular view of transactions
   - Provides copy to clipboard functionality
   - Allows clearing stored statements

### Data Storage

- Raw extracted text is stored in session storage
  - Naming convention: `bankstatement_[filename]` for each file's content
- Structured data is stored in session storage
  - Naming convention: `bankstatement_structured_[filename]` for each file's structured data
- List of filenames stored as JSON in `bankstatement_files`

## Setup Requirements

1. Install required dependencies:
   ```bash
   npm install @google/generative-ai
   ```

2. Set up environment variables:
   - Add `GEMINI_API_KEY=your_key_here` to your `.env.local` file

## Usage

1. Navigate to the Bank Statements page at `/dashboard/banks/statements`
2. Upload bank statement PDFs using the uploader component
3. View extracted raw text in the viewer component
4. Click "Structure Data" to process the text into structured format
5. View account details and transactions in the structured view
6. Switch between raw text and structured view using the tabs
7. Copy content to clipboard as needed

## Technical Notes

- The API uses the Gemini 2.5 Flash model for optimal text extraction and data structuring
- PDF files are converted to Base64 for transmission to the Gemini API
- Files are processed in sequence to avoid rate limiting
- Maximum output token limit is set to 32768 for text extraction and 8192 for data structuring
- The prompt for data structuring is designed to handle various bank statement formats 