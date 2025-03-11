
/**
 * Supabase Client Singleton
 * 
 * Centralized, type-safe Supabase client instance with proper initialization
 * and configuration validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { getValidatedConfig } from '@/utils/config/configValidator';
import { ensureValidConfiguration } from '@/utils/bootstrap/configBootstrap';
import { ValidationError } from '@/utils/validation/ValidationError';

// Configuration interface for type safety
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Mock client for environments without Supabase configuration
class MockSupabaseClient {
  constructor() {
    console.warn('Using mock Supabase client. Database operations will not work.');
  }

  from() {
    return {
      select: () => ({ data: null, error: new Error('Mock Supabase client') }),
      insert: () => ({ data: null, error: new Error('Mock Supabase client') }),
      update: () => ({ data: null, error: new Error('Mock Supabase client') }),
      delete: () => ({ data: null, error: new Error('Mock Supabase client') }),
      upsert: () => ({ data: null, error: new Error('Mock Supabase client') }),
      limit: () => this.from(),
    };
  }

  rpc() {
    return { data: null, error: new Error('Mock Supabase client') };
  }

  auth = {
    signIn: () => Promise.resolve({ user: null, session: null, error: new Error('Mock Supabase client') }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: null, unsubscribe: () => {} }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  };
}

// Singleton instance
let supabaseInstance: SupabaseClient | MockSupabaseClient | null = null;
let isUsingMockClient = false;

/**
 * Initialize Supabase client with proper validation
 * Requires that application configuration has been validated
 */
function initializeSupabaseClient(): SupabaseClient | MockSupabaseClient {
  try {
    // Check that configuration is valid before proceeding
    ensureValidConfiguration();
    
    // Get configuration values with validation
    const supabaseUrl = getValidatedConfig('VITE_SUPABASE_URL');
    const supabaseAnonKey = getValidatedConfig('VITE_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new ValidationError(
        'Supabase configuration is missing',
        [
          { 
            path: 'VITE_SUPABASE_URL', 
            message: !supabaseUrl ? 'Supabase URL is required' : '', 
            rule: 'required',
            code: 'CONFIG_ERROR' 
          },
          { 
            path: 'VITE_SUPABASE_ANON_KEY', 
            message: !supabaseAnonKey ? 'Supabase anonymous key is required' : '', 
            rule: 'required',
            code: 'CONFIG_ERROR' 
          }
        ],
        'CONFIG_VALIDATION_ERROR',
        500
      );
    }
    
    // Create and return client
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    // Log detailed error for developers
    console.error('[CRITICAL] Failed to initialize Supabase client:', error);
    
    // Show user-friendly error message only in production
    if (import.meta.env.PROD) {
      toast({
        title: 'Configuration Error',
        description: 'The application is not properly configured. Please contact support.',
        variant: 'destructive',
      });
    } else {
      // In development, show more details
      toast({
        title: 'Supabase Configuration Error',
        description: 'Using mock client. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        variant: 'warning',
      });
    }
    
    // Use mock client to prevent application crashes
    isUsingMockClient = true;
    return new MockSupabaseClient();
  }
}

/**
 * Check connection to Supabase is working
 * @returns Promise resolving to true if connection is successful
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (isUsingMockClient) {
    return false;
  }
  
  try {
    // Simple health check query
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

/**
 * Get the Supabase client instance, initializing it if necessary
 * Using this getter pattern ensures proper error handling and validation
 */
export function getSupabase(): SupabaseClient | MockSupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = initializeSupabaseClient();
  }
  return supabaseInstance;
}

/**
 * Reset the Supabase client (primarily for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  isUsingMockClient = false;
}

/**
 * Check if we're using the mock client
 */
export function isUsingMockSupabaseClient(): boolean {
  return isUsingMockClient;
}

// Create and export the singleton instance
// This maintains backward compatibility
export const supabase = getSupabase();

/**
 * Type-safe helper for calling RPC functions
 * 
 * @param functionName Name of the RPC function
 * @param params Parameters to pass to the function
 * @returns Result from the RPC function
 */
export async function callRpc<T = any>(
  functionName: string,
  params: Record<string, any> = {}
): Promise<T> {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) throw error;
    return data as T;
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Creates a strongly-typed RPC caller function
 * 
 * @example
 * // Define a type-safe RPC caller for a specific function
 * const getUserAchievements = createRpcCaller<Achievement[]>('get_user_achievements');
 * 
 * // Use the caller with proper parameter typing
 * const achievements = await getUserAchievements({ user_id_param: userId });
 */
export function createRpcCaller<TResult = any, TParams extends Record<string, any> = Record<string, any>>(
  functionName: string
) {
  return async (params: TParams): Promise<TResult> => {
    return callRpc<TResult>(functionName, params);
  };
}

// Export singleton instance and helpers
export default supabase;
