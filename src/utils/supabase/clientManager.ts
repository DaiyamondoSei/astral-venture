
/**
 * Centralized Supabase client manager
 * Provides a single source of truth for Supabase clients 
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

// Configuration variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

// Client instances
let publicClient: SupabaseClient<Database> | null = null;
let authClient: SupabaseClient<Database> | null = null;

/**
 * Get the public Supabase client
 * This client is for unauthenticated operations
 */
export function getPublicClient(): SupabaseClient<Database> {
  if (!publicClient) {
    publicClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return publicClient;
}

/**
 * Get the authenticated Supabase client
 * This client is for authenticated operations with auth state persistence
 */
export function getAuthClient(): SupabaseClient<Database> {
  if (!authClient) {
    authClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        storageKey: 'cosmic-app-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return authClient;
}

/**
 * Reset clients (useful for testing)
 */
export function resetClients(): void {
  publicClient = null;
  authClient = null;
}

/**
 * Error handling wrapper for database operations
 */
export async function safeQueryHandler<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = 'Database operation failed'
): Promise<T | null> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Supabase error:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in Supabase operation:', err);
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
    return null;
  }
}

// For backward compatibility, export the auth client as default
export const supabase = getAuthClient();
export default supabase;
