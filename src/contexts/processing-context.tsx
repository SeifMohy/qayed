'use client'

import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ProcessingContextType {
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  processingId: string | null;
  setProcessingId: (val: string | null) => void;
  processingMessage: string | null;
  setProcessingMessage: (val: string | null) => void;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  return (
    <ProcessingContext.Provider value={{
      isProcessing,
      setIsProcessing,
      processingId,
      setProcessingId,
      processingMessage,
      setProcessingMessage
    }}>
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
} 