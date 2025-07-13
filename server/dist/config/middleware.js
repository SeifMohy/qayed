import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Rate limiting - more permissive for file uploads
export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// CORS configuration
export const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://qayed.vercel.app',
        'https://your-vercel-app.vercel.app',
        process.env.FRONTEND_URL
    ].filter((origin) => Boolean(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
};
// Configure middleware
export const configureMiddleware = (app) => {
    // Security middleware
    app.use(helmet({
        crossOriginEmbedderPolicy: false // Allow for file uploads
    }));
    // CORS
    app.use(cors(corsOptions));
    // Logging
    app.use(morgan('combined'));
    // Body parsing with larger limits for file uploads
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true, limit: '100mb' }));
    // Apply rate limiting to API routes
    app.use('/api/', limiter);
};
//# sourceMappingURL=middleware.js.map