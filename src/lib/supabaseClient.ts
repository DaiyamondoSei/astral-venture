
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Initialize the Supabase client with the project URL and anonymous key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

// Create a single instance of the Supabase client
const supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'cosmic-app-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export the singleton instance
export const supabase = supabaseInstance;

// Add alias for backward compatibility
export const supabaseClient = supabase;
