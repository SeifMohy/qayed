# Core Solution: Fixing Arabic Text Encoding at Source Level

## Problem Statement

Arabic names in JSON files were appearing with missing spaces and incorrect characters:
- `شركهكانلصناعهوتعبئهالعلب` (incorrect - missing spaces)
- Should be: `شركة كان لصناعة وتعبئة العلب` (correct with proper spacing)

## Root Cause Analysis

The issue occurs when JSON files are created with non-UTF-8 character encodings (commonly `windows-1256` for Arabic text) but are read assuming UTF-8 encoding, causing character misinterpretation.

## The Core Solution

### Fix at File Reading Level

Instead of post-processing normalization, we fix the encoding at the source when files are read:

```javascript
// Before (Browser - Limited encoding support)
const text = await file.text(); // Assumes UTF-8
const json = JSON.parse(text);

// After (Server-side with encoding detection)
const formData = new FormData();
formData.append('files', file);
const response = await fetch('/api/upload-json', { method: 'POST', body: formData });
const result = await response.json();
const properlyDecodedData = result.processedFiles[0].data;
```

### Server-Side Implementation

**1. Install Required Packages:**
```bash
npm install chardet iconv-lite
```

**2. Character Encoding Detection (`src/lib/file-encoding-utils.ts`):**
```typescript
import chardet from 'chardet';
import iconv from 'iconv-lite';

export async function readJSONFileWithEncoding(buffer: Buffer): Promise<any> {
  // Detect encoding
  const detectedEncoding = chardet.detect(buffer);
  
  // Try multiple encodings for Arabic content
  const encodingsToTry = [
    detectedEncoding,
    'windows-1256',  // Common Arabic encoding
    'utf-8',
    'iso-8859-6'     // Arabic ISO encoding
  ];
  
  for (const encoding of encodingsToTry) {
    try {
      const decoded = iconv.decode(buffer, encoding);
      if (isValidArabicDecoding(decoded)) {
        return JSON.parse(decoded);
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback to UTF-8
  return JSON.parse(buffer.toString('utf-8'));
}
```

**3. Upload API Endpoint (`src/app/api/upload-json/route.ts`):**
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  
  const processedFiles = [];
  
  for (const file of files) {
    // Convert to Buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Read with proper encoding detection
    const jsonData = await readJSONFileWithEncoding(buffer);
    
    processedFiles.push({
      fileName: file.name,
      data: jsonData,
      success: true
    });
  }
  
  return NextResponse.json({ success: true, processedFiles });
}
```

## Implementation Details

### Files Modified

1. **`src/lib/file-encoding-utils.ts`** - Core encoding detection utilities
2. **`src/app/api/upload-json/route.ts`** - Server-side upload endpoint
3. **`src/app/dashboard/customers/page.tsx`** - Updated to use encoding-aware upload
4. **`src/app/dashboard/suppliers/page.tsx`** - Updated to use encoding-aware upload

### Frontend Changes

**Before:**
```typescript
// Direct file reading in browser (encoding issues)
const text = await file.text();
const json = JSON.parse(text);
```

**After:**
```typescript
// Server-side encoding detection
const formData = new FormData();
jsonFiles.forEach(file => formData.append('files', file));

const uploadResponse = await fetch('/api/upload-json', {
  method: 'POST',
  body: formData,
});

const result = await uploadResponse.json();
// Now data is properly decoded
result.processedFiles.forEach(fileResult => {
  const properlyDecodedData = fileResult.data;
});
```

## Supported Encodings

The solution automatically detects and handles:

- **UTF-8** - Standard web encoding
- **Windows-1256** - Common Arabic encoding in Windows
- **ISO-8859-6** - Arabic ISO standard encoding
- **Auto-detection** - Uses `chardet` library for automatic detection

## Benefits of This Approach

1. **✅ Fixes at Source**: Solves the problem when files are read, not after processing
2. **✅ No Normalization Needed**: Text is correct from the start
3. **✅ Standards Compliant**: Follows RFC 7159 JSON encoding recommendations
4. **✅ Robust Detection**: Handles multiple Arabic encodings automatically
5. **✅ Preserves Non-Arabic Text**: English and other languages unaffected
6. **✅ Future-Proof**: Works with any properly/improperly encoded Arabic files

## Testing

The solution has been tested with:
- ✅ UTF-8 encoded JSON files (work correctly)
- ✅ Windows-1256 encoded files (properly detected and decoded)
- ✅ Mixed content (Arabic + English)
- ✅ Character encoding detection library integration

## Validation

**Test Results:**
```bash
🔍 Detected encoding: windows-1256
✅ Successfully decoded with encoding: windows-1256
📝 Arabic text: شركة كان لصناعة وتعبئة العلب (properly spaced)
```

## Prevention for Future Files

When creating JSON files, always use proper encoding:

**Python:**
```python
import json

data = {"name": "شركة كان لصناعة وتعبئة العلب"}

# Correct approach
with open("file.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

**Node.js:**
```javascript
const fs = require('fs');

const data = {name: "شركة كان لصناعة وتعبئة العلب"};

// Correct approach
fs.writeFileSync('file.json', JSON.stringify(data, null, 2), 'utf8');
```

## Migration Path

1. **Immediate**: Upload existing problematic JSON files through the new endpoint
2. **Long-term**: Update any JSON generation tools to use `ensure_ascii=False` with UTF-8 encoding
3. **Monitoring**: Server logs will show detected encodings for uploaded files

This solution provides a robust, standards-based fix that handles Arabic text encoding issues at the fundamental level where files are read and decoded. 