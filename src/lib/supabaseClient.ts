
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Initialize the Supabase client with the project URL and anonymous key
const supabaseUrl = 'https://wkmyvthtyjcdzhzvfyji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const supabaseClient = supabase; // Add an alias for backward compatibility
