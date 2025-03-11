
/**
 * Supabase Integration Client
 * 
 * This file provides a robust, type-safe Supabase client with proper error handling
 * and configuration validation.
 */

import {
  supabase as supabaseInstance,
  getSupabase,
  resetSupabaseClient,
  isUsingMockSupabaseClient,
  checkSupabaseConnection,
  callRpc,
  createRpcCaller,
  incrementEnergyPoints
} from '@/lib/supabase';

// Re-export everything for consistent imports
export {
  getSupabase,
  resetSupabaseClient,
  isUsingMockSupabaseClient,
  checkSupabaseConnection,
  callRpc,
  createRpcCaller,
  incrementEnergyPoints
};

/**
 * The singleton Supabase client instance
 * 
 * This is properly initialized with validation and error handling.
 * Always use this instance for database operations to maintain
 * consistent error handling and connection management.
 */
export const supabase = supabaseInstance;

export default supabase;
