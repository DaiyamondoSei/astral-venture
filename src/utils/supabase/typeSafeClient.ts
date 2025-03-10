
import { supabase } from '@/lib/supabaseClient';
import { ValidationError } from '@/utils/validation/ValidationError';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Type-safe wrapper for Supabase queries
 * @param operation - Query operation to execute
 * @param errorContext - Context for error messages
 */
export async function executeQuery<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  errorContext: string
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      throw new ValidationError(`Database error in ${errorContext}`, {
        field: errorContext,
        details: error.message,
        statusCode: error.code === '42P01' ? 404 : 500,
        originalError: error
      });
    }
    
    if (!data) {
      throw new ValidationError(`No data returned from ${errorContext}`, {
        field: errorContext,
        statusCode: 404
      });
    }
    
    return data;
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err;
    }
    throw new ValidationError(`Unexpected error in ${errorContext}`, {
      field: errorContext,
      originalError: err
    });
  }
}

export const typeSafeSupabase = {
  from: supabase.from.bind(supabase),
  auth: supabase.auth,
  rpc: async <T>(
    fn: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    return executeQuery(
      () => supabase.rpc(fn, params),
      `RPC: ${fn}`
    );
  }
};
