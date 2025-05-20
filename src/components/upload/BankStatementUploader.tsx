'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type ParsedDocument = {
  fileName: string;
  success: boolean;
  extractedText?: string;
  error?: string;
};

type ParseResponse = {
  success: boolean;
  results: ParsedDocument[];
  error?: string;
};

export default function BankStatementUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validate if they're PDFs
      const invalidFiles = selectedFiles.filter(file => !file.type.includes('pdf'));
      if (invalidFiles.length > 0) {
        setUploadError(`Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`);
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
        setUploadError(`Some files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      setFiles(droppedFiles);
      setUploadError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setUploadError('Please select at least one PDF file to upload.');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      
      // Create form data
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Send request to API
      const response = await fetch('/api/parse-bankstatement', {
        method: 'POST',
        body: formData,
      });
      
      // Parse response
      const result: ParseResponse = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process the bank statements.');
      }
      
      // Store results in session storage
      result.results.forEach(doc => {
        if (doc.success && doc.extractedText) {
          // Store each document in session storage
          sessionStorage.setItem(`bankstatement_${doc.fileName}`, doc.extractedText);
        }
      });
      
      // Store file names for reference
      const successfulFiles = result.results
        .filter(doc => doc.success)
        .map(doc => doc.fileName);
      
      sessionStorage.setItem('bankstatement_files', JSON.stringify(successfulFiles));
      
      // Show success message
      setUploadSuccess(true);
      
      // Clear the file input
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
      setUploadError(error.message || 'An error occurred while processing the files.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Bank Statement Parser</h2>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="mb-8">
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
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
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
            Bank statements processed successfully! The extracted text has been saved.
          </div>
        )}
        
        <button
          type="submit"
          disabled={files.length === 0 || isUploading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            files.length === 0 || isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Processing...' : 'Process Bank Statements'}
        </button>
      </form>
    </div>
  );
} 