import express from 'express';
export declare const limiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const corsOptions: {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
};
export declare const configureMiddleware: (app: express.Application) => void;
