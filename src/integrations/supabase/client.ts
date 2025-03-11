/**
 * Supabase Integration Client
 * 
 * This file provides a robust, type-safe Supabase client with proper error handling
 * and configuration validation.
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { getValidatedConfig } from '@/utils/config/configValidator';
import { ensureValidConfiguration } from '@/utils/bootstrap/configBootstrap';
import { ValidationError } from '@/utils/validation/ValidationError';
import { Result, success, failure } from '@/utils/result/Result';

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

  // Create a mock query builder with all common methods
  _createMockQueryBuilder() {
    const mockResponse = this._createMockResponse(null, new Error('Mock Supabase client'));
    const mockBuilder: any = {
      // Filters
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
      
      // Modifiers
      order: () => mockBuilder,
      limit: () => mockBuilder,
      range: () => mockBuilder,
      
      // Execution methods
      single: () => mockResponse,
      maybeSingle: () => mockResponse,
      then: (onFulfilled: any) => Promise.resolve(onFulfilled(mockResponse)),
    };
    return mockBuilder;
  }

  // Create a consistent mock response structure
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

/**
 * Initialize Supabase client with proper validation
 * Requires that application configuration has been validated
 */
function initializeSupabaseClient(): Result<SupabaseClient | MockSupabaseClient, ValidationError> {
  try {
    // Check that configuration is valid before proceeding
    ensureValidConfiguration();
    
    // Get configuration values with validation
    const supabaseUrl = getValidatedConfig('VITE_SUPABASE_URL');
    const supabaseAnonKey = getValidatedConfig('VITE_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const validationDetails = [
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
      ].filter(detail => detail.message);
      
      return failure(new ValidationError(
        'Supabase configuration is missing',
        validationDetails,
        'CONFIG_VALIDATION_ERROR',
        500
      ));
    }
    
    // Create and return client
    return success(createClient(supabaseUrl, supabaseAnonKey));
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
        variant: 'destructive',
      });
    }
    
    // Use mock client to prevent application crashes
    isUsingMockClient = true;
    return success(new MockSupabaseClient());
  }
}

/**
 * Check connection to Supabase is working
 * @returns Promise resolving to true if connection is successful
 */
export async function checkSupabaseConnection(): Promise<Result<boolean, Error>> {
  if (isUsingMockClient) {
    return success(false);
  }
  
  try {
    // Simple health check query
    const client = getSupabase();
    if (client instanceof MockSupabaseClient) {
      return success(false);
    }
    
    const { error } = await client.from('user_profiles').select('id').limit(1);
    return success(!error);
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return failure(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Get the Supabase client instance, initializing it if necessary
 * Using this getter pattern ensures proper error handling and validation
 */
export function getSupabase(): SupabaseClient | MockSupabaseClient {
  if (!supabaseInstance) {
    const result = initializeSupabaseClient();
    if (result.type === 'success') {
      supabaseInstance = result.value;
    } else {
      console.error('Failed to initialize Supabase client:', result.error);
      isUsingMockClient = true;
      supabaseInstance = new MockSupabaseClient();
    }
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

/**
 * Type-safe wrapper for database queries that properly handles errors
 * and maintains type information throughout the promise chain
 */
export async function executeQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: PostgrestError | null; }>
): Promise<Result<T, PostgrestError | Error>> {
  try {
    const client = getSupabase();
    
    if (client instanceof MockSupabaseClient) {
      return failure(new Error('Using mock Supabase client. Database operations will not work.'));
    }
    
    const { data, error } = await queryFn(client);
    
    if (error) {
      return failure(error);
    }
    
    if (data === null) {
      return failure(new Error('No data returned from query'));
    }
    
    return success(data);
  } catch (err) {
    console.error('Error executing Supabase query:', err);
    return failure(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Increments energy points for a user with proper error handling and type safety
 * 
 * @param userId User ID
 * @param points Number of points to add
 * @returns Promise that resolves to a Result containing the updated energy points or an error
 */
export async function incrementEnergyPoints(
  userId: string,
  points: number
): Promise<Result<number, Error>> {
  return executeQuery(async (supabase) => {
    // First get current points
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    const currentPoints = profileData?.energy_points || 0;
    const newPoints = currentPoints + points;
    
    // Update points
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ energy_points: newPoints })
      .eq('user_id', userId)
      .select('energy_points')
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    return { data: updateData.energy_points, error: null };
  });
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
): Promise<Result<T, Error>> {
  try {
    const client = getSupabase();
    
    if (client instanceof MockSupabaseClient) {
      return failure(new Error('Using mock Supabase client. RPC calls will not work.'));
    }
    
    const { data, error } = await client.rpc(functionName, params);
    
    if (error) {
      return failure(error);
    }
    
    return success(data as T);
  } catch (error) {
    console.error(`Error calling RPC function ${functionName}:`, error);
    return failure(error instanceof Error ? error : new Error(String(error)));
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
 * const achievementsResult = await getUserAchievements({ user_id_param: userId });
 */
export function createRpcCaller<TResult = any, TParams extends Record<string, any> = Record<string, any>>(
  functionName: string
) {
  return async (params: TParams): Promise<Result<TResult, Error>> => {
    return callRpc<TResult>(functionName, params);
  };
}

// Re-export everything for consistent imports
export {
  getSupabase,
  resetSupabaseClient,
  isUsingMockSupabaseClient,
  checkSupabaseConnection,
  callRpc,
  createRpcCaller,
  incrementEnergyPoints,
  executeQuery
};

/**
 * The singleton Supabase client instance
 * 
 * This is properly initialized with validation and error handling.
 * Always use this instance for database operations to maintain
 * consistent error handling and connection management.
 */
export const supabase = getSupabase();

export default supabase;
