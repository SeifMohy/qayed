import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads with memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Parse bank statement PDFs endpoint (temporary implementation)
router.post('/parse', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No files provided for parsing.' 
      });
    }

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
    const sendSSE = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Send initial status
      sendSSE({
        type: 'status',
        message: 'Express backend is working! PDF parsing will be implemented next.',
        timestamp: new Date().toISOString()
      });

      // Simulate processing for testing
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        sendSSE({
          type: 'file_start',
          fileName: file.originalname,
          fileIndex: i + 1,
          totalFiles: files.length,
          timestamp: new Date().toISOString()
        });

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        sendSSE({
          type: 'file_complete',
          fileName: file.originalname,
          success: true,
          extractedLength: 1000,
          timestamp: new Date().toISOString()
        });
      }

      // Send completion
      sendSSE({
        type: 'complete',
        success: true,
        results: files.map(file => ({
          fileName: file.originalname,
          success: true,
          extractedText: `Mock extracted text from ${file.originalname}`,
          message: 'This is a test response from the Express backend. Real PDF parsing will be implemented next.'
        })),
        timestamp: new Date().toISOString()
      });

      // Close the SSE connection
      res.end();

    } catch (error: any) {
      console.error('Error in PDF parsing:', error);
      sendSSE({
        type: 'error',
        success: false,
        error: error.message || 'An unexpected error occurred during processing.',
        timestamp: new Date().toISOString()
      });
      res.end();
    }

  } catch (error: any) {
    console.error('Error in parse route:', error);
    
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred during processing.'
      });
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