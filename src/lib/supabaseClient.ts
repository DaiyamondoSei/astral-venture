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
    console.warn(
      'Using mock Supabase client because configuration is missing or invalid. ' +
      'Database operations will not work. Check your environment variables: ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  from(table: string) {
    const mockQueryBuilder = this._createMockQueryBuilder();
    return {
      select: () => mockQueryBuilder,
      insert: () => this._createMockResponse(null, new Error('Mock Supabase client')),
      update: () => this._createMockResponse(null, new Error('Mock Supabase client')),
      delete: () => this._createMockResponse(null, new Error('Mock Supabase client')),
      upsert: () => this._createMockResponse(null, new Error('Mock Supabase client')),
    };
  }

  _createMockQueryBuilder() {
    const mockResponse = this._createMockResponse(null, new Error('Mock Supabase client'));
    const mockBuilder: any = {
      eq: () => mockBuilder,
      neq: () => mockBuilder,
      gt: () => mockBuilder,
      gte: () => mockBuilder,
      lt: () => mockBuilder,
      lte: () => mockBuilder,
      like: () => mockBuilder,
      ilike: () => mockBuilder,
      is: () => mockBuilder,
      in: () => mockBuilder,
      contains: () => mockBuilder,
      containedBy: () => mockBuilder,
      rangeGt: () => mockBuilder,
      rangeGte: () => mockBuilder,
      rangeLt: () => mockBuilder,
      rangeLte: () => mockBuilder,
      rangeAdjacent: () => mockBuilder,
      overlaps: () => mockBuilder,
      textSearch: () => mockBuilder,
      match: () => mockBuilder,
      not: () => mockBuilder,
      or: () => mockBuilder,
      filter: () => mockBuilder,
      
      order: () => mockBuilder,
      limit: () => mockBuilder,
      range: () => mockBuilder,
      
      single: () => mockResponse,
      maybeSingle: () => mockResponse,
      then: (onFulfilled: any) => Promise.resolve(onFulfilled(mockResponse)),
    };
    return mockBuilder;
  }

  _createMockResponse(data: any, error: Error | null) {
    return { data, error };
  }

  rpc(functionName: string, params?: Record<string, any>) {
    return this._createMockResponse(null, new Error('Mock Supabase client'));
  }

  auth = {
    signIn: () => Promise.resolve({ user: null, session: null, error: new Error('Mock Supabase client') }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: null, unsubscribe: () => {} }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Mock Supabase client') }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Mock Supabase client') }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  };

  storage = {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Mock Supabase client') }),
      download: () => Promise.resolve({ data: null, error: new Error('Mock Supabase client') }),
      remove: () => Promise.resolve({ data: null, error: new Error('Mock Supabase client') }),
      list: () => Promise.resolve({ data: null, error: new Error('Mock Supabase client') }),
    })
  };

  functions = {
    invoke: () => Promise.resolve({ data: null, error: new Error('Mock Supabase client') }),
  };
}

// Singleton instance
let supabaseInstance: SupabaseClient | MockSupabaseClient | null = null;
let isUsingMockClient = false;
let initializationAttempted = false;

/**
 * Initialize Supabase client with proper validation
 * Requires that application configuration has been validated
 */
function initializeSupabaseClient(): SupabaseClient | MockSupabaseClient {
  // Only attempt initialization once
  if (initializationAttempted) {
    return supabaseInstance || new MockSupabaseClient();
  }
  
  initializationAttempted = true;
  
  try {
    // Check for environment variables availability
    if (typeof import.meta.env === 'undefined' || 
        !import.meta.env.VITE_SUPABASE_URL || 
        !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      
      console.error(
        '[SUPABASE] Environment variables are not available or missing required values. ' +
        'Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your environment.'
      );
      
      // Use mock client until configuration is available
      isUsingMockClient = true;
      return new MockSupabaseClient();
    }
    
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
    const client = createClient(supabaseUrl, supabaseAnonKey);
    isUsingMockClient = false;
    return client;
  } catch (error) {
    // Log detailed error for developers
    console.error('[CRITICAL] Failed to initialize Supabase client:', error);
    
    // Show user-friendly error message
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
        variant: 'destructive',
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
    const { error } = await getSupabase().from('user_profiles').select('id').limit(1);
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
  initializationAttempted = false;
}

/**
 * Check if we're using the mock client
 */
export function isUsingMockSupabaseClient(): boolean {
  return isUsingMockClient;
}

/**
 * Increments energy points for a user
 * 
 * @param userId User ID
 * @param points Number of points to add
 * @returns Promise that resolves to the updated energy points or null on error
 */
export async function incrementEnergyPoints(
  userId: string,
  points: number
): Promise<number | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    const currentPoints = data?.energy_points || 0;
    const newPoints = currentPoints + points;
    
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ energy_points: newPoints })
      .eq('user_id', userId)
      .select('energy_points')
      .single();
    
    if (updateError) throw updateError;
    
    return updateData.energy_points;
  } catch (error) {
    console.error('Failed to increment energy points:', error);
    return null;
  }
}

// Create and export the singleton instance
// This maintains backward compatibility while ensuring delayed initialization
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
    const { data, error } = await getSupabase().rpc(functionName, params);
    
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
