
/**
 * AI Processing Service
 * 
 * This service provides a type-safe interface for AI processing operations
 * using the Supabase Edge Function infrastructure.
 */

import { supabase } from '@/lib/supabaseClient';
import { createFallbackResponse } from './fallback';
import { AIResponse, AIServiceOptions, EmotionalAnalysisResult } from './types';
import { toast } from '@/components/ui/use-toast';

// Default options for AI service requests
const defaultOptions: AIServiceOptions = {
  useCache: true,
  showLoadingToast: false,
  showErrorToast: true,
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
};

/**
 * Get a response from the AI system
 * 
 * @param query - The user's question or prompt
 * @param options - Configuration options for the request
 * @returns Promise with AI response
 */
export async function getAIResponse(
  query: string,
  options: Partial<AIServiceOptions> = {}
): Promise<AIResponse> {
  const opts = { ...defaultOptions, ...options };
  let loadingToast: string | number | undefined;
  
  try {
    // Show loading toast if enabled
    if (opts.showLoadingToast) {
      loadingToast = toast({
        title: "Processing your request",
        description: "Our AI is thinking about your question...",
      });
    }
    
    // Track start time for performance metrics
    const startTime = performance.now();
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-processor-enhanced', {
      body: {
        action: 'query',
        query,
        model: opts.model,
        temperature: opts.temperature,
        maxTokens: opts.maxTokens,
        useCache: opts.useCache,
      },
    });
    
    // Calculate processing time
    const processingTime = performance.now() - startTime;
    
    // Dismiss loading toast if it was shown
    if (loadingToast !== undefined) {
      toast.dismiss(loadingToast);
    }
    
    // Handle errors
    if (error) {
      console.error('AI processing error:', error);
      
      if (opts.showErrorToast) {
        toast({
          title: "Error processing request",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
      
      return createFallbackResponse(query);
    }
    
    // Format response
    const responseData = data.data;
    
    return {
      answer: responseData.result,
      type: 'text',
      suggestedPractices: [], // Would be populated by more sophisticated analysis
      meta: {
        model: opts.model,
        tokenUsage: 0, // Not available from this endpoint
        processingTime: responseData.processingTime || processingTime,
        cached: responseData.cached || false,
      }
    };
  } catch (error) {
    console.error('AI service error:', error);
    
    // Dismiss loading toast if it was shown
    if (loadingToast !== undefined) {
      toast.dismiss(loadingToast);
    }
    
    // Show error toast if enabled
    if (opts.showErrorToast) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
    
    // Return fallback response
    return createFallbackResponse(query);
  }
}

/**
 * Analyze reflection content for emotional insights
 * 
 * @param reflectionContent - The user's reflection entry text
 * @param options - Configuration options for the request
 * @returns Promise with analysis results
 */
export async function analyzeReflection(
  reflectionContent: string,
  options: Partial<AIServiceOptions> = {}
): Promise<EmotionalAnalysisResult> {
  const opts = { ...defaultOptions, ...options };
  let loadingToast: string | number | undefined;
  
  try {
    // Show loading toast if enabled
    if (opts.showLoadingToast) {
      loadingToast = toast({
        title: "Analyzing your reflection",
        description: "Processing your insights...",
      });
    }
    
    // Get the current user ID if logged in
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-processor-enhanced', {
      body: {
        action: 'analyze_reflection',
        reflectionContent,
        userId,
        useCache: opts.useCache,
      },
    });
    
    // Dismiss loading toast if it was shown
    if (loadingToast !== undefined) {
      toast.dismiss(loadingToast);
    }
    
    // Handle errors
    if (error) {
      console.error('Reflection analysis error:', error);
      
      if (opts.showErrorToast) {
        toast({
          title: "Error analyzing reflection",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
      
      // Return empty analysis
      return {
        emotions: [],
        chakras: [],
        insights: [],
        recommendedPractices: [],
        rawAnalysis: "Analysis unavailable",
      };
    }
    
    // Format response
    const responseData = data.data.result;
    
    // For now, just return the raw analysis
    // In a real implementation, we would parse the AI response into structured data
    return {
      emotions: [],
      chakras: [],
      insights: [],
      recommendedPractices: [],
      rawAnalysis: responseData.analysisResult || "No analysis available",
    };
  } catch (error) {
    console.error('Reflection analysis service error:', error);
    
    // Dismiss loading toast if it was shown
    if (loadingToast !== undefined) {
      toast.dismiss(loadingToast);
    }
    
    // Show error toast if enabled
    if (opts.showErrorToast) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
    
    // Return empty analysis
    return {
      emotions: [],
      chakras: [],
      insights: [],
      recommendedPractices: [],
      rawAnalysis: "Analysis unavailable due to an error",
    };
  }
}

/**
 * Create a wrapper for AI processing service with default options
 * 
 * @param defaultOpts - Default options to apply to all requests
 * @returns Object with service methods preconfigured with options
 */
export function createAIService(defaultOpts: Partial<AIServiceOptions> = {}) {
  return {
    getResponse: (query: string, options: Partial<AIServiceOptions> = {}) => 
      getAIResponse(query, { ...defaultOpts, ...options }),
      
    analyzeReflection: (content: string, options: Partial<AIServiceOptions> = {}) => 
      analyzeReflection(content, { ...defaultOpts, ...options }),
  };
}

export default {
  getAIResponse,
  analyzeReflection,
  createAIService,
};
