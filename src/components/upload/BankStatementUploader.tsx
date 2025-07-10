'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadBankStatementFile } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { parseBankStatementParseSSE, parseBankStatementStructureSSE } from '@/lib/sse-utils';

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
      
      // Step 1: Upload files to Supabase Storage
      console.log('Uploading files to Supabase Storage...');
      const uploadedFiles: { file: File; fileUrl: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1} of ${files.length}: ${file.name}`);
        
        try {
          const fileUrl = await uploadBankStatementFile(file, file.name);
          uploadedFiles.push({ file, fileUrl });
          console.log(`Uploaded ${file.name} to Supabase: ${fileUrl}`);
        } catch (uploadError: any) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
      }
      
      // Step 2: Parse text from uploaded files (using original files)
      console.log('Extracting text from documents...');
      
      // Create form data
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Send request to API to parse text
      const response = await fetch('/api/parse-bankstatement', {
        method: 'POST',
        body: formData,
      });
      
      // Handle SSE stream with utility function
      const result = await parseBankStatementParseSSE(response);
      
      // Merge file URLs with parsing results
      const resultsWithUrls = result.results.map((parseResult: any, index: number) => ({
        ...parseResult,
        fileUrl: uploadedFiles[index]?.fileUrl
      }));
      
      setProcessedDocs(resultsWithUrls);
      
      // Step 3: Structure and save to database (now with file URLs and user ID)
      console.log('Structuring and saving to database...');
      setIsProcessing(true);
      
      const successful = resultsWithUrls.filter((doc: any) => doc.success && doc.extractedText);
      
      if (successful.length === 0) {
        throw new Error('No documents were successfully parsed.');
      }
      
      // Process each document sequentially to avoid overwhelming the server
      const results = [];
      for (const doc of successful) {
        try {
          const structureResponse = await fetch('/api/structure-bankstatement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              statementText: doc.extractedText,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl, // Include the Supabase file URL
              supabaseUserId: session.user.id // Include the user's ID for company scoping
            }),
          });
          
          // Handle SSE stream with utility function
          const structureResult = await parseBankStatementStructureSSE(structureResponse);
          
          if (!structureResult.success) {
            console.error(`Failed to structure document ${doc.fileName}:`, structureResult.error);
            results.push({ fileName: doc.fileName, success: false, error: structureResult.error });
          } else {
            console.log(`Structured and saved ${doc.fileName} successfully`);
            results.push({ fileName: doc.fileName, success: true });
          }
          
          // Add a small delay between processing documents to avoid rate limits
          if (successful.indexOf(doc) < successful.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
          
        } catch (structureError: any) {
          console.error(`Error processing ${doc.fileName}:`, structureError);
          results.push({ fileName: doc.fileName, success: false, error: structureError.message });
        }
      }
      
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
          className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center ${
            files.length > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
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
          className={`px-4 py-2 rounded-md text-white font-medium ${
            files.length === 0 || isUploading || isProcessing
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
  
  // Step 1: Upload files to Supabase Storage
  const uploadedFiles: { file: File; fileUrl: string }[] = [];
  
  for (const file of files) {
    try {
      const fileUrl = await uploadBankStatementFile(file, file.name);
      uploadedFiles.push({ file, fileUrl });
    } catch (uploadError: any) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }
  }
  
  // Step 2: Parse text from files
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // Send request to API to parse text
  const response = await fetch('/api/parse-bankstatement', {
    method: 'POST',
    body: formData,
  });
  
  // Handle SSE stream with utility function
  const result = await parseBankStatementParseSSE(response);
  
  // Merge file URLs with parsing results
  const resultsWithUrls = result.results.map((parseResult: any, index: number) => ({
    ...parseResult,
    fileUrl: uploadedFiles[index]?.fileUrl
  }));

  // Step 3: Structure and save to database
  const successful = resultsWithUrls.filter((doc: any) => doc.success && doc.extractedText);
  
  if (successful.length === 0) {
    throw new Error('No documents were successfully parsed.');
  }
  
  // Process each document sequentially to avoid overwhelming the server
  const results = [];
  for (const doc of successful) {
    try {
      const structureResponse = await fetch('/api/structure-bankstatement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statementText: doc.extractedText,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          supabaseUserId: supabaseUserId // Include the user's ID for company scoping
        }),
      });
      
      // Handle SSE stream with utility function
      const structureResult = await parseBankStatementStructureSSE(structureResponse);
      
      if (!structureResult.success) {
        console.error(`Failed to structure document ${doc.fileName}:`, structureResult.error);
        results.push({ fileName: doc.fileName, success: false, error: structureResult.error });
      } else {
        console.log(`Structured and saved ${doc.fileName} successfully`);
        results.push({ fileName: doc.fileName, success: true });
      }
      
      // Add a small delay between processing documents to avoid rate limits
      if (successful.indexOf(doc) < successful.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
      
    } catch (structureError: any) {
      console.error(`Error processing ${doc.fileName}:`, structureError);
      results.push({ fileName: doc.fileName, success: false, error: structureError.message });
    }
  }
  
  return {
    ...result,
    results: resultsWithUrls,
    structureResults: results
  };
}; 