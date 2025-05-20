# Bank Statement Parser

This feature allows users to upload bank statements (PDF format) and extract their text content using the Google Gemini API.

## Features

- Upload single or multiple bank statement PDFs
- Extract full text content using Google's Gemini API
- Store extracted content in session storage
- View and manage parsed statements
- Copy extracted text to clipboard

## How It Works

1. Users upload one or more PDF bank statements
2. Files are sent to the `/api/parse-bankstatement` endpoint
3. The API endpoint processes each PDF using the Gemini API to extract text
4. Extracted text is returned to the client and stored in session storage
5. Users can view the parsed statements in the viewer component

## Implementation Details

### API Endpoint

- Location: `/api/parse-bankstatement/route.ts`
- Method: POST
- Input: PDF files sent as `multipart/form-data`
- Processing: Uses Google Gemini API to extract text from PDFs
- Output: JSON response with extracted text for each file

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
   - Provides copy to clipboard functionality
   - Allows clearing stored statements

### Data Storage

- All extracted text is stored in session storage
- Naming convention: `bankstatement_[filename]` for each file's content
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
3. View extracted text in the viewer component
4. Copy content to clipboard as needed

## Technical Notes

- The API uses the Gemini 1.5 Pro model for optimal text extraction
- PDF files are converted to Base64 for transmission to the Gemini API
- Files are processed in sequence to avoid rate limiting
- Maximum output token limit is set to 16384 to accommodate large statements 