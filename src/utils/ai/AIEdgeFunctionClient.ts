
/**
 * AI Edge Function Client
 * 
 * Provides a client for securely communicating with the AI analyzer edge function
 * without exposing API keys in the frontend.
 */

import { supabase } from '@/lib/supabaseUnified';
import { 
  AIAnalysisOptions, 
  AIAnalysisResult,
  ChakraAnalysisResult,
  PerformanceAnalysisResult
} from './AIAnalysisService';

// Function to create a fallback result for local use when edge function calls fail
function createFallbackResult<T>(operation: string, data: any): AIAnalysisResult<T> {
  // Simplified fallback generation
  return {
    result: {} as T,
    confidence: 0.3,
    reasoning: `Fallback generated after edge function error for ${operation}`,
    metadata: {
      processingTime: 0,
      modelUsed: 'fallback',
      tokenUsage: 0,
      cached: false
    }
  };
}

// Main client class
export class AIEdgeFunctionClient {
  private edgeFunctionName = 'ai-analyzer';
  
  /**
   * Check if edge functions are available
   */
  isAvailable(): boolean {
    return !!supabase && typeof supabase.functions?.invoke === 'function';
  }
  
  /**
   * Analyze chakra system using the edge function
   */
  async analyzeChakraSystem(
    data: {
      activatedChakras: number[];
      emotionalData?: Record<string, number>;
      reflectionContent?: string;
      userHistory?: any;
    },
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<ChakraAnalysisResult>> {
    try {
      if (!this.isAvailable()) {
        throw new Error('Supabase Edge Functions not available');
      }
      
      const { data: responseData, error } = await supabase.functions.invoke<AIAnalysisResult<ChakraAnalysisResult>>(
        this.edgeFunctionName,
        {
          body: {
            operation: 'analyzeChakraSystem',
            data,
            options: {
              model: options?.model || 'gpt-4o-mini',
              temperature: options?.temperature || 0.3,
              maxTokens: options?.maxTokens || 1000,
              useCache: options?.cacheResults !== false,
              cacheTtl: options?.cacheTtlMs,
              forceRefresh: options?.forceRefresh
            }
          }
        }
      );
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error calling chakra analysis edge function:', error);
      
      // Return a fallback result on error
      return createFallbackResult<ChakraAnalysisResult>('analyzeChakraSystem', data);
    }
  }
  
  /**
   * Analyze performance metrics using the edge function
   */
  async analyzePerformanceMetrics(
    data: {
      componentRenderTimes: Record<string, number>;
      memoryUsage?: number;
      fps?: number;
      networkRequests?: { url: string; time: number; size: number }[];
      errorRates?: Record<string, number>;
    },
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<PerformanceAnalysisResult>> {
    try {
      if (!this.isAvailable()) {
        throw new Error('Supabase Edge Functions not available');
      }
      
      const { data: responseData, error } = await supabase.functions.invoke<AIAnalysisResult<PerformanceAnalysisResult>>(
        this.edgeFunctionName,
        {
          body: {
            operation: 'analyzePerformanceMetrics',
            data,
            options: {
              model: options?.model || 'gpt-4o-mini',
              temperature: options?.temperature || 0.2,
              maxTokens: options?.maxTokens || 1200,
              useCache: options?.cacheResults !== false,
              cacheTtl: options?.cacheTtlMs,
              forceRefresh: options?.forceRefresh
            }
          }
        }
      );
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error calling performance analysis edge function:', error);
      
      // Return a fallback result on error
      return createFallbackResult<PerformanceAnalysisResult>('analyzePerformanceMetrics', data);
    }
  }
}

// Export a singleton instance
export const aiEdgeClient = new AIEdgeFunctionClient();

export default aiEdgeClient;
