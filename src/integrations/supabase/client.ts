
/**
 * Legacy Supabase client
 * 
 * @deprecated Use the singleton client from '@/lib/supabaseClient' instead
 * This file exists for backward compatibility with existing code.
 */

import { supabase, incrementEnergyPoints, callRpc, createRpcCaller } from '@/lib/supabaseClient';

// Export the singleton instance and helper functions
export { 
  supabase, 
  incrementEnergyPoints, 
  callRpc,
  createRpcCaller
};

// Add deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[Deprecation Warning] Importing from "@/integrations/supabase/client" is deprecated. ' +
    'Please import from "@/lib/supabaseClient" instead for better consistency.'
  );
}

export default supabase;
