'use client'

import { useState, useCallback } from 'react'
import { XMarkIcon, DocumentIcon, DocumentTextIcon, PhotoIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline'

type FileWithPreview = {
  file: File
  preview?: string
  id: string
}

type MultiFileUploadProps = {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  label?: string
  buttonText?: string
  disabled?: boolean
  compact?: boolean // Add compact mode for smaller display
}

// Helper function to generate a random id
const generateId = () => Math.random().toString(36).substring(2, 15)

// Helper function to determine file icon based on type
const getFileIcon = (file: File) => {
  const type = file.type
  if (type.startsWith('image/')) {
    return <PhotoIcon className="h-8 w-8 text-gray-400" />
  } else if (type.includes('pdf')) {
    return <DocumentTextIcon className="h-8 w-8 text-gray-400" />
  } else if (type.includes('spreadsheet') || type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
    return <DocumentChartBarIcon className="h-8 w-8 text-gray-400" />
  }
  return <DocumentIcon className="h-8 w-8 text-gray-400" />
}

export default function MultiFileUpload({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 10, 
  accept = ".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,image/*", 
  label = "Upload files",
  buttonText = "Select Files",
  disabled = false,
  compact = false
}: MultiFileUploadProps) {
  const [fileObjects, setFileObjects] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    
    setError(null)
    
    // Check if adding more files would exceed the limit
    if (fileObjects.length + selectedFiles.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} files`)
      return
    }
    
    const newFiles: FileWithPreview[] = []
    
    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the maximum size of ${maxSize}MB`)
        return
      }
      
      const fileWithPreview: FileWithPreview = {
        file,
        id: generateId()
      }
      
      // Create image preview for image files
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      
      newFiles.push(fileWithPreview)
    })
    
    // Update state with new files
    const updatedFiles = [...fileObjects, ...newFiles]
    setFileObjects(updatedFiles)
    
    // Pass the plain File objects to the parent component
    onFilesChange(updatedFiles.map(f => f.file))
  }, [fileObjects, maxFiles, maxSize, onFilesChange])
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])
  
  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])
  
  // Handle removing a file
  const handleRemoveFile = useCallback((idToRemove: string) => {
    // Clean up any object URLs to prevent memory leaks
    const fileToRemove = fileObjects.find(f => f.id === idToRemove)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    
    const updatedFiles = fileObjects.filter(f => f.id !== idToRemove)
    setFileObjects(updatedFiles)
    
    // Pass the updated list to the parent
    onFilesChange(updatedFiles.map(f => f.file))
  }, [fileObjects, onFilesChange])
  
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">{label}</label>}
      
      <div 
        className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? 'border-[#595CFF] bg-blue-50' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          compact ? 'p-3' : 'p-6'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2 w-full">
          {!compact && (
            <>
              <svg 
                className="h-10 w-10 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="text-sm text-gray-500">Drag & drop files here, or</p>
            </>
          )}
          
          <label className={`inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            {buttonText}
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept={accept} 
              disabled={disabled}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>
          
          {!compact && (
            <>
              <p className="text-xs text-gray-500 mt-1">
                Supported files: {accept.replace(/\./g, '').split(',').join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} files, up to {maxSize}MB each
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {fileObjects.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Selected files ({fileObjects.length})</h4>
          <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
            {fileObjects.map((fileObj) => (
              <li key={fileObj.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                <div className="flex items-center flex-1 min-w-0">
                  {fileObj.preview ? (
                    <img 
                      src={fileObj.preview} 
                      alt={fileObj.file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(fileObj.file)
                  )}
                  <div className="ml-3 flex-1 truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{fileObj.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(fileObj.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(fileObj.id)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500"
                  disabled={disabled}
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Remove file</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 