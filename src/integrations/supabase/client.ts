
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wkmyvthtyjcdzhzvfyji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add custom function to handle incrementing values
supabase.rpc = function(functionName: string, params: any = {}) {
  if (functionName === 'increment') {
    // Simulate an increment function since we don't have RPC functions set up yet
    const value = params.x || 0;
    return value;
  }
  
  return this.functions.invoke(functionName, {
    body: params
  });
};
