
/**
 * Supabase Client Singleton
 * 
 * Centralized, type-safe Supabase client instance with proper initialization
 * and configuration validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { 
  validateRequiredConfig, 
  getValidatedConfig, 
  validateAppConfig 
} from '@/utils/config/configValidator';

// Application has not been properly configured
let configurationValid = false;

// Configuration interface for type safety
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Initialize Supabase client with proper validation
 * 
 * @throws Error if required configuration is missing
 */
function initializeSupabaseClient(): SupabaseClient {
  try {
    // Run global config validation on first initialization
    if (!configurationValid) {
      configurationValid = validateAppConfig();
      
      if (!configurationValid) {
        throw new Error(
          'Application configuration failed validation. ' +
          'Check console for specific missing or invalid values.'
        );
      }
    }
    
    // Get configuration values with validation
    const config: SupabaseConfig = {
      supabaseUrl: getValidatedConfig('VITE_SUPABASE_URL'),
      supabaseAnonKey: getValidatedConfig('VITE_SUPABASE_ANON_KEY')
    };
    
    // Double-check config has all required values
    validateRequiredConfig(config);
    
    // Create and return client
    return createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (error) {
    // Log detailed error for developers
    console.error('[CRITICAL] Failed to initialize Supabase client:', error);
    
    // Show user-friendly error message
    toast({
      title: 'Configuration Error',
      description: 'The application is not properly configured. Please contact support.',
      variant: 'destructive',
    });
    
    // Re-throw with clear message - this should prevent app from proceeding with invalid config
    throw new Error(
      'Supabase initialization failed: Required configuration missing. ' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in the environment.'
    );
  }
}

/**
 * Check connection to Supabase is working
 * @returns Promise resolving to true if connection is successful
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Simple health check query
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

// Initialize singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance, initializing it if necessary
 * Using this getter pattern ensures proper error handling and validation
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = initializeSupabaseClient();
  }
  return supabaseInstance;
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

/**
 * Increments energy points for a user
 * 
 * @param userId User ID to increment points for
 * @param points Number of points to add
 * @returns New total points
 */
export async function incrementEnergyPoints(
  userId: string,
  points: number
): Promise<number> {
  try {
    // Call the RPC function to increment points
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    if (error) throw error;
    return data as number;
  } catch (error) {
    console.error('Error incrementing energy points:', error);
    throw error;
  }
}

// Export singleton instance and helpers
export default supabase;
