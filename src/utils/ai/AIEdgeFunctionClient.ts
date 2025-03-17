
/**
 * AI Edge Function Client
 * 
 * Provides a client for securely communicating with the AI analyzer edge function
 * without exposing API keys in the frontend.
 */

import { supabase } from '@/lib/supabaseUnified';
import { AI_CONFIG } from '@/config/aiConfig';
import { 
  AIAnalysisOptions, 
  AIAnalysisResult,
  ChakraAnalysisResult,
  PerformanceAnalysisResult
} from './AIAnalysisService';
import { GeometryPattern, VisualProcessingOptions } from './VisualProcessingService';

// Interface for content analysis results
export interface ContentAnalysisResult {
  insights: string[];
  themes: string[];
  emotionalTone: string;
  chakraConnections: Array<{
    chakraId: number;
    relevance: number;
    insight: string;
  }>;
  recommendedPractices?: string[];
  confidence: number;
}

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
  private edgeFunctionName = AI_CONFIG.edgeFunctions.aiProcessor || 'ai-processor-enhanced';
  
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
  
  /**
   * Generate sacred geometry pattern (Phase 2)
   */
  async generateGeometryPattern(
    data: {
      seed: string;
      complexity: number;
      chakraAssociations: number[];
    },
    options?: VisualProcessingOptions
  ): Promise<AIAnalysisResult<GeometryPattern>> {
    try {
      if (!this.isAvailable()) {
        throw new Error('Supabase Edge Functions not available');
      }
      
      const edgeFunction = AI_CONFIG.edgeFunctions.generateGeometry || 'generate-geometry';
      
      const { data: responseData, error } = await supabase.functions.invoke<AIAnalysisResult<GeometryPattern>>(
        edgeFunction,
        {
          body: {
            seed: data.seed,
            complexity: data.complexity,
            chakraAssociations: data.chakraAssociations,
            options: {
              model: options?.model || AI_CONFIG.models.DEFAULT,
              temperature: options?.temperature || AI_CONFIG.analysisDefaults.visual.temperature,
              maxTokens: options?.maxTokens || AI_CONFIG.analysisDefaults.visual.maxTokens,
              useCache: options?.cacheResults !== false,
              cacheTtl: options?.cacheTtlMs || AI_CONFIG.analysisDefaults.visual.cacheTtlMs
            }
          }
        }
      );
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error calling geometry generation edge function:', error);
      
      // Return a fallback result on error
      return createFallbackResult<GeometryPattern>('generateGeometryPattern', data);
    }
  }
  
  /**
   * Analyze content (Phase 3)
   */
  async analyzeContent(
    data: {
      text: string;
      contentType: 'reflection' | 'dream' | 'journal' | 'general';
      userContext?: any;
    },
    options?: AIAnalysisOptions
  ): Promise<AIAnalysisResult<ContentAnalysisResult>> {
    try {
      if (!this.isAvailable()) {
        throw new Error('Supabase Edge Functions not available');
      }
      
      const edgeFunction = AI_CONFIG.edgeFunctions.analyzeContent || 'analyze-content';
      
      const { data: responseData, error } = await supabase.functions.invoke<AIAnalysisResult<ContentAnalysisResult>>(
        edgeFunction,
        {
          body: {
            text: data.text,
            contentType: data.contentType,
            userContext: data.userContext,
            options: {
              model: options?.model || AI_CONFIG.models.ENHANCED,
              temperature: options?.temperature || AI_CONFIG.analysisDefaults.content.temperature,
              maxTokens: options?.maxTokens || AI_CONFIG.analysisDefaults.content.maxTokens,
              useCache: options?.cacheResults !== false,
              cacheTtl: options?.cacheTtlMs || AI_CONFIG.analysisDefaults.content.cacheTtlMs,
              streaming: options?.streaming || AI_CONFIG.features.enableStreaming
            }
          }
        }
      );
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error calling content analysis edge function:', error);
      
      // Return a fallback result on error
      return createFallbackResult<ContentAnalysisResult>('analyzeContent', data);
    }
  }
}

// Export a singleton instance
export const aiEdgeClient = new AIEdgeFunctionClient();

export default aiEdgeClient;
