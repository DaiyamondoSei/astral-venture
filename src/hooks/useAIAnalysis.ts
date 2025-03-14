
/**
 * Hook for AI analysis capabilities
 */

import { useState, useCallback } from 'react';
import { AIResponse, EmotionalAnalysisResult, AIServiceOptions } from '@/services/ai/types';
import { getAIResponse, analyzeReflection } from '@/services/ai/aiProcessingService';

interface AIAnalysisState {
  /** Loading state for the current request */
  isLoading: boolean;
  /** Error state for the current request */
  error: Error | null;
  /** Last AI text response */
  lastResponse: AIResponse | null;
  /** Last emotional analysis result */
  lastAnalysis: EmotionalAnalysisResult | null;
}

interface AIAnalysisOptions extends Partial<AIServiceOptions> {
  /** Clear previous results on new request */
  clearPrevious?: boolean;
}

/**
 * Hook for accessing AI analysis capabilities
 */
export function useAIAnalysis(defaultOptions: Partial<AIServiceOptions> = {}) {
  const [state, setState] = useState<AIAnalysisState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    lastAnalysis: null,
  });

  /**
   * Ask a question to the AI assistant
   */
  const askQuestion = useCallback(async (
    question: string,
    options: AIAnalysisOptions = {}
  ) => {
    const { clearPrevious = false, ...serviceOptions } = options;
    
    try {
      // Update loading state
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        ...(clearPrevious ? { lastResponse: null } : {}),
      }));
      
      // Call AI service
      const response = await getAIResponse(question, {
        ...defaultOptions,
        ...serviceOptions,
        showLoadingToast: false, // We'll handle loading state ourselves
      });
      
      // Update state with response
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: response,
      }));
      
      return response;
    } catch (error) {
      // Handle errors
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      
      throw errorObj;
    }
  }, [defaultOptions]);

  /**
   * Analyze a reflection entry
   */
  const analyzeReflectionEntry = useCallback(async (
    reflectionText: string,
    options: AIAnalysisOptions = {}
  ) => {
    const { clearPrevious = false, ...serviceOptions } = options;
    
    try {
      // Update loading state
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        ...(clearPrevious ? { lastAnalysis: null } : {}),
      }));
      
      // Call analysis service
      const analysis = await analyzeReflection(reflectionText, {
        ...defaultOptions,
        ...serviceOptions,
        showLoadingToast: false, // We'll handle loading state ourselves
      });
      
      // Update state with analysis
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastAnalysis: analysis,
      }));
      
      return analysis;
    } catch (error) {
      // Handle errors
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      
      throw errorObj;
    }
  }, [defaultOptions]);

  /**
   * Reset the AI analysis state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastResponse: null,
      lastAnalysis: null,
    });
  }, []);

  return {
    ...state,
    askQuestion,
    analyzeReflectionEntry,
    reset,
  };
}

export default useAIAnalysis;
