import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generates a function to call a Supabase RPC function
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
   * @param errorHandler Optional custom error handler
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
    errorHandler?: (error: PostgrestError) => void
  ): Promise<T | null> {
    try {
      const { data, error } = await supabaseClient.rpc(functionName, params || {});

      if (error) {
        // If a custom error handler is provided, use it
        if (errorHandler) {
          errorHandler(error);
          return null;
        }

        // Otherwise, use default error handling
        console.error(`Error calling ${functionName}:`, error);
        toast({
          title: 'Operation failed',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      return data as T;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      toast({
        title: 'Operation failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    }
  };
}

// Create an RPC caller using the default Supabase client
export const callRpc = createRpcCaller(supabase);

/**
 * Ensure required performance metrics tables exist
 */
export async function ensurePerformanceMetricsTable(): Promise<boolean> {
  try {
    const result = await callRpc('ensure_performance_metrics_table');
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
  return callRpc('get_performance_metrics', { timeframe, limit });
}

/**
 * Get web vitals metrics from the database
 */
export async function getWebVitals(
  timeframe: 'day' | 'week' | 'month' = 'day',
  page_url?: string
) {
  return callRpc('get_web_vitals', { timeframe, page_url });
}

/**
 * Get performance summary from the database
 */
export async function getPerformanceSummary(
  timeframe: 'day' | 'week' | 'month' = 'day'
) {
  return callRpc('get_performance_summary', { timeframe });
}
