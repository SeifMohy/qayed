export const sendSuccess = (res, data, message, statusCode = 200) => {
    const response = {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
};
export const sendError = (res, error, statusCode = 500, details) => {
    const response = {
        success: false,
        error,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && details && { details })
    };
    res.status(statusCode).json(response);
};
export const sendSSE = (res, data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};
//# sourceMappingURL=response.js.map