
/**
 * Hook for AI analysis capabilities
 */

import { useState, useCallback } from 'react';
import { aiAnalysisService, AIAnalysisOptions } from '@/utils/ai/AIAnalysisService';

interface UseAIAnalysisOptions extends Partial<AIAnalysisOptions> {
  apiKey?: string;
}

interface UseAIAnalysisState {
  isLoading: boolean;
  error: Error | null;
  lastChakraAnalysis: any | null;
  lastPerformanceAnalysis: any | null;
}

/**
 * Hook for accessing AI analysis capabilities
 */
export function useAIAnalysis(options: UseAIAnalysisOptions = {}) {
  const [state, setState] = useState<UseAIAnalysisState>({
    isLoading: false,
    error: null,
    lastChakraAnalysis: null,
    lastPerformanceAnalysis: null
  });

  // Set the API key if provided
  useCallback(() => {
    if (options.apiKey) {
      aiAnalysisService.setApiKey(options.apiKey);
    }
  }, [options.apiKey]);

  /**
   * Analyze chakra system with AI
   */
  const analyzeChakraSystem = useCallback(async (
    chakraData: {
      activatedChakras: number[];
      emotionalData?: Record<string, number>;
      reflectionContent?: string;
      userHistory?: any;
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await aiAnalysisService.analyzeChakraSystem(chakraData, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        showMetadata: options.showMetadata
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastChakraAnalysis: result 
      }));
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj
      }));
      
      throw errorObj;
    }
  }, [options]);

  /**
   * Analyze performance metrics with AI
   */
  const analyzePerformanceMetrics = useCallback(async (
    metrics: {
      componentRenderTimes: Record<string, number>;
      memoryUsage?: number;
      fps?: number;
      networkRequests?: { url: string; time: number; size: number }[];
      errorRates?: Record<string, number>;
    }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await aiAnalysisService.analyzePerformanceMetrics(metrics, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        showMetadata: options.showMetadata
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastPerformanceAnalysis: result 
      }));
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj
      }));
      
      throw errorObj;
    }
  }, [options]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastChakraAnalysis: null,
      lastPerformanceAnalysis: null
    });
  }, []);

  return {
    ...state,
    analyzeChakraSystem,
    analyzePerformanceMetrics,
    reset,
  };
}

export default useAIAnalysis;
