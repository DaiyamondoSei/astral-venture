
/**
 * Result-based Supabase Client
 * 
 * Wraps the Supabase client with Result pattern for type-safe error handling
 */

import { PostgrestError } from '@supabase/supabase-js';
import { Result, success, failure } from '../../utils/result/Result';
import { supabase, getSupabase } from './client';
import { Database } from './types';

/**
 * Typed error for Supabase operations
 */
export interface SupabaseError {
  code: string;
  message: string;
  details?: unknown;
  hint?: string;
  originalError: PostgrestError | Error;
}

/**
 * Convert PostgrestError to SupabaseError
 */
function toSupabaseError(error: PostgrestError | Error | null): SupabaseError {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      originalError: new Error('Unknown error')
    };
  }
  
  if ('code' in error && 'message' in error && 'details' in error) {
    // It's a PostgrestError
    const pgError = error as PostgrestError;
    return {
      code: pgError.code,
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
      originalError: pgError
    };
  }
  
  // It's a regular Error
  return {
    code: 'UNEXPECTED_ERROR',
    message: error.message,
    originalError: error
  };
}

/**
 * Execute a Supabase query and return a Result
 */
export async function executeQuery<T>(
  queryFn: (supabase: typeof supabase) => Promise<{
    data: T | null;
    error: PostgrestError | null;
  }>
): Promise<Result<T, SupabaseError>> {
  try {
    const client = getSupabase();
    const { data, error } = await queryFn(client);
    
    if (error) {
      return failure(toSupabaseError(error));
    }
    
    if (data === null) {
      return failure({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        originalError: new Error('Resource not found')
      });
    }
    
    return success(data);
  } catch (err) {
    return failure(toSupabaseError(err as Error));
  }
}

/**
 * Execute an RPC call and return a Result
 */
export async function callRpcWithResult<T = any>(
  functionName: string,
  params: Record<string, any> = {}
): Promise<Result<T, SupabaseError>> {
  try {
    const client = getSupabase();
    const { data, error } = await client.rpc(functionName, params);
    
    if (error) {
      return failure(toSupabaseError(error));
    }
    
    return success(data as T);
  } catch (err) {
    return failure(toSupabaseError(err as Error));
  }
}

/**
 * Type-safe wrapper for incrementing energy points
 */
export async function incrementEnergyPointsWithResult(
  userId: string,
  points: number
): Promise<Result<number, SupabaseError>> {
  if (!userId) {
    return failure({
      code: 'INVALID_PARAMETER',
      message: 'User ID is required',
      originalError: new Error('User ID is required')
    });
  }
  
  try {
    const client = getSupabase();
    const { data, error } = await client.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    if (error) {
      return failure(toSupabaseError(error));
    }
    
    return success(data as number);
  } catch (err) {
    return failure(toSupabaseError(err as Error));
  }
}

/**
 * Create a type-safe RPC caller that returns a Result
 */
export function createRpcCallerWithResult<TParams, TResult>(functionName: string) {
  return (params: TParams) => callRpcWithResult<TResult>(functionName, params as Record<string, any>);
}

/**
 * Execute an auth operation and return a Result
 */
export async function executeAuthOperation<T>(
  operation: (supabase: typeof supabase) => Promise<{
    data: { [key: string]: any } | null;
    error: Error | null;
  }>
): Promise<Result<T, SupabaseError>> {
  try {
    const client = getSupabase();
    const { data, error } = await operation(client);
    
    if (error) {
      return failure(toSupabaseError(error));
    }
    
    if (!data) {
      return failure({
        code: 'AUTH_ERROR',
        message: 'Authentication operation failed',
        originalError: new Error('Authentication operation failed')
      });
    }
    
    return success(data as T);
  } catch (err) {
    return failure(toSupabaseError(err as Error));
  }
}
