
/**
 * Unified Supabase Client
 * 
 * This file exports a unified set of Supabase clients with different access patterns.
 * It re-exports clients from the supabaseClientSingleton module.
 */

import { supabase, supabaseClientSingleton, isSupabaseConfigValid, getConfigurationStatus } from './supabaseClientSingleton';

// Re-export the default client
export { supabase };

// Re-export the singleton instance
export { supabaseClientSingleton };

// Re-export configuration status functions
export { isSupabaseConfigValid, getConfigurationStatus };

// Export as default as well
export default supabase;
