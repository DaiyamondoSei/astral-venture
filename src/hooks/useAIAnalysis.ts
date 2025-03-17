
/**
 * Hook for AI analysis capabilities that offloads heavy analysis to OpenAI API
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  aiAnalysisService, 
  AIAnalysisOptions, 
  ChakraAnalysisResult,
  PerformanceAnalysisResult
} from '@/utils/ai/AIAnalysisService';
import { useToast } from '@/components/ui/use-toast';

interface UseAIAnalysisOptions extends Partial<AIAnalysisOptions> {
  apiKey?: string;
  showToasts?: boolean;
  showApiKeyError?: boolean;
}

interface UseAIAnalysisState {
  isLoading: boolean;
  error: Error | null;
  lastChakraAnalysis: ChakraAnalysisResult | null;
  lastPerformanceAnalysis: PerformanceAnalysisResult | null;
  hasApiKey: boolean;
  isOnline: boolean;
}

/**
 * Hook for accessing AI analysis capabilities
 * Provides functions to analyze chakra systems and performance metrics
 */
export function useAIAnalysis(options: UseAIAnalysisOptions = {}) {
  const { toast } = useToast();
  const [state, setState] = useState<UseAIAnalysisState>({
    isLoading: false,
    error: null,
    lastChakraAnalysis: null,
    lastPerformanceAnalysis: null,
    hasApiKey: !!aiAnalysisService.canPerformAnalysis(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  });
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isOnline: true }));
        if (options.showToasts) {
          toast({
            title: "Back online",
            description: "AI analysis features are now available",
            variant: "default"
          });
        }
      }
    };
    
    const handleOffline = () => {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isOnline: false }));
        if (options.showToasts) {
          toast({
            title: "You're offline",
            description: "AI analysis will use local fallbacks until you're back online",
            variant: "destructive"
          });
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isMounted.current = false;
    };
  }, [options.showToasts, toast]);

  // Set the API key if provided
  useEffect(() => {
    if (options.apiKey) {
      aiAnalysisService.setApiKey(options.apiKey);
      setState(prev => ({ ...prev, hasApiKey: true }));
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
    },
    analysisOptions?: Partial<AIAnalysisOptions>
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if API key is available
      if (!state.hasApiKey && options.showApiKeyError) {
        throw new Error('API key is required for AI analysis');
      }
      
      const result = await aiAnalysisService.analyzeChakraSystem(chakraData, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        showMetadata: options.showMetadata,
        cacheResults: options.cacheResults,
        cacheTtlMs: options.cacheTtlMs,
        forceRefresh: analysisOptions?.forceRefresh,
        ...analysisOptions
      });
      
      if (isMounted.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          lastChakraAnalysis: result.result 
        }));
      }
      
      // Show toast for cached results if option enabled
      if (options.showToasts && result.metadata?.cached) {
        toast({
          title: "Using cached analysis",
          description: "For fresh results, use the refresh option",
          variant: "default"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in chakra analysis:', error);
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorObj
        }));
      }
      
      if (options.showToasts) {
        toast({
          title: "Analysis Error",
          description: errorObj.message || "Error analyzing chakra system",
          variant: "destructive"
        });
      }
      
      throw errorObj;
    }
  }, [options, state.hasApiKey, toast]);

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
    },
    analysisOptions?: Partial<AIAnalysisOptions>
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if API key is available
      if (!state.hasApiKey && options.showApiKeyError) {
        throw new Error('API key is required for AI analysis');
      }
      
      const result = await aiAnalysisService.analyzePerformanceMetrics(metrics, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        showMetadata: options.showMetadata,
        cacheResults: options.cacheResults,
        cacheTtlMs: options.cacheTtlMs,
        forceRefresh: analysisOptions?.forceRefresh,
        ...analysisOptions
      });
      
      if (isMounted.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          lastPerformanceAnalysis: result.result 
        }));
      }
      
      // Show toast for cached results if option enabled
      if (options.showToasts && result.metadata?.cached) {
        toast({
          title: "Using cached analysis",
          description: "For fresh results, use the refresh option",
          variant: "default"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in performance analysis:', error);
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorObj
        }));
      }
      
      if (options.showToasts) {
        toast({
          title: "Analysis Error",
          description: errorObj.message || "Error analyzing performance metrics",
          variant: "destructive"
        });
      }
      
      throw errorObj;
    }
  }, [options, state.hasApiKey, toast]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastChakraAnalysis: null,
      lastPerformanceAnalysis: null,
      hasApiKey: !!aiAnalysisService.canPerformAnalysis(),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
    });
  }, []);

  /**
   * Clear the analysis cache
   */
  const clearCache = useCallback(() => {
    aiAnalysisService.clearCache();
    if (options.showToasts) {
      toast({
        title: "Cache Cleared",
        description: "AI analysis cache has been cleared",
        variant: "default"
      });
    }
  }, [options.showToasts, toast]);

  return {
    ...state,
    analyzeChakraSystem,
    analyzePerformanceMetrics,
    reset,
    clearCache,
  };
}

export default useAIAnalysis;
