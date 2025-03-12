
/**
 * Supabase Client Integration
 * 
 * This file provides a centralized Supabase client that is properly initialized
 * and handles configuration errors gracefully.
 */

import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
import { 
  getSupabase, 
  getSupabaseSync, 
  isUsingMockClient 
} from '@/lib/supabase/client';

// Export the public client functions
export {
  getSupabase,
  getSupabaseSync,
  isUsingMockClient
};

/**
 * Check Supabase connection
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

/**
 * Execute a database query with standard error handling
 */
export async function executeQuery<T>(
  queryFn: (supabase: SupabaseClient<Database>) => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await queryFn(supabase);
    
    if (error) {
      console.error('Database query error:', error);
      return { data: null, error: new Error(error.message) };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error during query execution:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)) 
    };
  }
}

/**
 * Increment user energy points
 */
export async function incrementEnergyPoints(
  userId: string, 
  points: number
): Promise<{ success: boolean; error: Error | null }> {
  if (!userId) {
    return { success: false, error: new Error('User ID is required') };
  }
  
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    if (error) {
      console.error('Error incrementing points:', error);
      return { success: false, error: new Error(error.message) };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error incrementing points:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error(String(err)) 
    };
  }
}

/**
 * Call a database function (RPC)
 */
export async function callRpc<T = any>(
  functionName: "get_total_points" | "get_user_achievements" | "increment_points",
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`RPC call to ${functionName} failed:`, error);
      return { data: null, error: new Error(error.message) };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error(`Unexpected error calling ${functionName}:`, err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error(String(err)) 
    };
  }
}

/**
 * Creates a typed RPC caller for a specific function
 */
export function createRpcCaller<TParams, TResult>(
  functionName: "get_total_points" | "get_user_achievements" | "increment_points"
) {
  return (params: TParams) => callRpc<TResult>(functionName, params as Record<string, any>);
}

// Export Supabase client singleton
export const supabase = getSupabaseSync();
