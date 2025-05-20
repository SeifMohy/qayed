'use client';

import { useState, useEffect } from 'react';

export default function BankStatementViewer() {
  const [parsedFiles, setParsedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  
  // Load parsed files from session storage on component mount
  useEffect(() => {
    const filesJson = sessionStorage.getItem('bankstatement_files');
    if (filesJson) {
      try {
        const files = JSON.parse(filesJson) as string[];
        setParsedFiles(files);
        
        // Auto-select the first file if available
        if (files.length > 0 && !selectedFile) {
          setSelectedFile(files[0]);
          const content = sessionStorage.getItem(`bankstatement_${files[0]}`);
          setFileContent(content);
        }
      } catch (error) {
        console.error('Error parsing stored files:', error);
      }
    }
  }, []);
  
  // Load file content when a file is selected
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    const content = sessionStorage.getItem(`bankstatement_${fileName}`);
    setFileContent(content);
  };
  
  // Clear all stored bank statements
  const clearAllFiles = () => {
    if (confirm('Are you sure you want to clear all parsed bank statements?')) {
      // Remove all bank statement items from session storage
      parsedFiles.forEach(fileName => {
        sessionStorage.removeItem(`bankstatement_${fileName}`);
      });
      sessionStorage.removeItem('bankstatement_files');
      
      // Reset state
      setParsedFiles([]);
      setSelectedFile(null);
      setFileContent(null);
    }
  };
  
  if (parsedFiles.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No parsed bank statements found in storage.</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload bank statements on the upload page to see them here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex border-b">
        {/* File list sidebar */}
        <div className="w-64 border-r bg-gray-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Parsed Statements</h3>
            <button
              onClick={clearAllFiles}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear All
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {parsedFiles.map((fileName) => (
              <button
                key={fileName}
                className={`w-full text-left p-3 text-sm truncate hover:bg-gray-100 ${
                  selectedFile === fileName 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-700'
                }`}
                onClick={() => handleFileSelect(fileName)}
              >
                {fileName}
              </button>
            ))}
          </div>
        </div>
        
        {/* File content */}
        <div className="flex-1 p-6">
          {selectedFile ? (
            <>
              <div className="mb-4 pb-2 border-b">
                <h2 className="text-xl font-semibold text-gray-800">{selectedFile}</h2>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap" style={{ maxHeight: '65vh' }}>
                {fileContent ? (
                  <pre className="text-sm text-gray-700 font-mono">{fileContent}</pre>
                ) : (
                  <p className="text-gray-500 italic">No content available for this file.</p>
                )}
              </div>
              
              <div className="mt-4 text-right">
                <button
                  onClick={() => {
                    if (fileContent) {
                      navigator.clipboard.writeText(fileContent);
                      alert('Content copied to clipboard!');
                    }
                  }}
                  disabled={!fileContent}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Copy to Clipboard
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400">Select a file to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 