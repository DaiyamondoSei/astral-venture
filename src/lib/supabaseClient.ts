import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { validateConfig, ConfigRequirement, ConfigValidators } from '@/utils/config/configValidator';

// Define Supabase-specific configuration requirements
const supabaseConfigRequirements: ConfigRequirement[] = [
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    validator: ConfigValidators.isValidUrl,
    description: 'Supabase project URL'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validator: ConfigValidators.isNotEmpty,
    description: 'Supabase anonymous key for client-side operations'
  }
];

// Validate configuration before initializing
const configValidation = validateConfig(supabaseConfigRequirements);
if (!configValidation.isValid) {
  console.error('Supabase configuration validation failed:', configValidation);
}

// Initialize Supabase client with validated config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create instance with additional options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (...args) => {
      // Add request timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      return fetch(...args, { 
        signal: controller.signal 
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

/**
 * Generates a function to call a Supabase RPC function with improved
 * error handling, timeout management, and retry capabilities
 * 
 * @param supabaseClient The Supabase client instance
 * @returns A function to call RPCs safely
 */
export function createRpcCaller(supabaseClient: SupabaseClient) {
  /**
   * Call an RPC function and handle errors
   * 
   * @param functionName Name of the RPC function to call
   * @param params Parameters to pass to the function
   * @param options Additional options for the call
   * @returns The result of the RPC function
   */
  return async function callRpcSafely<T = any>(
    functionName: 
      | 'get_total_points' 
      | 'get_user_achievements' 
      | 'increment_points'
      | 'get_performance_metrics'
      | 'ensure_performance_metrics_table'
      | 'get_web_vitals'
      | 'get_performance_summary',
    params?: Record<string, any>,
    options?: {
      errorHandler?: (error: PostgrestError) => void;
      timeout?: number;
      retryCount?: number;
      retryDelay?: number;
      silent?: boolean;
    }
  ): Promise<T | null> {
    const opts = {
      timeout: 15000, // 15 second default timeout
      retryCount: 0,
      retryDelay: 1000,
      silent: false,
      ...options
    };
    
    let attempts = 0;
    
    while (attempts <= opts.retryCount) {
      attempts++;
      
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
        
        // Call RPC with timeout
        const { data, error } = await Promise.race([
          supabaseClient.rpc(functionName, params || {}),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`RPC call to ${functionName} timed out after ${opts.timeout}ms`)), 
            opts.timeout)
          )
        ]);
        
        // Clean up timeout
        clearTimeout(timeoutId);
        
        if (error) {
          // If a custom error handler is provided, use it
          if (opts.errorHandler) {
            opts.errorHandler(error);
            return null;
          }

          // If we have retries left, retry after delay
          if (attempts <= opts.retryCount) {
            console.log(`Retrying ${functionName} (attempt ${attempts}/${opts.retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
            continue;
          }

          // Otherwise, use default error handling
          console.error(`Error calling ${functionName}:`, error);
          
          if (!opts.silent) {
            toast({
              title: 'Operation failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          
          return null;
        }

        return data as T;
      } catch (error) {
        // If we have retries left, retry after delay
        if (attempts <= opts.retryCount) {
          console.log(`Retrying ${functionName} after error (attempt ${attempts}/${opts.retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
          continue;
        }
        
        console.error(`Error calling ${functionName}:`, error);
        
        if (!opts.silent) {
          toast({
            title: 'Operation failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
        
        return null;
      }
    }
    
    return null;
  };
}

// Create an RPC caller using the default Supabase client
export const callRpc = createRpcCaller(supabase);

/**
 * Ensure required performance metrics tables exist
 */
export async function ensurePerformanceMetricsTable(): Promise<boolean> {
  try {
    const result = await callRpc('ensure_performance_metrics_table', undefined, {
      retryCount: 2,
      silent: true
    });
    return !!result;
  } catch (error) {
    console.error('Error calling ensure_performance_metrics_table:', error);
    return false;
  }
}

/**
 * Get performance metrics from the database
 */
export async function getPerformanceMetrics(
  timeframe: 'day' | 'week' | 'month' = 'day',
  limit = 100
) {
  return callRpc('get_performance_metrics', { timeframe, limit }, { 
    retryCount: 1
  });
}

/**
 * Get web vitals metrics from the database
 */
export async function getWebVitals(
  timeframe: 'day' | 'week' | 'month' = 'day',
  page_url?: string
) {
  return callRpc('get_web_vitals', { timeframe, page_url }, { 
    retryCount: 1 
  });
}

/**
 * Get performance summary from the database
 */
export async function getPerformanceSummary(
  timeframe: 'day' | 'week' | 'month' = 'day'
) {
  return callRpc('get_performance_summary', { timeframe }, { 
    retryCount: 1 
  });
}

/**
 * Increments the user's energy points with improved error handling
 * 
 * @param userId The user ID to increment points for
 * @param points The number of points to add
 * @returns A promise that resolves to the new total after incrementing
 */
export async function incrementEnergyPoints(userId: string, points: number): Promise<number> {
  try {
    // Validate inputs to prevent errors
    if (!userId) throw new Error('User ID is required');
    if (isNaN(points) || points <= 0) throw new Error('Points must be a positive number');
    
    // Make the RPC call with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error('Error incrementing energy points:', error);
      throw error;
    }
    
    // Also record in history table for tracking
    // Use a background pattern that doesn't block the main response
    try {
      await supabase.from('energy_points_history').insert({
        user_id: userId,
        points_added: points,
        new_total: data,
        source: 'activity'
      });
    } catch (historyError) {
      // Log but don't fail if history recording fails
      console.error('Failed to record points history:', historyError);
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error incrementing energy points:', err);
    throw err;
  }
}

/**
 * Check the connection to Supabase
 * Useful for diagnostics and health checks
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    const endTime = Date.now();
    
    console.info(`Supabase connection check completed in ${endTime - startTime}ms`);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist but connection works
      return true;
    }
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check failed with exception:', error);
    return false;
  }
}
