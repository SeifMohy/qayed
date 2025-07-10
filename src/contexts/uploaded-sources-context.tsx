'use client'

import { createContext, useState, useEffect, useContext, ReactNode } from 'react'

// Define a shared key for localStorage
const STORAGE_KEY = 'qayed_app_uploaded_sources';

// Define the context type
type UploadedSourcesContextType = {
  uploadedSources: { [key: string]: boolean };
  setUploadedSources: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  isDataSourceUploaded: (sourceId: string) => boolean;
};

// Create the context
const UploadedSourcesContext = createContext<UploadedSourcesContextType | undefined>(undefined);

// Custom hook for accessing the context
export function useUploadedSources() {
  const context = useContext(UploadedSourcesContext);
  if (context === undefined) {
    throw new Error('useUploadedSources must be used within a UploadedSourcesProvider');
  }
  return context;
}

// Provider component
export function UploadedSourcesProvider({ children }: { children: ReactNode }) {
  // State for tracking uploaded data sources
  const [uploadedSources, setUploadedSources] = useState<{ [key: string]: boolean }>({});
  
  // Load data from localStorage on first render
  useEffect(() => {
    console.log('🔍 Loading data sources from localStorage...');
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('✅ Loaded data sources:', parsedData);
        setUploadedSources(parsedData);
      } catch (e) {
        console.error('❌ Failed to parse stored data:', e);
        // Initialize with empty state if parsing fails
        setUploadedSources({});
      }
    } else {
      console.log('ℹ️ No stored data sources found, initializing empty state');
      setUploadedSources({});
    }
  }, []);
  
  // Save to localStorage whenever uploadedSources changes
  useEffect(() => {
    console.log('💾 Saving data sources to localStorage:', uploadedSources);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedSources));
  }, [uploadedSources]);
  
  // Helper function to check if a data source is uploaded
  const isDataSourceUploaded = (sourceId: string) => {
    const isUploaded = !!uploadedSources[sourceId];
    console.log(`🔍 Checking data source '${sourceId}':`, isUploaded);
    return isUploaded;
  };

  return (
    <UploadedSourcesContext.Provider value={{ uploadedSources, setUploadedSources, isDataSourceUploaded }}>
      {children}
    </UploadedSourcesContext.Provider>
  );
} 