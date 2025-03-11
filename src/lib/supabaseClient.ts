
/**
 * Supabase Client Singleton
 * 
 * Centralized, type-safe Supabase client instance with proper initialization
 * and configuration validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { validateRequiredConfig } from '@/utils/config/configValidator';

// Configuration interface for type safety
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Get configuration with validation
function getValidatedConfig(): SupabaseConfig {
  // Read config from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Validate configuration
  const isValid = validateRequiredConfig({
    supabaseUrl,
    supabaseAnonKey
  });
  
  // Return validated config
  return {
    supabaseUrl: supabaseUrl as string,
    supabaseAnonKey: supabaseAnonKey as string
  };
}

// Create and initialize the client
function initializeSupabaseClient(): SupabaseClient {
  try {
    const config = getValidatedConfig();
    return createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (error) {
    // Log error and show notification
    console.error('Failed to initialize Supabase client:', error);
    
    // Show user-friendly error message
    toast({
      title: 'Configuration Error',
      description: 'The application is not properly configured. Please contact support.',
      variant: 'destructive',
    });
    
    // Throw a more descriptive error
    throw new Error(
      'Supabase initialization failed: Required configuration missing. ' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    );
  }
}

// Create singleton instance
export const supabase = initializeSupabaseClient();

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
