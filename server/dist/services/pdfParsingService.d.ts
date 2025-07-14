import type { SSEMessage } from '../types/api.js';
interface SSECallback {
    (data: SSEMessage): void;
}
export declare function parseMultiplePDFs(files: Express.Multer.File[], sendSSE: SSECallback): Promise<void>;
export {};
