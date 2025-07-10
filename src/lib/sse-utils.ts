export interface SSEEventHandler {
  onStatus?: (message: string) => void;
  onFileStart?: (fileName: string, fileIndex: number, totalFiles: number) => void;
  onChunksPrepared?: (fileName: string, totalChunks: number) => void;
  onChunkComplete?: (fileName: string, chunkIndex: number, totalChunks: number) => void;
  onFileComplete?: (fileName: string, success: boolean) => void;
  onStatementComplete?: (statementIndex: number, action: string, message: string) => void;
  onValidationComplete?: (bankStatementId: number, status: string) => void;
  onClassificationTriggered?: (bankStatementId: number) => void;
  onProgress?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface SSEParseResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Parse Server-Sent Events (SSE) from a response stream
 * @param response - The fetch Response object with SSE stream
 * @param handlers - Event handlers for different SSE event types
 * @returns Promise that resolves with the final result
 */
export async function parseSSEStream(
  response: Response,
  handlers: SSEEventHandler = {}
): Promise<SSEParseResult> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response stream available.');
  }

  let finalResult: any = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            // Call generic progress handler if provided
            handlers.onProgress?.(data);

            switch (data.type) {
              case 'status':
                handlers.onStatus?.(data.message);
                break;
              case 'file_start':
                handlers.onFileStart?.(data.fileName, data.fileIndex, data.totalFiles);
                break;
              case 'chunks_prepared':
                handlers.onChunksPrepared?.(data.fileName || 'processing', data.totalChunks);
                break;
              case 'chunk_complete':
                handlers.onChunkComplete?.(data.fileName || 'processing', data.chunkIndex || data.chunkNumber, data.totalChunks);
                break;
              case 'file_complete':
                handlers.onFileComplete?.(data.fileName, data.success);
                break;
              case 'statement_complete':
                handlers.onStatementComplete?.(data.statementIndex, data.action, data.message);
                break;
              case 'validation_complete':
                handlers.onValidationComplete?.(data.bankStatementId, data.status);
                break;
              case 'classification_triggered':
                handlers.onClassificationTriggered?.(data.bankStatementId);
                break;
              case 'complete':
                finalResult = data;
                break;
              case 'error':
                const errorMessage = data.error || 'Processing failed';
                handlers.onError?.(errorMessage);
                throw new Error(errorMessage);
              case 'file_error':
              case 'chunk_error':
              case 'statement_error':
              case 'validation_error':
              case 'classification_error':
                // Log specific errors but don't throw - let processing continue
                const specificError = data.error || `Error in ${data.type}`;
                handlers.onError?.(specificError);
                console.error(`SSE Error (${data.type}):`, specificError);
                break;
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', line, parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!finalResult) {
    throw new Error('No final result received from processing.');
  }

  return {
    success: finalResult.success,
    data: finalResult,
    error: finalResult.success ? undefined : finalResult.error
  };
}

/**
 * Helper function specifically for parsing bank statement parse results
 */
export async function parseBankStatementParseSSE(response: Response): Promise<any> {
  const result = await parseSSEStream(response, {
    onStatus: (message) => console.log('📄 Parse Status:', message),
    onFileStart: (fileName, fileIndex, totalFiles) => 
      console.log(`📄 Starting file ${fileIndex}/${totalFiles}: ${fileName}`),
    onChunksPrepared: (fileName, totalChunks) => 
      console.log(`📄 File ${fileName} split into ${totalChunks} chunks`),
    onChunkComplete: (fileName, chunkIndex, totalChunks) => 
      console.log(`📄 Chunk ${chunkIndex}/${totalChunks} complete for ${fileName}`),
    onFileComplete: (fileName, success) => 
      console.log(`📄 File ${fileName} ${success ? 'processed successfully' : 'failed'}`),
    onError: (error) => console.error('📄 Parse Error:', error)
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to process the bank statements.');
  }

  return {
    success: result.data.success,
    results: result.data.results
  };
}

/**
 * Helper function specifically for parsing bank statement structure results
 */
export async function parseBankStatementStructureSSE(response: Response): Promise<any> {
  const result = await parseSSEStream(response, {
    onStatus: (message) => console.log('🏗️ Structure Status:', message),
    onChunksPrepared: (_, totalChunks) => 
      console.log(`🏗️ Processing ${totalChunks} chunks`),
    onChunkComplete: (_, chunkIndex, totalChunks) => 
      console.log(`🏗️ Chunk ${chunkIndex}/${totalChunks} complete`),
    onStatementComplete: (statementIndex, action, message) => 
      console.log(`🏗️ Statement ${statementIndex} processed: ${action} - ${message}`),
    onValidationComplete: (bankStatementId, status) => 
      console.log(`🏗️ Validation for statement ${bankStatementId}: ${status}`),
    onClassificationTriggered: (bankStatementId) => 
      console.log(`🏗️ Classification triggered for statement ${bankStatementId}`),
    onError: (error) => console.error('🏗️ Structure Error:', error)
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to structure the bank statement.');
  }

  return result.data;
} 