
/**
 * Edge Function Helper
 * 
 * Utility functions for interacting with Supabase Edge Functions
 */

import { supabase } from '@/lib/supabaseClient';
import { ValidationError } from './validation/ValidationError';

/**
 * Invoke a Supabase Edge Function with error handling
 * 
 * @param functionName Name of the Edge Function to invoke
 * @param payload Data to send to the function
 * @returns Response data from the function
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  payload?: Record<string, any>
): Promise<T> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      throw new ValidationError(
        `Error invoking ${functionName}: ${error.message}`,
        [{ path: 'edgeFunction', message: error.message }]
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof Error) {
      throw new ValidationError(
        `Network error when invoking ${functionName}: ${error.message}`,
        [{ path: 'network', message: error.message }]
      );
    }

    // Handle unknown errors
    throw new ValidationError(
      `Unknown error when invoking ${functionName}`,
      [{ path: 'unknown', message: String(error) }]
    );
  }
}

/**
 * Type alias for edge function response
 */
export type EdgeFunctionResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

export default {
  invokeEdgeFunction
};
