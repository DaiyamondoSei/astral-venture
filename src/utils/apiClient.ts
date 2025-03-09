
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { withRetry, RetryOptions } from './apiClient/retryStrategy';
import { AIQuestion, AIQuestionOptions, AIResponse } from '@/services/ai/types';

// Define standardized API response types
type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    processingTime?: number;
    version?: string;
  };
};

// Error handling class with improved type safety and recovery information
export class ApiError extends Error {
  code: string;
  details?: unknown;
  isRetryable: boolean;
  
  constructor(
    message: string, 
    code: string, 
    details?: unknown, 
    isRetryable = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.isRetryable = isRetryable;
  }
}

// Default retry options for edge functions
const defaultEdgeFunctionRetryOptions: Partial<RetryOptions> = {
  maxRetries: 2,
  initialDelay: 800,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryNetworkErrors: true,
  shouldRetry: (error) => {
    // Retry on network errors and server errors, but not on client errors
    if (error instanceof ApiError) {
      return (
        error.isRetryable || 
        error.code.startsWith('server/') || 
        error.code === 'client/network-error'
      );
    }
    return false;
  },
  onRetry: (error, attempt, delay) => {
    console.warn(`API call retry attempt ${attempt} after ${delay}ms due to:`, error);
  }
};

/**
 * Generic function to call any edge function with standardized error handling and retries
 * @param functionName Edge function name
 * @param body Request body
 * @param retryOptions Custom retry options
 * @returns Typed response data
 */
export async function callEdgeFunction<T, U = unknown>(
  functionName: string, 
  body?: U,
  retryOptions: Partial<RetryOptions> = {}
): Promise<T> {
  const options = { ...defaultEdgeFunctionRetryOptions, ...retryOptions };
  
  try {
    // Track request start time for metrics
    const startTime = performance.now();
    
    // Call the function with retry mechanism
    const result = await withRetry(async () => {
      const { data, error } = await supabase.functions.invoke<ApiResponse<T>>(
        functionName,
        { body }
      );
      
      if (error) {
        const isNetworkError = error.message.includes('fetch') || 
                              error.message.includes('network') ||
                              error.message.includes('connection');
                              
        throw new ApiError(
          `Failed to call ${functionName}: ${error.message}`,
          isNetworkError ? 'client/network-error' : 'client/invoke-error',
          error,
          isNetworkError // Network errors are retryable
        );
      }
      
      // Check for API error response
      if (data.status === 'error' && data.error) {
        const isRetryable = 
          data.error.code.startsWith('server/') || 
          data.error.code === 'server/service-unavailable' ||
          data.error.code === 'server/timeout';
          
        throw new ApiError(
          data.error.message,
          data.error.code,
          data.error.details,
          isRetryable
        );
      }
      
      return data.data as T;
    }, options);
    
    // Calculate processing time
    const processingTime = performance.now() - startTime;
    console.log(`Edge function ${functionName} took ${processingTime.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      // Specific error handling for different error types
      if (error.code === 'client/network-error') {
        toast({
          title: "Connection issue",
          description: "Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else if (error.code === 'auth/unauthorized') {
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive"
        });
      } else if (error.code === 'quota/exceeded') {
        toast({
          title: "Service limits reached",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
      
      throw error;
    }
    
    // Handle unexpected errors
    console.error(`Unexpected error calling ${functionName}:`, error);
    throw new ApiError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      'client/unexpected-error'
    );
  }
}

// Type-safe wrapper functions for specific API endpoints with improved error handling
export const api = {
  // AI Assistant
  getAiResponse: (message: string, reflectionId?: string, reflectionContent?: string, options?: AIQuestionOptions) => 
    callEdgeFunction<{response: string; insights: any[]}>('ask-assistant', {
      message,
      reflectionId,
      reflectionContent,
      options
    }),
    
  // AI Assistant extended
  askAIAssistant: (question: AIQuestion, options?: AIQuestionOptions) => 
    callEdgeFunction<AIResponse>('ask-assistant', {
      ...question,
      cacheKey: options?.cacheKey
    }, {
      maxRetries: 2,
      initialDelay: 1000
    }),
    
  // Insights Generator
  generateInsights: (reflections: any[], userId: string) => 
    callEdgeFunction<{insights: any[]}>('generate-insights', {
      reflections,
      userId
    }, {
      // Custom retry options for this specific function
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 8000,
      backoffFactor: 2.5
    }),
  
  // Session Management - can be expanded in future
  refreshSession: () => 
    callEdgeFunction<{token: string; expiresAt: number}>('refresh-session'),
    
  // User Management - can be expanded in future
  getUserData: (userId: string) => 
    callEdgeFunction<{profile: any; permissions: string[]}>('get-user-data', {
      userId
    })
};
