
/**
 * Legacy Supabase client
 * 
 * @deprecated Use the singleton client from '@/lib/supabaseClient' instead
 */

import { supabase, incrementEnergyPoints } from '@/lib/supabaseClient';

// Export the singleton instance and helper functions
export { supabase, incrementEnergyPoints };

// Add deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[Deprecation Warning] Importing from "@/integrations/supabase/client" is deprecated. ' +
    'Please import from "@/lib/supabaseClient" instead for better consistency.'
  );
}
