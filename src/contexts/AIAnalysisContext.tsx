
/**
 * AI Analysis Context
 * 
 * Provides global access to AI analysis capabilities throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { aiAnalysisService } from '@/utils/ai/AIAnalysisService';
import { ChakraAnalysisResult, PerformanceAnalysisResult } from '@/utils/ai/AIAnalysisService';

interface AIAnalysisContextValue {
  analyzeChakraSystem: ReturnType<typeof useAIAnalysis>['analyzeChakraSystem'];
  analyzePerformanceMetrics: ReturnType<typeof useAIAnalysis>['analyzePerformanceMetrics'];
  hasApiKey: boolean;
  isOnline: boolean;
  isLoading: boolean;
  error: Error | null;
  lastChakraAnalysis: ChakraAnalysisResult | null;
  lastPerformanceAnalysis: PerformanceAnalysisResult | null;
  setApiKey: (key: string) => void;
  clearCache: () => void;
}

// Default context value
const defaultContextValue: AIAnalysisContextValue = {
  analyzeChakraSystem: async () => {
    throw new Error('AIAnalysisContext not initialized');
  },
  analyzePerformanceMetrics: async () => {
    throw new Error('AIAnalysisContext not initialized');
  },
  hasApiKey: false,
  isOnline: true,
  isLoading: false,
  error: null,
  lastChakraAnalysis: null,
  lastPerformanceAnalysis: null,
  setApiKey: () => {},
  clearCache: () => {},
};

const AIAnalysisContext = createContext<AIAnalysisContextValue>(defaultContextValue);

interface AIAnalysisProviderProps {
  children: ReactNode;
  apiKey?: string;
  showToasts?: boolean;
}

export function AIAnalysisProvider({ 
  children, 
  apiKey, 
  showToasts = true
}: AIAnalysisProviderProps) {
  const [currentApiKey, setCurrentApiKey] = useState<string | undefined>(apiKey);
  
  // Initialize AI analysis with options
  const {
    analyzeChakraSystem,
    analyzePerformanceMetrics,
    isLoading,
    error,
    lastChakraAnalysis,
    lastPerformanceAnalysis,
    hasApiKey,
    isOnline,
    clearCache
  } = useAIAnalysis({
    apiKey: currentApiKey,
    showToasts,
    showApiKeyError: true
  });
  
  // Set API key when it changes
  useEffect(() => {
    if (apiKey) {
      setCurrentApiKey(apiKey);
    }
  }, [apiKey]);
  
  // Handle setting API key
  const handleSetApiKey = (key: string) => {
    setCurrentApiKey(key);
    aiAnalysisService.setApiKey(key);
  };
  
  // Create context value
  const contextValue: AIAnalysisContextValue = {
    analyzeChakraSystem,
    analyzePerformanceMetrics,
    hasApiKey,
    isOnline,
    isLoading,
    error,
    lastChakraAnalysis,
    lastPerformanceAnalysis,
    setApiKey: handleSetApiKey,
    clearCache
  };
  
  return (
    <AIAnalysisContext.Provider value={contextValue}>
      {children}
    </AIAnalysisContext.Provider>
  );
}

// Custom hook for using AI analysis context
export function useAIAnalysisContext() {
  const context = useContext(AIAnalysisContext);
  
  if (context === undefined) {
    throw new Error('useAIAnalysisContext must be used within an AIAnalysisProvider');
  }
  
  return context;
}

export default AIAnalysisContext;
