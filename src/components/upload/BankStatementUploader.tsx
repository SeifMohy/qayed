'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';
import { parseBankStatementParseSSE, parseBankStatementStructureSSE } from '@/lib/sse-utils';
import { useApiClient } from '@/lib/apiClient';

type ParsedDocument = {
  fileName: string;
  success: boolean;
  extractedText?: string;
  error?: string;
  fileUrl?: string;
};

type ParseResponse = {
  success: boolean;
  results: ParsedDocument[];
  error?: string;
};

interface BankStatementUploaderProps {
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  triggerProcessing?: boolean;
  compact?: boolean;
}

export default function BankStatementUploader({
  files: externalFiles,
  onFilesChange,
  onProcessingStart,
  onProcessingEnd,
  onSuccess,
  onError,
  triggerProcessing = false,
  compact = false
}: BankStatementUploaderProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<ParsedDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { session } = useAuth();
  const apiClient = useApiClient();

  // Use external files if provided, otherwise use internal files
  const files = externalFiles || internalFiles;
  const setFiles = onFilesChange || setInternalFiles;

  // Handle processing trigger from parent component
  useEffect(() => {
    if (triggerProcessing && files.length > 0) {
      handleProcessing();
    }
  }, [triggerProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // Validate if they're PDFs
      const invalidFiles = selectedFiles.filter(file => !file.type.includes('pdf'));
      if (invalidFiles.length > 0) {
        const errorMsg = `Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`;
        setUploadError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setFiles(selectedFiles);
      setUploadError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);

      // Validate if they're PDFs
      const invalidFiles = droppedFiles.filter(file => !file.type.includes('pdf'));
      if (invalidFiles.length > 0) {
        const errorMsg = `Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`;
        setUploadError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setFiles(droppedFiles);
      setUploadError(null);
    }
  };

  const handleProcessing = async () => {
    if (files.length === 0) {
      setUploadError('Please select at least one PDF file to upload.');
      return;
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      setUploadError('Please sign in to upload bank statements.');
      return;
    }

    // Validate if they're PDFs
    const invalidFiles = files.filter(file => !file.type.includes('pdf'));
    if (invalidFiles.length > 0) {
      setUploadError(`Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      setProcessedDocs([]);
      onProcessingStart?.();

      // Call the unified processing endpoint that handles parsing, structuring, and saving
      console.log('Starting unified bank statement processing...');

              // Step 2: Call the unified Express endpoint that handles everything
        console.log('Calling unified processing endpoint...');
        setIsProcessing(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
        }

                // Prepare form data for the unified endpoint
        const unifiedFormData = new FormData();
        files.forEach(file => {
          unifiedFormData.append('files', file);
        });
        unifiedFormData.append('supabaseUserId', session.user.id);

        // Ensure the backend URL has the correct protocol
        const normalizedBackendUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
        
        // Call the unified endpoint that handles parsing, structuring, and saving
        const response = await fetch(`${normalizedBackendUrl}/api/bank-statements/process-complete`, {
          method: 'POST',
          body: unifiedFormData,
        });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body available');
      }

      let results: any[] = [];
      let accumulatedData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedData += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = accumulatedData.split('\n\n');
        accumulatedData = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Handle different SSE message types
              switch (data.type) {
                case 'status':
                  console.log(`🔄 ${data.message}`);
                  break;
                case 'file_start':
                  console.log(`🔄 Starting ${data.fileName}...`);
                  break;
                case 'chunks_prepared':
                  console.log(`📄 Split ${data.fileName} into ${data.totalChunks} chunks`);
                  break;
                case 'chunk_complete':
                  console.log(`✅ Completed chunk ${data.chunkIndex}/${data.totalChunks} for ${data.fileName}`);
                  break;
                case 'file_complete':
                  console.log(`🎉 Completed ${data.fileName}: ${data.successfulChunks}/${data.totalChunks} chunks successful`);
                  break;
                case 'file_error':
                  console.error(`❌ Error with ${data.fileName}: ${data.error}`);
                  break;
                case 'complete':
                  console.log(`🎉 All processing complete: ${data.message}`);
                  results = data.results || [];
                  break;
                case 'error':
                  throw new Error(data.error || 'Unknown error occurred');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE message:', line);
            }
          }
        }
      }

      // Set processed documents for display
      setProcessedDocs(results);

      // Show success message
      setUploadSuccess(true);
      onSuccess?.();

      // Clear the file input and files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFiles([]);

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error('Error uploading files:', error);
      const errorMsg = error.message || 'An error occurred while processing the files.';
      setUploadError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      onProcessingEnd?.();
    }
  };

  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If compact mode (used in modal), show simplified interface
  if (compact) {
    return (
      <div className="space-y-4">
        {uploadError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            Bank statements processed and saved successfully!
          </div>
        )}

        {processedDocs.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Results:</h4>
            <ul className="space-y-1">
              {processedDocs.map((doc, index) => (
                <li key={index} className="flex items-center text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full ${doc.success ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                  <span className="font-medium">{doc.fileName}</span>
                  <span className={`ml-2 text-xs ${doc.success ? 'text-green-600' : 'text-red-600'}`}>
                    {doc.success ? 'Success' : 'Failed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Upload Interface */}
      <div className="mb-4">
        <div
          className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center ${files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Bank Statements (PDF)
          </label>

          <div className="flex items-center justify-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              multiple
              className="hidden"
              ref={fileInputRef}
              disabled={isUploading || isProcessing}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Select Files
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            or drag and drop PDF files here
          </p>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-gray-700">Selected Files:</p>
              <ul className="mt-2 text-sm text-gray-600">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between py-1">
                    <span>{file.name}</span>
                    <span className="text-gray-400 text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={clearFiles}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Bank statements processed and saved successfully! The data is now available in the system.
          </div>
        )}

        <button
          type="button"
          onClick={handleProcessing}
          disabled={files.length === 0 || isUploading || isProcessing}
          className={`px-4 py-2 rounded-md text-white font-medium ${files.length === 0 || isUploading || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isUploading
            ? 'Extracting Text...'
            : isProcessing
              ? 'Saving to Database...'
              : 'Process Bank Statements'}
        </button>
      </div>

      {processedDocs.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900">Processing Results:</h3>
          <ul className="mt-2 divide-y divide-gray-200">
            {processedDocs.map((doc, index) => (
              <li key={index} className="py-2">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${doc.success ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                  <span className="font-medium">{doc.fileName}</span>
                  <span className={`ml-2 text-xs ${doc.success ? 'text-green-600' : 'text-red-600'}`}>
                    {doc.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {doc.error && <p className="mt-1 text-xs text-red-600">{doc.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Export processing function for external use
export const processBankStatements = async (files: File[], supabaseUserId?: string) => {
  if (files.length === 0) {
    throw new Error('Please select at least one PDF file to upload.');
  }

  if (!supabaseUserId) {
    throw new Error('User authentication required for processing bank statements.');
  }

  // Validate if they're PDFs
  const invalidFiles = files.filter(file => !file.type.includes('pdf'));
  if (invalidFiles.length > 0) {
    throw new Error(`Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`);
  }

  // Note: This function is deprecated - use the unified processing endpoint instead

  // Step 2: Parse text from files (Next.js API)
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  // Use the unified Express endpoint
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
  }

  // Prepare form data for the unified endpoint
  const processFormData = new FormData();
  files.forEach(file => {
    processFormData.append('files', file);
  });
  processFormData.append('supabaseUserId', supabaseUserId);

  // Ensure the backend URL has the correct protocol
  const normalizedBackendUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
  
  // Call the unified endpoint that handles parsing, structuring, and saving
  const response = await fetch(`${normalizedBackendUrl}/api/bank-statements/process-complete`, {
    method: 'POST',
    body: processFormData,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  // Handle SSE stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body available');
  }

  let results: any[] = [];
  let accumulatedData = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    accumulatedData += decoder.decode(value, { stream: true });
    
    // Process complete SSE messages
    const lines = accumulatedData.split('\n\n');
    accumulatedData = lines.pop() || ''; // Keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'complete') {
            results = data.results || [];
            break;
          }
        } catch (parseError) {
          console.warn('Failed to parse SSE message:', line);
        }
      }
    }
  }

  return {
    success: true,
    results: results,
    structureResults: results
  };
}; 