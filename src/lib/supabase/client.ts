
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Get environment variables from Vite - use values from .env file directly as fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

// Validate configuration early and provide useful feedback
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  
  // Show toast only in browser environment
  if (typeof document !== 'undefined') {
    toast({
      title: 'Configuration Error',
      description: 'Supabase connection configuration is missing. Please check console for details.',
      variant: 'destructive',
    });
  }
}

// Create a Supabase client instance
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Mock flag for testing environments
let mockClientEnabled = false;

/**
 * Check if we're using a mock client (for testing)
 */
export function isUsingMockClient(): boolean {
  return mockClientEnabled;
}

/**
 * Test the Supabase connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * Get configuration status 
 */
export function getConfigurationStatus(): { isValid: boolean; errors: string[] | null; isComplete: boolean } {
  const isValid = isSupabaseConfigValid();
  
  const errors = [];
  if (!supabaseUrl) errors.push('Missing required configuration: VITE_SUPABASE_URL');
  if (!supabaseAnonKey) errors.push('Missing required configuration: VITE_SUPABASE_ANON_KEY');
  
  return {
    isValid,
    errors: errors.length > 0 ? errors : null,
    isComplete: isValid
  };
}

/**
 * Get validated config value 
 */
export function getValidatedConfig(key: string): string | undefined {
  return import.meta.env[key];
}

/**
 * Get setup instructions
 */
export function getSetupInstructions(key: string): string | undefined {
  const instructions: Record<string, string> = {
    'VITE_SUPABASE_URL': 'Set VITE_SUPABASE_URL in your .env file to your Supabase project URL',
    'VITE_SUPABASE_ANON_KEY': 'Set VITE_SUPABASE_ANON_KEY in your .env file to your Supabase anon key',
  };
  
  return instructions[key];
}

/**
 * Export a function to check if configuration is valid
 */
export function isSupabaseConfigValid(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}

export default supabase;
