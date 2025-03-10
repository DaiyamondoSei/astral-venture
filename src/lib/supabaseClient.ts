
/**
 * Centralized Supabase client
 * 
 * This provides a single source of truth for the Supabase client instance
 * throughout the application. It ensures consistent access patterns and
 * error handling.
 */

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

/**
 * Legacy compatability note:
 * 
 * The application currently uses two separate Supabase client imports:
 * 1. From '@/lib/supabaseClient' (this file)
 * 2. From '@/integrations/supabase/client'
 * 
 * In the future, we should consolidate to a single import path.
 * This file is the recommended path moving forward.
 */
