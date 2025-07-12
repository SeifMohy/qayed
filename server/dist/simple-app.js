import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false // Allow for file uploads
}));
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-vercel-app.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));
app.use(morgan('combined'));
// Body parsing with larger limits for file uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
// Apply rate limiting to API routes
app.use('/api/', limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        service: 'Express Backend',
        message: 'Always-on backend is running successfully!'
    });
});
// Configure multer for file uploads
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
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
// Test PDF parsing endpoint (mock implementation)
app.post('/api/bank-statements/parse', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files provided for parsing.'
            });
        }
        console.log(`🎉 Received ${files.length} files for processing via Express backend!`);
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
        const sendSSE = (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        try {
            // Send initial status
            sendSSE({
                type: 'status',
                message: '🚀 Express backend is working! This is a test implementation.',
                timestamp: new Date().toISOString()
            });
            // Simulate processing for each file
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
                await new Promise(resolve => setTimeout(resolve, 1500));
                sendSSE({
                    type: 'file_complete',
                    fileName: file.originalname,
                    success: true,
                    extractedLength: 1200,
                    message: `✅ Processed ${file.originalname} successfully with Express backend!`,
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
                    extractedText: `🎯 Mock extracted text from ${file.originalname}\n\nThis is a successful test response from the Express backend!\n\nNext steps:\n1. ✅ Express server is working\n2. ✅ File uploads are working\n3. ✅ SSE streaming is working\n4. 🔄 Real PDF parsing will be implemented next\n\nThe migration to always-on backend is progressing well!`,
                    message: 'Express backend test successful!'
                })),
                timestamp: new Date().toISOString()
            });
            console.log(`✅ Successfully processed ${files.length} files`);
            // Close the SSE connection
            res.end();
        }
        catch (error) {
            console.error('Error in PDF parsing:', error);
            sendSSE({
                type: 'error',
                success: false,
                error: error.message || 'An unexpected error occurred during processing.',
                timestamp: new Date().toISOString()
            });
            res.end();
        }
    }
    catch (error) {
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
// Test endpoint for API integration
app.get('/api/bank-statements/health', (req, res) => {
    res.json({
        service: 'PDF Parsing Service',
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Bank statements parsing service is ready!'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        message: 'This endpoint is not available on the Express backend'
    });
});
// Global error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    // Handle Multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File too large. Maximum size is 50MB per file.'
        });
    }
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            details: error.message,
            stack: error.stack
        })
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Always-on backend server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📄 PDF parsing: http://localhost:${PORT}/api/bank-statements/parse`);
    console.log(`✅ Express backend is ready for testing!`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
export default app;
//# sourceMappingURL=simple-app.js.map