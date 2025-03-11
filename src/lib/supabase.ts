
/**
 * Supabase Client Module
 * 
 * This file provides Supabase client instance with proper error handling
 * and configuration validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getValidatedConfig } from '@/utils/config/configValidator';

// Create a singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

// Flag to track if we're using a mock client for tests
let usingMockClient = false;

/**
 * Get the Supabase URL from environment configuration
 * @returns The validated Supabase URL
 */
function getSupabaseUrl(): string {
  const supabaseUrl = getValidatedConfig('VITE_SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('Supabase URL is required but not configured. Set VITE_SUPABASE_URL in your environment.');
  }
  return supabaseUrl;
}

/**
 * Get the Supabase anonymous key from environment configuration
 * @returns The validated Supabase anonymous key
 */
function getSupabaseAnonKey(): string {
  const supabaseAnonKey = getValidatedConfig('VITE_SUPABASE_ANON_KEY');
  if (!supabaseAnonKey) {
    throw new Error('Supabase anonymous key is required but not configured. Set VITE_SUPABASE_ANON_KEY in your environment.');
  }
  return supabaseAnonKey;
}

/**
 * Initialize and return the Supabase client
 * @returns A properly configured Supabase client
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    try {
      const supabaseUrl = getSupabaseUrl();
      const supabaseAnonKey = getSupabaseAnonKey();
      
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        }
      });
      
      console.log('Supabase client initialized');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw error;
    }
  }
  
  return supabaseInstance;
}

/**
 * Reset the Supabase client (primarily for testing)
 * @param mockClient Optional mock client to use instead
 */
export function resetSupabaseClient(mockClient?: SupabaseClient): void {
  if (mockClient) {
    supabaseInstance = mockClient;
    usingMockClient = true;
    console.log('Using mock Supabase client');
  } else {
    supabaseInstance = null;
    usingMockClient = false;
    console.log('Supabase client reset');
  }
}

/**
 * Check if we're using a mock Supabase client
 * @returns True if using a mock client
 */
export function isUsingMockSupabaseClient(): boolean {
  return usingMockClient;
}

/**
 * Check if the Supabase connection is working
 * @returns Promise resolving to connection status
 */
export async function checkSupabaseConnection(): Promise<{ isConnected: boolean; error?: string }> {
  try {
    const client = getSupabase();
    const { data, error } = await client.from('user_profiles').select('id').limit(1);
    
    if (error) {
      return { 
        isConnected: false, 
        error: `Database connection error: ${error.message}` 
      };
    }
    
    return { isConnected: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      isConnected: false, 
      error: `Supabase client error: ${errorMessage}` 
    };
  }
}

/**
 * Call a Supabase stored procedure (RPC)
 * @param procedureName The name of the procedure to call
 * @param params Parameters to pass to the procedure
 * @returns Promise with the RPC result
 */
export async function callRpc<T = any>(
  procedureName: string, 
  params?: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const client = getSupabase();
    const { data, error } = await client.rpc(procedureName, params || {});
    
    if (error) {
      console.error(`RPC ${procedureName} failed:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`RPC ${procedureName} exception:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

/**
 * Create a function to call a specific RPC with proper typing
 * @param procedureName The name of the procedure
 * @returns A function that calls the specified RPC
 */
export function createRpcCaller<T = any, P = Record<string, any>>(
  procedureName: string
): (params?: P) => Promise<{ data: T | null; error: Error | null }> {
  return (params?: P) => callRpc<T>(procedureName, params as Record<string, any>);
}

/**
 * Increment a user's energy points
 * @param userId The user ID
 * @param pointsToAdd Number of points to add
 * @returns Promise with the updated total points
 */
export async function incrementEnergyPoints(
  userId: string, 
  pointsToAdd: number
): Promise<{ totalPoints: number | null; error: Error | null }> {
  const { data, error } = await callRpc<number>('increment_points', {
    row_id: userId,
    points_to_add: pointsToAdd
  });
  
  return {
    totalPoints: data,
    error
  };
}

// Initialize the client
export const supabase = getSupabase();

export default supabase;
