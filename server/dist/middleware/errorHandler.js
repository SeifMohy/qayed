import multer from 'multer';
import { logger } from '../utils/logger.js';
export const errorHandler = (error, req, res, next) => {
    logger.error('Server error:', error);
    // Handle Multer errors
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 50MB per file.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 10 files allowed.'
            });
        }
    }
    // Handle file filter errors
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            error: 'Only PDF files are allowed'
        });
    }
    // Default error response
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            details: error.message,
            stack: error.stack
        })
    });
};
// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
};
//# sourceMappingURL=errorHandler.js.map