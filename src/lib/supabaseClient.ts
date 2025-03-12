/**
 * Supabase Client Singleton
 *
 * Centralized, type-safe Supabase client instance with proper initialization
 * and configuration validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getValidatedConfig } from '@/utils/config/configValidator';
import { ValidationError } from '@/utils/validation/ValidationError';
import { ValidationSeverity } from '@/types/core';

// Configuration interface for type safety
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Singleton instance
let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client with proper validation
 */
function initializeSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = getValidatedConfig('VITE_SUPABASE_URL');
  const supabaseAnonKey = getValidatedConfig('VITE_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are missing. Check environment variables.');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

// Initialize Supabase on import
initializeSupabaseClient();

// Export initialized Supabase client
export { supabase };
