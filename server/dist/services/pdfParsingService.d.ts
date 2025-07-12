interface SSECallback {
    (data: any): void;
}
export declare function parseMultiplePDFs(files: Express.Multer.File[], sendSSE: SSECallback): Promise<void>;
export {};
