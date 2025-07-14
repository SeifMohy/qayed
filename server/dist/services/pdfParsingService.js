import { logger } from '../utils/logger.js';
// Main function to parse multiple PDFs (simplified working version)
export async function parseMultiplePDFs(files, sendSSE) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        logger.error('Error: GEMINI_API_KEY environment variable is not set.');
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    // Send initial status
    sendSSE({
        type: 'status',
        message: '🚀 Starting PDF processing with Express backend...',
        timestamp: new Date().toISOString()
    });
    const results = [];
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileName = file.originalname;
        logger.info(`🔄 Processing file ${fileIndex + 1}/${files.length}: ${fileName}`);
        sendSSE({
            type: 'file_start',
            fileName,
            fileIndex: fileIndex + 1,
            totalFiles: files.length,
            timestamp: new Date().toISOString()
        });
        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            const extractedText = `🎯 Mock extracted text from ${fileName}

This is a successful test response from the Express backend!

Next steps:
1. ✅ Express server is working
2. ✅ File uploads are working  
3. ✅ SSE streaming is working
4. ✅ TypeScript structure is working
5. ✅ Environment variables are working
6. 🔄 Real PDF parsing will be implemented next

The migration to always-on backend with proper TypeScript structure is complete!`;
            const fileResult = {
                fileName,
                success: true,
                extractedText,
                extractedLength: extractedText.length,
                totalChunks: 1,
                successfulChunks: 1,
                failedChunks: 0
            };
            results.push(fileResult);
            sendSSE({
                type: 'file_complete',
                fileName,
                success: true,
                message: `✅ Successfully processed ${fileName} with Express backend!`,
                timestamp: new Date().toISOString()
            });
            logger.info(`✅ Completed processing ${fileName}: Mock processing successful`);
        }
        catch (error) {
            logger.error(`❌ Failed to process ${fileName}:`, error.message);
            const fileResult = {
                fileName,
                success: false,
                error: error.message || 'Unknown error occurred'
            };
            results.push(fileResult);
            sendSSE({
                type: 'file_complete',
                fileName,
                success: false,
                error: error.message || 'Unknown error occurred',
                timestamp: new Date().toISOString()
            });
        }
    }
    // Send final completion
    const successfulFiles = results.filter(r => r.success).length;
    sendSSE({
        type: 'complete',
        success: successfulFiles > 0,
        results,
        message: `Processing complete: ${successfulFiles}/${results.length} files successful`,
        timestamp: new Date().toISOString()
    });
    logger.info(`🎉 Processing complete: ${successfulFiles}/${results.length} files successful`);
}
//# sourceMappingURL=pdfParsingService.js.map