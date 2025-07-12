import { GoogleGenAI } from "@google/genai";
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
// --- Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_KEY = process.env.GEMINI_API_KEY;
// Configuration for chunking and retries
const MAX_PAGES_PER_CHUNK = parseInt(process.env.MAX_PAGES_PER_CHUNK || '5');
const PROCESSING_DELAY = parseInt(process.env.PROCESSING_DELAY || '1000');
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3');
const RETRY_BASE_DELAY = 2000; // Base delay for retries (2 seconds)
if (!API_KEY) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
}
// --- System Prompt for Document Parsing ---
const PARSING_SYSTEM_PROMPT = `
You are an AI assistant specialized in extracting text content from PDF document chunks.
Your task is to extract the full text content from the provided PDF chunk.

Please return all the text content you can extract from this document chunk.
Focus on maintaining the document's structure and formatting where possible.
Include all numbers, dates, amounts, and other details accurately.

Important notes:
- This may be part of a larger document
- Extract ALL visible text content
- Preserve table structures and formatting when possible
- Include headers, footers, and any metadata visible in the chunk
- The chunk will be labeled with its corresponding PDF page numbers for reference

*CRITICAL: Only return the extracted text content as your final output. Do NOT include ANY introductory text, concluding remarks, explanations, or page number references in your response. The page markers will be added automatically.*
`.trim();
// --- Helper Functions ---
// Helper Function to split PDF into chunks
async function splitPdfIntoChunks(pdfBuffer, maxPagesPerChunk = MAX_PAGES_PER_CHUNK) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        console.log(`PDF has ${totalPages} pages, splitting into chunks of ${maxPagesPerChunk} pages`);
        const chunks = [];
        for (let i = 0; i < totalPages; i += maxPagesPerChunk) {
            const endPage = Math.min(i + maxPagesPerChunk, totalPages);
            const chunkDoc = await PDFDocument.create();
            // Copy pages to the chunk document
            const pageIndices = Array.from({ length: endPage - i }, (_, idx) => i + idx);
            const copiedPages = await chunkDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => {
                chunkDoc.addPage(page);
            });
            const chunkBuffer = await chunkDoc.save();
            chunks.push({
                chunk: chunkBuffer,
                pageRange: {
                    start: i + 1, // 1-based indexing
                    end: endPage
                }
            });
            console.log(`Created chunk ${Math.floor(i / maxPagesPerChunk) + 1}: pages ${i + 1}-${endPage}`);
        }
        return chunks;
    }
    catch (error) {
        console.error('Error splitting PDF:', error);
        throw new Error('Failed to split PDF into chunks');
    }
}
// Helper Function to add delay between requests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Helper Function to determine if error is retryable
function isRetryableError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    // Check for retryable error patterns
    const retryablePatterns = [
        'internal error',
        'server error',
        'rate limit',
        'timeout',
        'service unavailable',
        'temporary failure',
        'quota exceeded',
        'api error',
        'network error',
        'connection error',
        '500',
        '502',
        '503',
        '504'
    ];
    return retryablePatterns.some(pattern => errorMessage.includes(pattern));
}
// Helper Function to process a single chunk with retry logic using streaming
async function processChunkWithRetry(ai, chunkData, chunkIndex, totalChunks, fileName, pageRange, maxRetries = MAX_RETRIES) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Add delay for retry attempts (exponential backoff)
            if (attempt > 0) {
                const retryDelay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
                console.log(`Retrying chunk ${chunkIndex + 1}/${totalChunks} (pages ${pageRange.start}-${pageRange.end}) for ${fileName}, attempt ${attempt + 1}/${maxRetries + 1} after ${retryDelay}ms delay`);
                await delay(retryDelay);
            }
            else {
                console.log(`Processing chunk ${chunkIndex + 1}/${totalChunks} (pages ${pageRange.start}-${pageRange.end}) for ${fileName}`);
            }
            // Convert chunk to base64 - chunkData is Uint8Array
            const base64Data = Buffer.from(chunkData).toString("base64");
            const prompt = `Extract the text content from this PDF chunk (chunk ${chunkIndex + 1} of ${totalChunks}, containing pages ${pageRange.start}-${pageRange.end}).`;
            // Create a content object for the API request
            const fileContent = {
                parts: [
                    { text: PARSING_SYSTEM_PROMPT },
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: base64Data
                        }
                    }
                ]
            };
            // Make the API call with streaming using the new SDK format
            const streamingResponse = await ai.models.generateContentStream({
                model: MODEL_NAME,
                contents: fileContent,
                config: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 32768,
                }
            });
            // Process the streaming response
            let accumulatedText = '';
            for await (const chunk of streamingResponse) {
                const chunkText = chunk.text || '';
                accumulatedText += chunkText;
                // Log progress for monitoring
                if (chunkText.trim()) {
                    console.log(`Chunk ${chunkIndex + 1} streaming: received ${chunkText.length} characters, total: ${accumulatedText.length}`);
                }
            }
            // Check if we got any text
            if (!accumulatedText || accumulatedText.trim() === '') {
                console.warn(`GenAI returned empty text content for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) of ${fileName}`);
                return ''; // Return empty string for empty chunks
            }
            else {
                console.log(`Successfully processed chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}), extracted ${accumulatedText.length} characters`);
                // Add page markers to the extracted text
                const pageMarker = pageRange.start === pageRange.end
                    ? `=== PDF PAGE ${pageRange.start} ===`
                    : `=== PDF PAGES ${pageRange.start}-${pageRange.end} ===`;
                return `${pageMarker}\n${accumulatedText.trim()}\n=== END PAGES ${pageRange.start}-${pageRange.end} ===`;
            }
        }
        catch (error) {
            lastError = error;
            console.error(`Error processing chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) of ${fileName}, attempt ${attempt + 1}:`, error.message);
            // Check if this is the last attempt or if the error is not retryable
            if (attempt === maxRetries || !isRetryableError(error)) {
                if (!isRetryableError(error)) {
                    console.log(`Error for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) is not retryable, failing immediately`);
                }
                else {
                    console.log(`Max retries (${maxRetries}) reached for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end})`);
                }
                break;
            }
        }
    }
    // If we get here, all attempts failed
    throw new Error(`Failed to process chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) after ${maxRetries + 1} attempts: ${lastError.message}`);
}
// --- Main Service Function ---
export async function parseMultiplePDFs(files, sendSSE) {
    if (!API_KEY) {
        throw new Error('Server configuration error: Gemini API key not found.');
    }
    try {
        // Initialize GenAI
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        console.log('Initialized GenAI model for document parsing.');
        sendSSE({
            type: 'status',
            message: 'Initialized GenAI model for document parsing',
            timestamp: new Date().toISOString()
        });
        const results = [];
        // Process each file
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];
            try {
                // Only process PDF files (should be filtered by multer already)
                if (!file.mimetype.includes('pdf')) {
                    const errorResult = {
                        fileName: file.originalname,
                        success: false,
                        error: 'Only PDF files are supported.'
                    };
                    results.push(errorResult);
                    sendSSE({
                        type: 'file_error',
                        fileName: file.originalname,
                        error: 'Only PDF files are supported.',
                        timestamp: new Date().toISOString()
                    });
                    continue;
                }
                console.log(`Processing file: ${file.originalname}`);
                sendSSE({
                    type: 'file_start',
                    fileName: file.originalname,
                    fileIndex: fileIndex + 1,
                    totalFiles: files.length,
                    timestamp: new Date().toISOString()
                });
                // Convert file buffer to ArrayBuffer for PDF processing
                const fileBuffer = Buffer.from(file.buffer).buffer.slice(Buffer.from(file.buffer).byteOffset, Buffer.from(file.buffer).byteOffset + Buffer.from(file.buffer).byteLength);
                // Split PDF into manageable chunks
                const pdfChunks = await splitPdfIntoChunks(fileBuffer, MAX_PAGES_PER_CHUNK);
                console.log(`Split ${file.originalname} into ${pdfChunks.length} chunks`);
                sendSSE({
                    type: 'chunks_prepared',
                    fileName: file.originalname,
                    totalChunks: pdfChunks.length,
                    timestamp: new Date().toISOString()
                });
                const chunkResults = [];
                // Process each chunk
                for (let i = 0; i < pdfChunks.length; i++) {
                    try {
                        sendSSE({
                            type: 'chunk_start',
                            fileName: file.originalname,
                            chunkIndex: i + 1,
                            totalChunks: pdfChunks.length,
                            pageRange: pdfChunks[i].pageRange,
                            timestamp: new Date().toISOString()
                        });
                        // Process chunk with retry logic using streaming
                        const text = await processChunkWithRetry(ai, pdfChunks[i].chunk, i, pdfChunks.length, file.originalname, pdfChunks[i].pageRange);
                        chunkResults.push(text);
                        sendSSE({
                            type: 'chunk_complete',
                            fileName: file.originalname,
                            chunkIndex: i + 1,
                            totalChunks: pdfChunks.length,
                            pageRange: pdfChunks[i].pageRange,
                            extractedLength: text.length,
                            timestamp: new Date().toISOString()
                        });
                        // Add delay between chunks to avoid rate limiting
                        if (i < pdfChunks.length - 1) {
                            await delay(PROCESSING_DELAY);
                        }
                    }
                    catch (chunkError) {
                        console.error(`Final error processing chunk ${i + 1} (pages ${pdfChunks[i].pageRange.start}-${pdfChunks[i].pageRange.end}) of ${file.originalname}:`, chunkError);
                        const errorText = `[Error processing chunk ${i + 1} (pages ${pdfChunks[i].pageRange.start}-${pdfChunks[i].pageRange.end}): ${chunkError.message}]`;
                        chunkResults.push(errorText);
                        sendSSE({
                            type: 'chunk_error',
                            fileName: file.originalname,
                            chunkIndex: i + 1,
                            totalChunks: pdfChunks.length,
                            pageRange: pdfChunks[i].pageRange,
                            error: chunkError.message,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                // Combine all chunk results
                const combinedText = chunkResults
                    .filter(text => text.length > 0 && !text.includes('[Error processing chunk'))
                    .join('\n\n');
                if (combinedText.trim() === '') {
                    throw new Error("No text content could be extracted from any chunks of the document.");
                }
                // Calculate success metrics
                const successfulChunks = chunkResults.filter(text => text.length > 0 && !text.includes('[Error processing chunk')).length;
                const failedChunks = pdfChunks.length - successfulChunks;
                // Add to results
                const fileResult = {
                    fileName: file.originalname,
                    success: true,
                    extractedText: combinedText,
                    totalChunks: pdfChunks.length,
                    successfulChunks: successfulChunks,
                    failedChunks: failedChunks,
                    retryInfo: failedChunks > 0 ? `${failedChunks} chunks failed after retries` : 'All chunks processed successfully'
                };
                results.push(fileResult);
                sendSSE({
                    type: 'file_complete',
                    fileName: file.originalname,
                    success: true,
                    totalChunks: pdfChunks.length,
                    successfulChunks: successfulChunks,
                    failedChunks: failedChunks,
                    extractedLength: combinedText.length,
                    timestamp: new Date().toISOString()
                });
                console.log(`Successfully processed ${file.originalname}: ${successfulChunks}/${pdfChunks.length} chunks successful, total length: ${combinedText.length}`);
                if (failedChunks > 0) {
                    console.warn(`Warning: ${failedChunks} chunks failed for ${file.originalname} even after retries`);
                }
            }
            catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                const fileResult = {
                    fileName: file.originalname,
                    success: false,
                    error: error.message || 'An unexpected error occurred during processing.'
                };
                results.push(fileResult);
                sendSSE({
                    type: 'file_error',
                    fileName: file.originalname,
                    error: error.message || 'An unexpected error occurred during processing.',
                    timestamp: new Date().toISOString()
                });
            }
        }
        // Send final results
        sendSSE({
            type: 'complete',
            success: true,
            results,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in parseMultiplePDFs:', error);
        sendSSE({
            type: 'error',
            success: false,
            error: error.message || 'An unexpected error occurred during processing.',
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}
//# sourceMappingURL=pdfParsingService.js.map