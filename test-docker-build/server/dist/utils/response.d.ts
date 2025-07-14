import type { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => void;
export declare const sendError: (res: Response, error: string, statusCode?: number, details?: any) => void;
export declare const sendSSE: (res: Response, data: any) => void;
