// Application constants
export const APP_CONFIG = {
    DEFAULT_PORT: 3001,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FILES: 10,
    BODY_LIMIT: '100mb',
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 50
};
// PDF Processing configuration
export const PDF_CONFIG = {
    MODEL_NAME: "gemini-2.5-flash-preview-05-20",
    MAX_PAGES_PER_CHUNK: parseInt(process.env.MAX_PAGES_PER_CHUNK || '5'),
    PROCESSING_DELAY: parseInt(process.env.PROCESSING_DELAY || '1000'),
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES || '3'),
    RETRY_BASE_DELAY: 2000
};
// HTTP Status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
// Supported file types
export const SUPPORTED_MIME_TYPES = {
    PDF: 'application/pdf'
};
//# sourceMappingURL=constants.js.map