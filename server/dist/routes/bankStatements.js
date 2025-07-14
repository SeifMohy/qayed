import express from 'express';
import { uploadConfig } from '../middleware/upload.js';
import { sendError, sendSSE } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { parseMultiplePDFs } from '../services/pdfParsingService.js';
import { structureBankStatement } from '../services/bankStatementStructuringService.js';
const router = express.Router();
// Complete workflow: Parse, Structure, and Save bank statements
router.post('/process-complete', uploadConfig.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const { supabaseUserId } = req.body;
        if (!files || files.length === 0) {
            return sendError(res, 'No files provided for processing.', 400);
        }
        if (!supabaseUserId) {
            return sendError(res, 'User authentication required (supabaseUserId).', 401);
        }
        logger.info(`🚀 Starting complete processing workflow for ${files.length} files`);
        // Set up SSE headers for streaming response
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
        });
        // Helper function to send SSE data
        const sendSSEMessage = (data) => {
            sendSSE(res, data);
        };
        try {
            sendSSEMessage({
                type: 'status',
                message: `🚀 Starting complete processing workflow for ${files.length} files`,
                timestamp: new Date().toISOString()
            });
            const allResults = [];
            // Process each file through the complete workflow
            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                const file = files[fileIndex];
                const fileName = file.originalname;
                try {
                    // Only process PDF files
                    if (!file.mimetype.includes('pdf')) {
                        const errorResult = {
                            fileName: fileName,
                            success: false,
                            error: 'Only PDF files are supported.'
                        };
                        allResults.push(errorResult);
                        sendSSEMessage({
                            type: 'file_error',
                            fileName: fileName,
                            error: 'Only PDF files are supported.',
                            timestamp: new Date().toISOString()
                        });
                        continue;
                    }
                    sendSSEMessage({
                        type: 'status',
                        message: `📄 Processing file ${fileIndex + 1}/${files.length}: ${fileName}`,
                        timestamp: new Date().toISOString()
                    });
                    // Step 1: Parse the PDF (extract text)
                    sendSSEMessage({
                        type: 'status',
                        message: `🔍 Step 1: Extracting text from ${fileName}`,
                        timestamp: new Date().toISOString()
                    });
                    const parseResults = [];
                    // Parse single file (wrapped in array for existing function)
                    await parseMultiplePDFs([file], (data) => {
                        // Forward parsing SSE messages and collect results
                        sendSSEMessage(data);
                        if (data.type === 'complete' && data.results) {
                            parseResults.push(...data.results);
                        }
                    });
                    // Check if parsing was successful
                    const parseResult = parseResults.find(r => r.fileName === fileName);
                    if (!parseResult || !parseResult.success || !parseResult.extractedText) {
                        const errorResult = {
                            fileName: fileName,
                            success: false,
                            error: parseResult?.error || 'Failed to extract text from PDF'
                        };
                        allResults.push(errorResult);
                        sendSSEMessage({
                            type: 'file_error',
                            fileName: fileName,
                            error: errorResult.error,
                            timestamp: new Date().toISOString()
                        });
                        continue;
                    }
                    // Step 2: Structure the extracted text and save to database
                    sendSSEMessage({
                        type: 'status',
                        message: `🏗️ Step 2: Structuring and saving ${fileName}`,
                        timestamp: new Date().toISOString()
                    });
                    const structureResult = await structureBankStatement(parseResult.extractedText, fileName, undefined, // fileUrl - we don't have Supabase URLs in this workflow
                    supabaseUserId, sendSSEMessage);
                    if (structureResult.success) {
                        const fileResult = {
                            fileName: fileName,
                            success: true,
                            extractedText: parseResult.extractedText,
                            extractedLength: parseResult.extractedText.length,
                            totalChunks: parseResult.totalChunks,
                            successfulChunks: parseResult.successfulChunks,
                            failedChunks: parseResult.failedChunks,
                            savedStatements: structureResult.savedStatements,
                            processingResults: structureResult.processingResults,
                            classificationResults: structureResult.classificationResults
                        };
                        allResults.push(fileResult);
                        sendSSEMessage({
                            type: 'file_complete',
                            fileName: fileName,
                            success: true,
                            message: `✅ Successfully processed ${fileName}: ${structureResult.savedStatements?.length || 0} statements saved`,
                            timestamp: new Date().toISOString()
                        });
                        logger.info(`✅ Complete processing successful for ${fileName}`);
                    }
                    else {
                        const errorResult = {
                            fileName: fileName,
                            success: false,
                            error: structureResult.error || 'Failed to structure and save bank statement'
                        };
                        allResults.push(errorResult);
                        sendSSEMessage({
                            type: 'file_error',
                            fileName: fileName,
                            error: errorResult.error,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                catch (error) {
                    logger.error(`❌ Error in complete processing for ${fileName}:`, error);
                    const errorResult = {
                        fileName: fileName,
                        success: false,
                        error: error.message || 'An unexpected error occurred during processing.'
                    };
                    allResults.push(errorResult);
                    sendSSEMessage({
                        type: 'file_error',
                        fileName: fileName,
                        error: errorResult.error,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            // Send final results
            const successfulFiles = allResults.filter(r => r.success).length;
            const totalStatements = allResults
                .filter(r => r.success && r.savedStatements)
                .reduce((sum, r) => sum + (r.savedStatements?.length || 0), 0);
            sendSSEMessage({
                type: 'complete',
                success: true,
                results: allResults,
                message: `🎉 Complete workflow finished: ${successfulFiles}/${allResults.length} files successful, ${totalStatements} statements saved`,
                timestamp: new Date().toISOString()
            });
            logger.info(`🎉 Complete processing workflow finished: ${successfulFiles}/${allResults.length} files successful, ${totalStatements} statements saved`);
            // Close the SSE connection
            res.end();
        }
        catch (error) {
            logger.error('Error in complete processing workflow:', error);
            sendSSEMessage({
                type: 'error',
                success: false,
                error: error.message || 'An unexpected error occurred during the complete processing workflow.',
                timestamp: new Date().toISOString()
            });
            res.end();
        }
    }
    catch (error) {
        logger.error('Error in complete processing route:', error);
        // If headers haven't been sent yet, send JSON error
        if (!res.headersSent) {
            sendError(res, error.message || 'An unexpected error occurred during processing.', 500);
        }
    }
});
// Health check for this specific service
router.get('/health', (req, res) => {
    res.json({
        service: 'PDF Parsing Service',
        status: 'ok',
        timestamp: new Date().toISOString(),
        geminiApiConfigured: !!process.env.GEMINI_API_KEY
    });
});
export default router;
//# sourceMappingURL=bankStatements.js.map