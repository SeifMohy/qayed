import express from 'express';
import { sendSuccess } from '../utils/response.js';
const router = express.Router();
router.get('/', (req, res) => {
    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        geminiApiConfigured: !!process.env.GEMINI_API_KEY
    };
    sendSuccess(res, healthData, 'Server is healthy');
});
export default router;
//# sourceMappingURL=health.js.map