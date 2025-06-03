import { useContext } from 'react';
import { UploadedSourcesContext } from '@/app/dashboard/layout';

// Custom hook for accessing the context
export function useUploadedSources() {
  const context = useContext(UploadedSourcesContext);
  if (context === undefined) {
    throw new Error('useUploadedSources must be used within a UploadedSourcesProvider');
  }
  return context;
} 