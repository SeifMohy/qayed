import express from 'express';
import type { Request, Response } from 'express';
import { uploadConfig } from '../middleware/upload.js';
import { sendError, sendSSE } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { parseMultiplePDFs } from '../services/pdfParsingService.js';
import type { SSEMessage } from '../types/api.js';

const router = express.Router();

// Parse bank statement PDFs endpoint
router.post('/parse', uploadConfig.array('files'), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
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
    const sendSSEMessage = (data: SSEMessage) => {
      sendSSE(res, data);
    };

    try {
      // Use the PDF parsing service
      await parseMultiplePDFs(files, sendSSEMessage);
      
      logger.info(`✅ Successfully processed ${files.length} files`);
      
      // Close the SSE connection
      res.end();

    } catch (error: any) {
      logger.error('Error in PDF parsing:', error);
      sendSSEMessage({
        type: 'error',
        success: false,
        error: error.message || 'An unexpected error occurred during processing.',
        timestamp: new Date().toISOString()
      });
      res.end();
    }

  } catch (error: any) {
    logger.error('Error in parse route:', error);
    
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      sendError(res, error.message || 'An unexpected error occurred during processing.', 500);
    }
  }
});

// Health check for this specific service
router.get('/health', (req: Request, res: Response) => {
  res.json({
    service: 'PDF Parsing Service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiApiConfigured: !!process.env.GEMINI_API_KEY
  });
});

export default router; 