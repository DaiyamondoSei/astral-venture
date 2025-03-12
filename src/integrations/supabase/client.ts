
/**
 * Supabase Client Integration
 * 
 * This file provides a centralized Supabase client that is properly initialized
 * and handles configuration errors gracefully.
 */

import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
import { getSupabase as getMainSupabase, isUsingMockSupabaseClient } from '@/lib/supabaseClient';

// Configuration validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if configuration is missing
if (!SUPABASE_URL) {
  console.warn('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;
let isMockClient = false;

/**
 * Creates and returns the Supabase client instance
 * This is a wrapper around the main Supabase client singleton
 */
export async function getSupabase(): Promise<SupabaseClient<Database>> {
  if (!supabaseInstance) {
    // Use the main supabase client helper to get a properly initialized client
    const mainClient = await getMainSupabase();
    
    // Check if we're using a mock client
    isMockClient = isUsingMockSupabaseClient();
    
    // Cast the client to the correct type
    supabaseInstance = mainClient as SupabaseClient<Database>;
  }
  
  return supabaseInstance;
}

/**
 * Get the Supabase client synchronously
 * Warning: This may return a mock client if initialization is not complete
 */
export function getSupabaseSync(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    // If not initialized, create a new instance
    // This is a fallback and might be a mock client
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials missing in synchronous call, using mock client');
      supabaseInstance = createMockClient();
      isMockClient = true;
    } else {
      supabaseInstance = createClient<Database>(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    }
    
    // Start the async initialization in the background
    getSupabase().catch(err => {
      console.error('Error initializing Supabase client:', err);
    });
  }
  
  return supabaseInstance;
}

/**
 * Reset the Supabase client (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  isMockClient = false;
}

/**
 * Checks if we're using a mock client
 */
export function isUsingMockClient(): boolean {
  return isMockClient;
}

/**
 * Creates a mock Supabase client for testing/development
 */
function createMockClient(): SupabaseClient<Database> {
  // Return a mock client that logs warnings but doesn't throw errors
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        }),
        single: () => ({
          data: null,
          error: null
        })
      }),
      insert: () => ({
        select: () => ({
          data: [],
          error: null
        })
      }),
      update: () => ({
        eq: () => ({
          data: [],
          error: null
        }),
        select: () => ({
          data: [],
          error: null
        })
      }),
      delete: () => ({
        eq: () => ({
          data: [],
          error: null
        })
      })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    rpc: (name: string) => ({
      data: null,
      error: null
    })
  } as unknown as SupabaseClient<Database>;
}

/**
 * Checks if the Supabase connection is working
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
