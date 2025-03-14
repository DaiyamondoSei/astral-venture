
/**
 * Unified Supabase Client
 * 
 * This is a centralized client that resolves conflicts between multiple
 * Supabase initializations. It serves as a drop-in replacement for any
 * existing Supabase client imports.
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Track if we've already shown a warning to prevent duplicate UI messages
let hasShownConfigWarning = false;

// Create consistent instance tracking to prevent duplicate client warnings
let clientInstance: any = null;

/**
 * Get environment variables with proper fallbacks
 */
function getEnvironmentConfig() {
  // Get environment variables from Vite with safe fallbacks
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing or incomplete. Using fallback values.');
    
    // Show a toast only once to avoid spamming the user
    if (!hasShownConfigWarning && typeof document !== 'undefined') {
      toast.warning('Using fallback Supabase configuration', {
        description: 'Some features may not work as expected',
        duration: 5000,
      });
      hasShownConfigWarning = true;
    }
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Get the singleton Supabase client instance
 */
function getSupabaseClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvironmentConfig();
  
  // Create a new client with the configuration
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  console.log('Supabase client initialized (unified)');
  return clientInstance;
}

// Create and export the unified client instance
export const supabase = getSupabaseClient();

// Export configuration helpers
export function isSupabaseConfigValid(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentConfig();
  return !!supabaseUrl && !!supabaseAnonKey;
}

export function getConfigurationStatus(): { 
  isValid: boolean; 
  errors: string[] | null; 
  isComplete: boolean;
} {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentConfig();
  
  const errors = [];
  if (!supabaseUrl) errors.push('Missing required configuration: VITE_SUPABASE_URL');
  if (!supabaseAnonKey) errors.push('Missing required configuration: VITE_SUPABASE_ANON_KEY');
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    isComplete: errors.length === 0
  };
}

// Export as default as well for flexibility
export default supabase;
