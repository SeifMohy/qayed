import dotenv from 'dotenv';
// Load environment variables FIRST, before any other imports
dotenv.config();
import app from './app.js';
import { logger } from './utils/logger.js';
import { APP_CONFIG } from './utils/constants.js';
const PORT = process.env.PORT || APP_CONFIG.DEFAULT_PORT;
// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Always-on backend server running on port ${PORT}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔑 Gemini API Key configured: ${!!process.env.GEMINI_API_KEY}`);
    logger.info(`📄 PDF parsing: http://localhost:${PORT}/api/bank-statements/parse`);
    logger.info(`✅ Express backend is ready for requests!`);
});
// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
export default server;
//# sourceMappingURL=server.js.map