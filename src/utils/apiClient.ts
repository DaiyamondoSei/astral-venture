
import { supabase } from '@/lib/supabaseClient';

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

// Error handling class
export class ApiError extends Error {
  code: string;
  details?: unknown;
  
  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// Generic function to call any edge function with standardized error handling
export async function callEdgeFunction<T, U = unknown>(
  functionName: string, 
  body?: U
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke<ApiResponse<T>>(
      functionName,
      { body }
    );
    
    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw new ApiError(
        `Failed to call ${functionName}: ${error.message}`,
        'client/network-error'
      );
    }
    
    // Check for API error response
    if (data.status === 'error' && data.error) {
      console.error(`API error from ${functionName}:`, data.error);
      throw new ApiError(
        data.error.message,
        data.error.code,
        data.error.details
      );
    }
    
    // Return the data
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle unexpected errors
    console.error(`Unexpected error calling ${functionName}:`, error);
    throw new ApiError(
      `Unexpected error: ${error.message}`,
      'client/unexpected-error'
    );
  }
}

// Type-safe wrapper functions for specific API endpoints
export const api = {
  // AI Assistant
  getAiResponse: (message: string, reflectionId?: string, reflectionContent?: string) => 
    callEdgeFunction<{response: string; insights: any[]}>('ask-assistant', {
      message,
      reflectionId,
      reflectionContent
    }),
    
  // Insights Generator
  generateInsights: (reflections: any[], userId: string) => 
    callEdgeFunction<{insights: any[]}>('generate-insights', {
      reflections,
      userId
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
