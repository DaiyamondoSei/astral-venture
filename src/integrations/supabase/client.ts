
import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Configuration validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;
let isMockClient = false;

/**
 * Creates and returns the Supabase client instance
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials missing, using mock client');
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
export function isUsingMockSupabaseClient(): boolean {
  return isMockClient;
}

/**
 * Creates a mock Supabase client for testing/development
 */
function createMockClient(): SupabaseClient<Database> {
  // This is a simplified mock for development purposes
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
    const supabase = getSupabase();
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
    const supabase = getSupabase();
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
    const supabase = getSupabase();
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
  functionName: string,
  params: Record<string, any> = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const supabase = getSupabase();
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
export function createRpcCaller<TParams, TResult>(functionName: string) {
  return (params: TParams) => callRpc<TResult>(functionName, params as Record<string, any>);
}

// Export Supabase client singleton
export const supabase = getSupabase();
