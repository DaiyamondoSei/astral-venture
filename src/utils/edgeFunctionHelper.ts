
import { supabaseClient } from '@/lib/supabaseClient';
import { ValidationError } from './validation/ValidationError';

/**
 * Invokes an edge function with type safety
 * 
 * @param functionName - Name of the edge function to call
 * @param payload - Data to send to the function
 * @returns The function response data
 * @throws ValidationError if the API request fails
 */
export async function invokeEdgeFunction<T = any, P = any>(
  functionName: string,
  payload?: P
): Promise<T> {
  try {
    const { data, error } = await supabaseClient.functions.invoke<T>(functionName, {
      body: payload,
    });

    if (error) {
      throw new ValidationError(`Edge function error: ${error.message}`, {
        statusCode: error.code || 500,
        details: error
      });
    }

    if (!data) {
      throw new ValidationError('Edge function returned no data', {
        statusCode: 500
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`Failed to call edge function: ${functionName}`, {
      statusCode: 500,
      details: { originalError: String(error) }
    });
  }
}

/**
 * Resolves an API error response
 * 
 * @param error - The error from the API
 * @param context - Context information for the error
 * @returns A formatted error message
 */
export function resolveApiError(error: unknown, context: string): string {
  if (error instanceof ValidationError) {
    return error.message;
  } else if (error instanceof Error) {
    return `${context}: ${error.message}`;
  } else if (typeof error === 'string') {
    return `${context}: ${error}`;
  } else {
    return `${context}: An unknown error occurred`;
  }
}

export default {
  invokeEdgeFunction,
  resolveApiError
};
