
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Initialize the Supabase client
// We get the URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Authentication and data features will not work properly.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
