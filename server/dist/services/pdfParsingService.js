import { GoogleGenAI } from "@google/genai";
import { PDFDocument } from "pdf-lib";
import { logger } from "../utils/logger.js";
// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const MAX_PAGES_PER_CHUNK = 5;
const PROCESSING_DELAY = 1000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 2000;
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
// --- Helper Function to split PDF into chunks ---
async function splitPdfIntoChunks(pdfBuffer, maxPagesPerChunk = MAX_PAGES_PER_CHUNK) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        logger.info(`PDF has ${totalPages} pages, splitting into chunks of ${maxPagesPerChunk} pages`);
        const chunks = [];
        for (let i = 0; i < totalPages; i += maxPagesPerChunk) {
            const endPage = Math.min(i + maxPagesPerChunk, totalPages);
            const chunkDoc = await PDFDocument.create();
            const pageIndices = Array.from({ length: endPage - i }, (_, idx) => i + idx);
            const copiedPages = await chunkDoc.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach((page) => {
                chunkDoc.addPage(page);
            });
            const chunkBuffer = await chunkDoc.save();
            chunks.push({
                chunk: chunkBuffer,
                pageRange: {
                    start: i + 1,
                    end: endPage,
                },
            });
            logger.info(`Created chunk ${Math.floor(i / maxPagesPerChunk) + 1}: pages ${i + 1}-${endPage}`);
        }
        return chunks;
    }
    catch (error) {
        logger.error("Error splitting PDF:", error);
        throw new Error("Failed to split PDF into chunks");
    }
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableError(error) {
    const errorMessage = error.message?.toLowerCase() || "";
    const retryablePatterns = [
        "internal error",
        "server error",
        "rate limit",
        "timeout",
        "service unavailable",
        "temporary failure",
        "quota exceeded",
        "api error",
        "network error",
        "connection error",
        "500",
        "502",
        "503",
        "504",
    ];
    return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
}
async function processChunkWithRetry(ai, chunkData, chunkIndex, totalChunks, fileName, pageRange, maxRetries = MAX_RETRIES) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const retryDelay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
                logger.info(`Retrying chunk ${chunkIndex + 1}/${totalChunks} (pages ${pageRange.start}-${pageRange.end}) for ${fileName}, attempt ${attempt + 1}/${maxRetries + 1} after ${retryDelay}ms delay`);
                await delay(retryDelay);
            }
            else {
                logger.info(`Processing chunk ${chunkIndex + 1}/${totalChunks} (pages ${pageRange.start}-${pageRange.end}) for ${fileName}`);
            }
            const base64Data = Buffer.from(chunkData).toString("base64");
            const prompt = `Extract the text content from this PDF chunk (chunk ${chunkIndex + 1} of ${totalChunks}, containing pages ${pageRange.start}-${pageRange.end}).`;
            const fileContent = {
                parts: [
                    { text: PARSING_SYSTEM_PROMPT },
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: base64Data,
                        },
                    },
                ],
            };
            const streamingResponse = await ai.models.generateContentStream({
                model: MODEL_NAME,
                contents: fileContent,
                config: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 32768,
                },
            });
            let accumulatedText = "";
            for await (const chunk of streamingResponse) {
                const chunkText = chunk.text || "";
                accumulatedText += chunkText;
                if (chunkText.trim()) {
                    logger.info(`Chunk ${chunkIndex + 1} streaming: received ${chunkText.length} characters, total: ${accumulatedText.length}`);
                }
            }
            if (!accumulatedText || accumulatedText.trim() === "") {
                logger.warn(`GenAI returned empty text content for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) of ${fileName}`);
                return "";
            }
            else {
                logger.info(`Successfully processed chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}), extracted ${accumulatedText.length} characters`);
                const pageMarker = pageRange.start === pageRange.end
                    ? `=== PDF PAGE ${pageRange.start} ===`
                    : `=== PDF PAGES ${pageRange.start}-${pageRange.end} ===`;
                return `${pageMarker}\n${accumulatedText.trim()}\n=== END PAGES ${pageRange.start}-${pageRange.end} ===`;
            }
        }
        catch (error) {
            lastError = error;
            logger.error(`Error processing chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) of ${fileName}, attempt ${attempt + 1}:`, error.message);
            if (attempt === maxRetries || !isRetryableError(error)) {
                if (!isRetryableError(error)) {
                    logger.info(`Error for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) is not retryable, failing immediately`);
                }
                else {
                    logger.info(`Max retries (${maxRetries}) reached for chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end})`);
                }
                break;
            }
        }
    }
    throw new Error(`Failed to process chunk ${chunkIndex + 1} (pages ${pageRange.start}-${pageRange.end}) after ${maxRetries + 1} attempts: ${lastError.message}`);
}
// Main function to parse multiple PDFs (real implementation)
export async function parseMultiplePDFs(files, sendSSE) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        logger.error("Error: GEMINI_API_KEY environment variable is not set.");
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    sendSSE({
        type: "status",
        message: "🚀 Starting PDF processing with Express backend...",
        timestamp: new Date().toISOString(),
    });
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const results = [];
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileName = file.originalname;
        logger.info(`🔄 Processing file ${fileIndex + 1}/${files.length}: ${fileName}`);
        sendSSE({
            type: "file_start",
            fileName,
            fileIndex: fileIndex + 1,
            totalFiles: files.length,
            timestamp: new Date().toISOString(),
        });
        try {
            if (!file.mimetype.includes("pdf")) {
                const errorResult = {
                    fileName,
                    success: false,
                    error: "Only PDF files are supported.",
                };
                results.push(errorResult);
                sendSSE({
                    type: "file_error",
                    fileName,
                    error: "Only PDF files are supported.",
                    timestamp: new Date().toISOString(),
                });
                continue;
            }
            const fileBuffer = file.buffer;
            const pdfChunks = await splitPdfIntoChunks(fileBuffer, MAX_PAGES_PER_CHUNK);
            logger.info(`Split ${fileName} into ${pdfChunks.length} chunks`);
            sendSSE({
                type: "chunks_prepared",
                fileName,
                totalChunks: pdfChunks.length,
                timestamp: new Date().toISOString(),
            });
            const chunkResults = [];
            for (let i = 0; i < pdfChunks.length; i++) {
                try {
                    sendSSE({
                        type: "chunk_start",
                        fileName,
                        chunkIndex: i + 1,
                        totalChunks: pdfChunks.length,
                        pageRange: pdfChunks[i].pageRange,
                        timestamp: new Date().toISOString(),
                    });
                    const text = await processChunkWithRetry(ai, pdfChunks[i].chunk, i, pdfChunks.length, fileName, pdfChunks[i].pageRange);
                    chunkResults.push(text);
                    sendSSE({
                        type: "chunk_complete",
                        fileName,
                        chunkIndex: i + 1,
                        totalChunks: pdfChunks.length,
                        pageRange: pdfChunks[i].pageRange,
                        extractedLength: text.length,
                        timestamp: new Date().toISOString(),
                    });
                    if (i < pdfChunks.length - 1) {
                        await delay(PROCESSING_DELAY);
                    }
                }
                catch (chunkError) {
                    logger.error(`Final error processing chunk ${i + 1} (pages ${pdfChunks[i].pageRange.start}-${pdfChunks[i].pageRange.end}) of ${fileName}:`, chunkError);
                    const errorText = `[Error processing chunk ${i + 1} (pages ${pdfChunks[i].pageRange.start}-${pdfChunks[i].pageRange.end}): ${chunkError.message}]`;
                    chunkResults.push(errorText);
                    sendSSE({
                        type: "chunk_error",
                        fileName,
                        chunkIndex: i + 1,
                        totalChunks: pdfChunks.length,
                        pageRange: pdfChunks[i].pageRange,
                        error: chunkError.message,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            const combinedText = chunkResults
                .filter((text) => text.length > 0 && !text.includes("[Error processing chunk"))
                .join("\n\n");
            if (combinedText.trim() === "") {
                throw new Error("No text content could be extracted from any chunks of the document.");
            }
            const successfulChunks = chunkResults.filter((text) => text.length > 0 && !text.includes("[Error processing chunk")).length;
            const failedChunks = pdfChunks.length - successfulChunks;
            const fileResult = {
                fileName,
                success: true,
                extractedText: combinedText,
                totalChunks: pdfChunks.length,
                successfulChunks: successfulChunks,
                failedChunks: failedChunks,
                retryInfo: failedChunks > 0
                    ? `${failedChunks} chunks failed after retries`
                    : "All chunks processed successfully",
                extractedLength: combinedText.length,
            };
            results.push(fileResult);
            sendSSE({
                type: "file_complete",
                fileName,
                success: true,
                totalChunks: pdfChunks.length,
                successfulChunks: successfulChunks,
                failedChunks: failedChunks,
                extractedLength: combinedText.length,
                extractedText: combinedText,
                timestamp: new Date().toISOString(),
            });
            logger.info(`Successfully processed ${fileName}: ${successfulChunks}/${pdfChunks.length} chunks successful, total length: ${combinedText.length}`);
            if (failedChunks > 0) {
                logger.warn(`Warning: ${failedChunks} chunks failed for ${fileName} even after retries`);
            }
        }
        catch (error) {
            logger.error(`Error processing file ${fileName}:`, error);
            const fileResult = {
                fileName,
                success: false,
                error: error.message || "An unexpected error occurred during processing.",
            };
            results.push(fileResult);
            sendSSE({
                type: "file_error",
                fileName,
                error: error.message || "An unexpected error occurred during processing.",
                timestamp: new Date().toISOString(),
            });
        }
    }
    const successfulFiles = results.filter((r) => r.success).length;
    sendSSE({
        type: "complete",
        success: successfulFiles > 0,
        results,
        message: `Processing complete: ${successfulFiles}/${results.length} files successful`,
        timestamp: new Date().toISOString(),
    });
    logger.info(`🎉 Processing complete: ${successfulFiles}/${results.length} files successful`);
}
//# sourceMappingURL=pdfParsingService.js.map