
/**
 * Supabase Client - Robust and reliable client initialization with better error handling
 */
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { metricsCollector } from '@/utils/performance/collectors/MetricsCollector';

// Get environment variables with fallbacks to ensure the client always initializes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

// Track initialization status
let hasWarnedAboutConfig = false;
let hasInitializedClient = false;

// Validate configuration and provide useful feedback
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  
  hasWarnedAboutConfig = true;
  
  // Show toast only in browser environment
  if (typeof document !== 'undefined') {
    toast({
      title: "Configuration Warning",
      description: "Using fallback Supabase configuration. Some features may be limited.",
      variant: "destructive"
    });
  }
}

// Create fetch wrapper with instrumentation and timeouts
const instrumentedFetch = (...args: Parameters<typeof fetch>): Promise<Response> => {
  const [url, options] = args;
  const startTime = performance.now();
  
  // Track the request start
  if (typeof url === 'string') {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    metricsCollector.collect('apiRequest', 0, 'network', { path, method: options?.method || 'GET', status: 'started' });
  }
  
  return new Promise((resolve, reject) => {
    // Set up abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      const error = new Error('Request timeout');
      metricsCollector.collect('apiRequestTimeout', performance.now() - startTime, 'network');
      reject(error);
    }, 10000); // 10 second timeout
    
    // Make the actual fetch request
    fetch(url, {
      ...options,
      signal: controller.signal
    })
      .then(response => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track the completed request
        if (typeof url === 'string') {
          const urlObj = new URL(url, window.location.origin);
          const path = urlObj.pathname;
          metricsCollector.collect('apiRequestComplete', duration, 'network', {
            path, 
            method: options?.method || 'GET', 
            status: response.status,
            ok: response.ok
          });
        }
        
        resolve(response);
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track the failed request
        if (typeof url === 'string') {
          const urlObj = new URL(url, window.location.origin);
          const path = urlObj.pathname;
          metricsCollector.collect('apiRequestError', duration, 'network', {
            path, 
            method: options?.method || 'GET', 
            error: error.message
          });
        }
        
        reject(error);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
};

// Create Supabase client with enhanced options
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: instrumentedFetch
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

hasInitializedClient = true;

// Test connection and cache result
let connectionValid: boolean | null = null;

/**
 * Check if Supabase connection is valid
 */
export async function testConnection(): Promise<boolean> {
  if (connectionValid !== null) return connectionValid;
  
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    connectionValid = !error;
    return connectionValid;
  } catch (error) {
    console.error('Connection test failed:', error);
    connectionValid = false;
    return false;
  }
}

/**
 * Check if Supabase configuration is valid
 */
export function isSupabaseConfigValid(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}

/**
 * Get configuration status with detailed information
 */
export function getConfigurationStatus(): { 
  isValid: boolean; 
  errors: string[] | null; 
  isComplete: boolean;
  hasWarned: boolean;
  isInitialized: boolean;
} {
  const isValid = isSupabaseConfigValid();
  
  const errors = [];
  if (!supabaseUrl) errors.push('Missing required configuration: VITE_SUPABASE_URL');
  if (!supabaseAnonKey) errors.push('Missing required configuration: VITE_SUPABASE_ANON_KEY');
  
  return {
    isValid,
    errors: errors.length > 0 ? errors : null,
    isComplete: isValid,
    hasWarned: hasWarnedAboutConfig,
    isInitialized: hasInitializedClient
  };
}

/**
 * Get setup instructions for a specific configuration key
 */
export function getSetupInstructions(key: string): string | undefined {
  const instructions: Record<string, string> = {
    'VITE_SUPABASE_URL': 'Set VITE_SUPABASE_URL in your .env file to your Supabase project URL',
    'VITE_SUPABASE_ANON_KEY': 'Set VITE_SUPABASE_ANON_KEY in your .env file to your Supabase anon key',
  };
  
  return instructions[key];
}

export default supabase;
