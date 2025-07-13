import express from 'express';
// Import middleware configuration
import { configureMiddleware } from './config/middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
// Import routes
import apiRoutes from './routes/index.js';
// Create Express application
const app = express();
// Configure middleware
configureMiddleware(app);
// Health check endpoint (direct mount for compatibility)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        service: 'Express Backend',
        message: 'Always-on backend is running successfully!',
        environment: process.env.NODE_ENV || 'development',
        geminiApiConfigured: !!process.env.GEMINI_API_KEY
    });
});
// Mount API routes
app.use('/api', apiRoutes);
// Error handling middleware (must be after routes)
app.use('*', notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map