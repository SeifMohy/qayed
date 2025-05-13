import { useState, useCallback } from 'react';
import type { UploadFile } from '../types';

interface UseUploadOptions {
  onSuccess?: (files: UploadFile[]) => void;
  onError?: (error: Error, file?: UploadFile) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export function useUpload(options: UseUploadOptions = {}) {
  const {
    onSuccess,
    onError,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (maxFileSize && file.size > maxFileSize) {
        return {
          valid: false,
          error: `File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB`,
        };
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not supported`,
        };
      }

      return { valid: true };
    },
    [maxFileSize, allowedTypes]
  );

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setIsUploading(true);
      const newFiles: UploadFile[] = [];

      try {
        // Convert FileList to array
        const filesArray = Array.from(fileList);

        // Validate and prepare files
        for (const file of filesArray) {
          const validation = validateFile(file);
          const uploadFile: UploadFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: validation.valid ? 'pending' : 'error',
            error: validation.error,
          };

          newFiles.push(uploadFile);
        }

        setFiles((prev) => [...prev, ...newFiles]);

        // Filter valid files
        const validFiles = newFiles.filter((file) => file.status !== 'error');

        if (validFiles.length === 0) {
          if (onError) {
            onError(new Error('No valid files to upload'));
          }
          return;
        }

        // Simulate upload process for each valid file
        for (const file of validFiles) {
          // Simulate async upload with progress
          await new Promise<void>((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? {
                        ...f,
                        progress,
                        status: progress < 100 ? 'uploading' : 'success',
                      }
                    : f
                )
              );

              if (progress >= 100) {
                clearInterval(interval);
                resolve();
              }
            }, 300);
          });
        }

        if (onSuccess) {
          onSuccess(validFiles);
        }
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        } else if (onError) {
          onError(new Error('An unknown error occurred'));
        }
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, onSuccess, onError]
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const resetFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    isUploading,
    uploadFiles,
    removeFile,
    resetFiles,
  };
} 