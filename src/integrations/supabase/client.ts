
/**
 * Supabase Integration Client
 * 
 * This file re-exports the supabase client from lib/supabaseClient.ts
 * to maintain consistency across the application.
 */

import {
  supabase,
  getSupabase,
  resetSupabaseClient,
  isUsingMockSupabaseClient,
  checkSupabaseConnection,
  callRpc,
  createRpcCaller,
  incrementEnergyPoints
} from '@/lib/supabaseClient';

// Re-export everything for consistent imports
export {
  supabase,
  getSupabase,
  resetSupabaseClient,
  isUsingMockSupabaseClient,
  checkSupabaseConnection,
  callRpc,
  createRpcCaller,
  incrementEnergyPoints
};

export default supabase;
