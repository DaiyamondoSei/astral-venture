
/**
 * Supabase Client - Centralized and robust client initialization
 * 
 * This module provides a reliable, type-safe Supabase client with:
 * - Robust initialization with retry mechanism
 * - Proper environment variable validation
 * - Graceful fallback to mock client when needed
 * - Clear developer feedback
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { Database } from '../integrations/supabase/types';

// Configuration validation constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // ms
const ENV_CHECK_DELAY = 50; // ms

// Singleton instance management
let supabaseInstance: SupabaseClient<Database> | null = null;
let isMockClient = false;
let initializationAttempted = false;
let initializationPromise: Promise<SupabaseClient<Database>> | null = null;

/**
 * Mock Supabase client for development and fallback
 * This prevents crashes when configuration is missing
 */
class MockSupabaseClient {
  constructor() {
    const message = 'Using mock Supabase client because configuration is missing or invalid. ' +
      'Database operations will not work. Check your environment variables: ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    
    console.warn(message);
    
    // Only show toast in development
    if (import.meta.env.DEV) {
      toast({
        title: 'Mock Supabase Client Active',
        description: 'Using mock client because configuration is missing. Check the console for details.',
        variant: 'warning',
        duration: 6000
      });
    }
  }

  // Implement basic mock methods
  from() {
    return this._createMockQueryBuilder();
  }

  _createMockQueryBuilder() {
    const mockResponse = { data: null, error: new Error('Mock Supabase client') };
    
    // Create a chainable mock query builder
    const mockBuilder: any = {
      select: () => mockBuilder,
      insert: () => mockBuilder,
      update: () => mockBuilder,
      delete: () => mockBuilder,
      eq: () => mockBuilder,
      neq: () => mockBuilder,
      in: () => mockBuilder,
      contains: () => mockBuilder,
      order: () => mockBuilder,
      limit: () => mockBuilder,
      single: () => mockResponse,
      maybeSingle: () => mockResponse,
      then: (cb: any) => Promise.resolve(cb(mockResponse))
    };
    
    return mockBuilder;
  }

  // Mock auth methods
  auth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Mock Supabase client - auth not available') 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Mock Supabase client - auth not available') 
    }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: null, unsubscribe: () => {} })
  };

  // Mock storage methods
  storage = {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: new Error('Mock storage client') }),
      download: () => Promise.resolve({ data: null, error: new Error('Mock storage client') })
    })
  };

  // Mock RPC calls
  rpc(functionName: string) {
    console.warn(`Mock RPC call to ${functionName}`);
    return Promise.resolve({ data: null, error: new Error('Mock Supabase client - RPC not available') });
  }
}

/**
 * Get environment variable with validation and helpful error messages
 */
function getEnvVar(key: string): string | null {
  const value = import.meta.env[key];
  
  if (!value) {
    if (import.meta.env.DEV) {
      console.warn(`Missing environment variable: ${key}`);
      console.info(`Add ${key} to your .env file or environment variables`);
    }
    return null;
  }
  
  return value;
}

/**
 * Validate Supabase configuration
 * @returns True if configuration is valid
 */
function validateSupabaseConfig(): { isValid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
  
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  return { 
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Create a new Supabase client with retries
 */
async function createSupabaseClient(retryCount = 0): Promise<SupabaseClient<Database>> {
  try {
    // Small delay to ensure environment variables are loaded
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, ENV_CHECK_DELAY * retryCount));
    }
    
    const { isValid, missingVars } = validateSupabaseConfig();
    
    if (!isValid) {
      // If we have retries left, try again after a delay
      if (retryCount < MAX_RETRIES) {
        console.info(`Retrying Supabase initialization (${retryCount + 1}/${MAX_RETRIES})...`);
        return await createSupabaseClient(retryCount + 1);
      }
      
      // Log detailed error in development
      if (import.meta.env.DEV) {
        console.error(`Failed to initialize Supabase after ${MAX_RETRIES} retries.`);
        console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        console.error('Make sure these variables are defined in your .env file or environment.');
      }
      
      throw new Error(`Missing required Supabase configuration: ${missingVars.join(', ')}`);
    }
    
    // We have valid config, create the client
    const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')!;
    const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')!;
    
    return createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

/**
 * Initialize the Supabase client with proper error handling
 */
async function initializeSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      initializationAttempted = true;
      const client = await createSupabaseClient();
      supabaseInstance = client;
      isMockClient = false;
      console.info('Supabase client initialized successfully');
      return client;
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      
      // Use mock client instead of crashing
      const mockClient = new MockSupabaseClient() as unknown as SupabaseClient<Database>;
      supabaseInstance = mockClient;
      isMockClient = true;
      
      // In production, show a more generic error
      if (import.meta.env.PROD) {
        toast({
          title: 'Connection Error',
          description: 'Could not connect to the database. Some features may not work.',
          variant: 'destructive',
        });
      }
      
      return mockClient;
    }
  })();
  
  return initializationPromise;
}

/**
 * Get the Supabase client singleton, initializing it if necessary
 * This is the main entry point for getting a Supabase client
 */
export async function getSupabase(): Promise<SupabaseClient<Database>> {
  if (!supabaseInstance || !initializationAttempted) {
    return await initializeSupabaseClient();
  }
  
  return supabaseInstance;
}

/**
 * Get the Supabase client synchronously
 * Warning: This may return a mock client if initialization is not complete
 */
export function getSupabaseSync(): SupabaseClient<Database> {
  if (!supabaseInstance && !initializationAttempted) {
    // Start async initialization
    initializeSupabaseClient().catch(error => {
      console.error('Background Supabase initialization failed:', error);
    });
    
    // Return mock client while we wait
    const mockClient = new MockSupabaseClient() as unknown as SupabaseClient<Database>;
    isMockClient = true;
    return mockClient;
  }
  
  return supabaseInstance!;
}

/**
 * Check if the current client is a mock client
 */
export function isUsingMockClient(): boolean {
  return isMockClient;
}

/**
 * Reset the Supabase client (for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  isMockClient = false;
  initializationAttempted = false;
  initializationPromise = null;
}

/**
 * Test the Supabase connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getSupabase();
    const { error } = await client.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Export the default client instance for convenience
export const supabase = getSupabaseSync();
