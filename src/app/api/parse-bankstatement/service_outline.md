# Enhanced PDF Parsing Service

## Overview

This enhanced PDF parsing service addresses the issue of incomplete text extraction from large PDF documents by implementing a page-based chunking strategy. Instead of processing entire PDFs at once, the service splits documents into manageable chunks and processes them individually.

## Key Features

### 🔧 Page-Based Chunking
- **Chunk Size**: Processes 3 pages per chunk (configurable via `MAX_PAGES_PER_CHUNK`)
- **Intelligent Splitting**: Uses `pdf-lib` to split PDFs while preserving page integrity
- **Memory Efficient**: Prevents AI model overload and ensures complete text extraction

### ⚡ Rate Limiting & Performance
- **Processing Delay**: 1-second delay between chunks to avoid API rate limits
- **Parallel Processing**: Supports multiple file uploads simultaneously
- **Error Resilience**: Individual chunk failures don't affect other chunks

### 📊 Enhanced Monitoring
- **Detailed Logging**: Comprehensive logging for debugging and monitoring
- **Chunk Statistics**: Returns information about total chunks and successful processing
- **Progress Tracking**: Real-time logging of chunk processing progress

## API Configuration

```typescript
// Configurable parameters
const MAX_PAGES_PER_CHUNK = 3;     // Pages per chunk
const PROCESSING_DELAY = 1000;     // Delay between chunks (ms)
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
```

## Request Format

```http
POST /api/parse-bankstatement
Content-Type: multipart/form-data

files: [PDF files to process]
```

## Response Format

```json
{
  "success": true,
  "results": [
    {
      "fileName": "document.pdf",
      "success": true,
      "extractedText": "Combined text from all chunks...",
      "totalChunks": 5,
      "successfulChunks": 5
    }
  ]
}
```

## How It Works

1. **File Validation**: Ensures only PDF files are processed
2. **PDF Splitting**: Splits each PDF into chunks of 3 pages using `pdf-lib`
3. **Sequential Processing**: Processes each chunk individually with Google GenAI
4. **Text Combination**: Combines all chunk results with page break markers
5. **Result Compilation**: Returns comprehensive results with processing statistics

## Advantages Over Previous Version

### ✅ Complete Text Extraction
- **No Missing Content**: Chunking prevents AI model token limit issues
- **Comprehensive Coverage**: All pages are processed individually
- **Better Accuracy**: Smaller chunks allow for more focused processing

### ✅ Reliability
- **Error Isolation**: Failed chunks don't affect successful ones
- **Retry Capability**: Individual chunks can be retried if needed
- **Graceful Degradation**: Partial success still provides valuable results

### ✅ Scalability
- **Large Document Support**: Handles documents of any size
- **Memory Efficiency**: Lower memory footprint per processing unit
- **Rate Limit Compliance**: Built-in delays prevent API throttling

## Error Handling

- **Chunk-Level Errors**: Individual chunk failures are logged and reported
- **File-Level Errors**: Complete file processing failures are handled gracefully
- **API Errors**: Network and API issues are caught and reported with context

## Usage Example

```javascript
const formData = new FormData();
formData.append('files', pdfFile);

const response = await fetch('/api/parse-bankstatement', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Processed ${result.results[0].totalChunks} chunks`);
console.log(`Extracted text length: ${result.results[0].extractedText.length}`);
```

## Dependencies

- `@google/genai`: Google GenAI SDK for text extraction
- `pdf-lib`: PDF manipulation and splitting
- `next`: Next.js framework for API routes

## Environment Variables

```env
GEMINI_API_KEY=your_google_genai_api_key
```

## Performance Considerations

- **Processing Time**: Larger documents take longer due to sequential chunk processing
- **API Costs**: More API calls per document (one per chunk)
- **Memory Usage**: Lower peak memory usage compared to processing entire documents
- **Accuracy Trade-off**: Better text extraction completeness vs. slightly longer processing time

This enhanced approach ensures reliable and complete text extraction from PDF documents of any size while maintaining system stability and API compliance. 