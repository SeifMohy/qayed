/**
 * File Encoding Utilities
 * 
 * Properly handles character encoding detection and decoding for files,
 * particularly for Arabic text that may be encoded in windows-1256 or other encodings.
 * 
 * Based on RFC 7159 JSON standard recommendations for UTF-8 encoding.
 * 
 * Note: Text normalization is now handled by LLM services in nameNormalizationService.ts
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
 * Convenience function for JSON files specifically
 * Note: Text normalization is now handled by LLM services
 */
export async function readJSONFileWithEncoding(input: any): Promise<any> {
    const content = await readFileWithEncoding(input);
    
    try {
        const jsonData = JSON.parse(content);
        
        // Return JSON data without normalization - normalization is now handled by LLM services
        console.log('📄 JSON file read successfully. Use LLM services for name normalization.');
        return jsonData;
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Check if file reading with encoding detection is available
 */
export function isEncodingDetectionAvailable(): boolean {
    return typeof window === 'undefined'; // Only available server-side
} 