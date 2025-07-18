// Common API types
export interface BaseResponse {
  success: boolean;
  timestamp: string;
  error?: string;
  message?: string;
}

export interface FileUploadResponse extends BaseResponse {
  data?: {
    results: FileProcessingResult[];
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
  };
}

export interface FileProcessingResult {
  fileName: string;
  success: boolean;
  extractedText?: string;
  extractedLength?: number;
  totalChunks?: number;
  successfulChunks?: number;
  failedChunks?: number;
  retryInfo?: string;
  error?: string;
}

export interface SSEMessage {
  type: 'status' | 'file_start' | 'file_progress' | 'file_complete' | 'complete' | 'error' | 
        'file_error' | 'chunks_prepared' | 'chunk_start' | 'chunk_complete' | 'chunk_error';
  fileName?: string;
  fileIndex?: number;
  totalFiles?: number;
  totalChunks?: number;
  chunkIndex?: number;
  pageRange?: {start: number, end: number};
  pages?: string;
  extractedLength?: number;
  successfulChunks?: number;
  failedChunks?: number;
  success?: boolean;
  message?: string;
  error?: string;
  results?: FileProcessingResult[];
  timestamp: string;
  fileUrl?: string;
}

export interface HealthCheckResponse extends BaseResponse {
  data: {
    status: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    version: string;
    environment: string;
    geminiApiConfigured: boolean;
  };
} 