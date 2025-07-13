import express from 'express';
import { uploadConfig } from '../middleware/upload.js';
import { sendError, sendSSE } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { parseMultiplePDFs } from '../services/pdfParsingService.js';
import { structureBankStatement } from '../services/bankStatementStructuringService.js';
const router = express.Router();
// Parse bank statement PDFs endpoint
router.post('/parse', uploadConfig.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return sendError(res, 'No files provided for parsing.', 400);
        }
        logger.info(`🎉 Received ${files.length} files for processing via Express backend!`);
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
            // Use the PDF parsing service
            await parseMultiplePDFs(files, sendSSEMessage);
            logger.info(`✅ Successfully processed ${files.length} files`);
            // Close the SSE connection
            res.end();
        }
        catch (error) {
            logger.error('Error in PDF parsing:', error);
            sendSSEMessage({
                type: 'error',
                success: false,
                error: error.message || 'An unexpected error occurred during processing.',
                timestamp: new Date().toISOString()
            });
            res.end();
        }
    }
    catch (error) {
        logger.error('Error in parse route:', error);
        // If headers haven't been sent yet, send JSON error
        if (!res.headersSent) {
            sendError(res, error.message || 'An unexpected error occurred during processing.', 500);
        }
    }
});
// Structure bank statement text endpoint
router.post('/structure', async (req, res) => {
    try {
        const { statementText, fileName } = req.body;
        if (!statementText) {
            return sendError(res, 'Statement text is required', 400);
        }
        logger.info(`🔄 Starting bank statement structuring for: ${fileName || 'unknown file'}`);
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
            // Use the bank statement structuring service
            const structuredData = await structureBankStatement(statementText, fileName, sendSSEMessage);
            logger.info(`✅ Successfully structured ${structuredData.account_statements.length} account statements`);
            // Send final results
            sendSSEMessage({
                type: 'complete',
                success: true,
                message: `Successfully structured ${structuredData.account_statements.length} account statements`,
                timestamp: new Date().toISOString()
            });
            // Close the SSE connection
            res.end();
        }
        catch (error) {
            logger.error('Error in bank statement structuring:', error);
            sendSSEMessage({
                type: 'error',
                success: false,
                error: error.message || 'An unexpected error occurred during structuring.',
                timestamp: new Date().toISOString()
            });
            res.end();
        }
    }
    catch (error) {
        logger.error('Error in structure route:', error);
        // If headers haven't been sent yet, send JSON error
        if (!res.headersSent) {
            sendError(res, error.message || 'An unexpected error occurred during structuring.', 500);
        }
    }
});
// Parse and structure bank statement PDFs endpoint (combined workflow)
router.post('/parse-and-structure', uploadConfig.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return sendError(res, 'No files provided for parsing.', 400);
        }
        logger.info(`🎉 Received ${files.length} files for parsing and structuring via Express backend!`);
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
            // Store extracted texts for structuring
            const extractedTexts = [];
            // Custom SSE handler that captures extracted text
            const parseSSEHandler = (data) => {
                // Forward the message to client
                sendSSE(res, data);
                // Capture extracted text from file_complete messages
                if (data.type === 'file_complete' && data.success && data.extractedText) {
                    extractedTexts.push({
                        fileName: data.fileName || 'unknown',
                        text: data.extractedText
                    });
                }
            };
            // Step 1: Parse PDFs
            sendSSEMessage({
                type: 'status',
                message: 'Step 1: Parsing PDF files...',
                timestamp: new Date().toISOString()
            });
            await parseMultiplePDFs(files, parseSSEHandler);
            logger.info(`✅ Successfully parsed ${files.length} files, now structuring...`);
            // Step 2: Structure each extracted text
            sendSSEMessage({
                type: 'status',
                message: 'Step 2: Structuring bank statements...',
                timestamp: new Date().toISOString()
            });
            for (const { fileName, text } of extractedTexts) {
                try {
                    sendSSEMessage({
                        type: 'status',
                        message: `Structuring ${fileName}...`,
                        timestamp: new Date().toISOString()
                    });
                    const structuredData = await structureBankStatement(text, fileName, sendSSEMessage);
                    logger.info(`✅ Successfully structured ${fileName}: ${structuredData.account_statements.length} account statements`);
                }
                catch (structureError) {
                    logger.error(`Error structuring ${fileName}:`, structureError);
                    sendSSEMessage({
                        type: 'error',
                        message: `Failed to structure ${fileName}: ${structureError.message}`,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            // Send final completion message
            sendSSEMessage({
                type: 'complete',
                success: true,
                message: `Successfully processed ${files.length} files through parsing and structuring`,
                timestamp: new Date().toISOString()
            });
            // Close the SSE connection
            res.end();
        }
        catch (error) {
            logger.error('Error in parse-and-structure workflow:', error);
            sendSSEMessage({
                type: 'error',
                success: false,
                error: error.message || 'An unexpected error occurred during processing.',
                timestamp: new Date().toISOString()
            });
            res.end();
        }
    }
    catch (error) {
        logger.error('Error in parse-and-structure route:', error);
        // If headers haven't been sent yet, send JSON error
        if (!res.headersSent) {
            sendError(res, error.message || 'An unexpected error occurred during processing.', 500);
        }
    }
});
// Health check for this specific service
router.get('/health', (req, res) => {
    res.json({
        service: 'Bank Statement Processing Service',
        status: 'ok',
        timestamp: new Date().toISOString(),
        geminiApiConfigured: !!process.env.GEMINI_API_KEY
    });
});
export default router;
//# sourceMappingURL=bankStatements.js.map