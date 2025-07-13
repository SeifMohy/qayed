export declare const APP_CONFIG: {
    DEFAULT_PORT: number;
    MAX_FILE_SIZE: number;
    MAX_FILES: number;
    BODY_LIMIT: string;
    RATE_LIMIT_WINDOW: number;
    RATE_LIMIT_MAX: number;
};
export declare const PDF_CONFIG: {
    MODEL_NAME: string;
    MAX_PAGES_PER_CHUNK: number;
    PROCESSING_DELAY: number;
    MAX_RETRIES: number;
    RETRY_BASE_DELAY: number;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const SUPPORTED_MIME_TYPES: {
    readonly PDF: "application/pdf";
};
