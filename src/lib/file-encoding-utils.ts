/**
 * File Encoding Utilities
 * 
 * Properly handles character encoding detection and decoding for files,
 * particularly for Arabic text that may be encoded in windows-1256 or other encodings.
 * 
 * Based on RFC 7159 JSON standard recommendations for UTF-8 encoding.
 */

// Only import for server-side operations
let chardet: any = null;
let iconv: any = null;

// Dynamically import encoding libraries only when needed (server-side)
async function loadEncodingLibs() {
    if (typeof window !== 'undefined') {
        // Browser environment - can't use these libraries
        return { chardet: null, iconv: null };
    }

    if (!chardet || !iconv) {
        try {
            chardet = (await import('chardet')).default;
            const iconvModule = await import('iconv-lite');
            // Handle different iconv-lite import structures
            iconv = iconvModule.default || iconvModule;

            console.log('✅ Successfully loaded encoding detection libraries');
        } catch (error) {
            console.warn('Failed to load encoding libraries:', error);
            return { chardet: null, iconv: null };
        }
    }

    return { chardet, iconv };
}

/**
 * Reads a file with proper character encoding detection and decoding
 * Works both in browser (File API) and server (Buffer)
 */
export async function readFileWithEncoding(input: any, fallbackEncoding = 'utf-8'): Promise<string> {

    // Handle Buffer (server) - most common case for our server-side processing
    if (Buffer.isBuffer(input)) {
        return await readServerBuffer(input, fallbackEncoding);
    }

    // Handle string (already decoded)
    if (typeof input === 'string') {
        return input;
    }

    // Handle File-like object (browser or server)
    if (input && typeof input === 'object' && typeof input.arrayBuffer === 'function') {
        // This works for both browser File objects and server-side file entries
        const arrayBuffer = await input.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return await readServerBuffer(buffer, fallbackEncoding);
    }

    throw new Error('Unsupported file type for encoding detection');
}

/**
 * Browser-side file reading with encoding detection
 * Note: This is kept for backward compatibility but server-side processing is preferred
 */
async function readBrowserFile(file: any, fallbackEncoding: string): Promise<string> {
    // First, try to read as ArrayBuffer to detect encoding
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // For browser, we'll use heuristics to detect Arabic content
    const sampleText = new TextDecoder('utf-8', { fatal: false }).decode(buffer.slice(0, 1000));

    // Check if we have typical encoding issues with Arabic text
    const hasEncodingIssues = containsArabicEncodingIssues(sampleText);

    if (hasEncodingIssues) {
        // Try to decode with windows-1256 (common for Arabic files)
        try {
            // In browser, we can't use iconv-lite directly, so we'll use a fallback
            console.log('⚠️ Detected potential Arabic encoding issues. File may need server-side processing.');

            // For now, return the UTF-8 decoded text and let normalization handle it
            return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
        } catch (error) {
            console.warn('Failed to decode with alternative encoding:', error);
        }
    }

    // Default UTF-8 decoding
    return new TextDecoder(fallbackEncoding).decode(buffer);
}

/**
 * Server-side buffer reading with full encoding detection
 */
async function readServerBuffer(buffer: Buffer, fallbackEncoding: string): Promise<string> {
    const { chardet: chardetLib, iconv: iconvLib } = await loadEncodingLibs();

    if (!chardetLib || !iconvLib) {
        // Fallback to simple UTF-8 decoding
        return buffer.toString(fallbackEncoding as BufferEncoding);
    }

    // Detect the encoding
    const detectedEncoding = chardetLib.detect(buffer);
    console.log(`🔍 Detected encoding: ${detectedEncoding || 'unknown'}`);

    // List of encodings to try for Arabic content
    const encodingsToTry = [
        detectedEncoding,
        'utf-8',
        'windows-1256', // Common Arabic encoding
        'iso-8859-6', // Arabic ISO encoding
        fallbackEncoding
    ].filter(Boolean).filter((enc, index, arr) => arr.indexOf(enc) === index); // Remove duplicates

    for (const encoding of encodingsToTry) {
        try {
            const decoded = iconvLib.decode(buffer, encoding);

            // Validate that the decoding worked by checking for common Arabic text patterns
            if (isValidArabicDecoding(decoded)) {
                console.log(`✅ Successfully decoded with encoding: ${encoding}`);
                return decoded;
            }
        } catch (error) {
            console.warn(`Failed to decode with ${encoding}:`, error);
            continue;
        }
    }

    // Last resort: UTF-8 with replacement characters
    console.warn('⚠️ All encoding attempts failed, using UTF-8 with replacement characters');
    return buffer.toString('utf-8');
}

/**
 * Detects if text contains Arabic encoding issues (heuristic)
 */
