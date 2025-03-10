
/**
 * Legacy Supabase client
 * 
 * @deprecated Use the singleton client from '@/lib/supabaseClient' instead
 */

import { supabase, incrementEnergyPoints, calculateFractalComplexity } from '@/lib/supabaseClient';

// Export the singleton instance
export { supabase, incrementEnergyPoints, calculateFractalComplexity };

// Add deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[Deprecation Warning] Importing from "@/integrations/supabase/client" is deprecated. ' +
    'Please import from "@/lib/supabaseClient" instead for better consistency.'
  );
}