function containsArabicEncodingIssues(text: string): boolean {
    // Look for patterns that suggest encoding issues
    const patterns = [
        /[À-ÿ]{2,}/, // Multiple consecutive non-ASCII Latin characters (often misencoded Arabic)
        /\uFFFD/, // Replacement character
        /شرك[هة]كان/, // Known problematic pattern from the user's data
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Validates if Arabic text was properly decoded
 */
function isValidArabicDecoding(text: string): boolean {
    // Check for proper Arabic characters and common words
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasProperSpacing = !(/شرك[هة][^\s]كان/.test(text)); // Should not have malformed spacing
    const noReplacementChars = !/\uFFFD/.test(text);

    return !hasArabic || (hasProperSpacing && noReplacementChars);
}

/**
 * Normalizes Arabic and English text by adding proper spacing between words
 */
function normalizeTextSpacing(text: string): string {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    let normalized = text;
    
    // Arabic text normalization
    if (/[\u0600-\u06FF]/.test(text)) {
        // Common Arabic word patterns that should be separated
        const arabicPatterns = [
            // Company/organization patterns
            { pattern: /الشركة([^\s])/g, replacement: 'الشركة $1' },
            { pattern: /المصرية([^\s])/g, replacement: 'المصرية $1' },
            { pattern: /لتكنولوجيا([^\s])/g, replacement: 'لتكنولوجيا $1' },
            { pattern: /التجارة([^\s])/g, replacement: 'التجارة $1' },
            { pattern: /الجمعية([^\s])/g, replacement: 'الجمعية $1' },
            { pattern: /التعاونية([^\s])/g, replacement: 'التعاونية $1' },
            { pattern: /للبترول([^\s])/g, replacement: 'للبترول $1' },
            
            // Name patterns
            { pattern: /عبد([^\s])/g, replacement: 'عبد $1' },
            { pattern: /الحميد([^\s])/g, replacement: 'الحميد $1' },
            { pattern: /المعطى([^\s])/g, replacement: 'المعطى $1' },
            { pattern: /حسن([^\s])/g, replacement: 'حسن $1' },
            { pattern: /محاسبة([^\s])/g, replacement: 'محاسبة $1' },
            { pattern: /واستشارات([^\s])/g, replacement: 'واستشارات $1' },
            { pattern: /ضريبية([^\s])/g, replacement: 'ضريبية $1' },
            
            // Handle specific cases
            { pattern: /ايجى([^\s])/g, replacement: 'إيجي $1' }, // Fix إيجي and add space
            { pattern: /\/([^\s])/g, replacement: '/ $1' }, // Add space after /
            { pattern: /([^\s])\//g, replacement: '$1 /' }, // Add space before /
            
            // Common prefixes and suffixes
            { pattern: /([^\s])الـ/g, replacement: '$1 الـ' },
            { pattern: /([^\s])وال/g, replacement: '$1 وال' },
            { pattern: /([^\s])لل/g, replacement: '$1 لل' },
            { pattern: /([^\s])من/g, replacement: '$1 من' },
            { pattern: /([^\s])في/g, replacement: '$1 في' },
            { pattern: /([^\s])على/g, replacement: '$1 على' }
        ];
        
        arabicPatterns.forEach(({ pattern, replacement }) => {
            normalized = normalized.replace(pattern, replacement);
        });
        
        // Fix multiple consecutive spaces and trim trailing single letters
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        // Remove trailing single Arabic letters that are likely artifacts
        normalized = normalized.replace(/\s[ا-ي]\s*$/g, '').trim();
    }
    
    // English text normalization
    if (/[A-Za-z]/.test(text)) {
        // Common English company name patterns
        const englishPatterns = [
            // Company names
            { pattern: /Vodafone([A-Z])/g, replacement: 'Vodafone $1' },
            { pattern: /Egypt([A-Z])/g, replacement: 'Egypt $1' },
            { pattern: /Telecommunications([A-Z])/g, replacement: 'Telecommunications $1' },
            { pattern: /([a-z])([A-Z])/g, replacement: '$1 $2' }, // General camelCase separation
            
            // Fix doubled spacing
            { pattern: /\s+/g, replacement: ' ' }
        ];
        
        englishPatterns.forEach(({ pattern, replacement }) => {
            normalized = normalized.replace(pattern, replacement);
        });
    }
    
    return normalized.trim();
}

/**
 * Convenience function for JSON files specifically
 */
export async function readJSONFileWithEncoding(input: any): Promise<any> {
    const content = await readFileWithEncoding(input);
    
    try {
        const jsonData = JSON.parse(content);
        
        // Apply text normalization to common name fields
        return normalizeJSONTextFields(jsonData);
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Recursively normalizes text fields in JSON data
 */
function normalizeJSONTextFields(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'string') {
        return normalizeTextSpacing(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => normalizeJSONTextFields(item));
    }
    
    if (typeof obj === 'object') {
        const normalized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Apply normalization to common name fields
            if (typeof value === 'string' && (
                key.toLowerCase().includes('name') ||
                key.toLowerCase().includes('issuer') ||
                key.toLowerCase().includes('receiver') ||
                key.toLowerCase().includes('entity') ||
                key.toLowerCase().includes('company') ||
                key.toLowerCase().includes('supplier') ||
                key.toLowerCase().includes('customer')
            )) {
                normalized[key] = normalizeTextSpacing(value);
            } else {
                normalized[key] = normalizeJSONTextFields(value);
            }
        }
        return normalized;
    }
    
    return obj;
}

/**
 * Check if file reading with encoding detection is available
 */
export function isEncodingDetectionAvailable(): boolean {
    return typeof window === 'undefined'; // Only available server-side
} 