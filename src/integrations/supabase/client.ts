
/**
 * Supabase Client Integration
 * 
 * This file provides a centralized Supabase client with proper error handling
 * and helper functions for common operations.
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration early and provide useful feedback
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  
  if (typeof document !== 'undefined') {
    toast({
      title: 'Configuration Error',
      description: 'Supabase connection configuration is missing. Please check console for details.',
      variant: 'destructive',
    });
  }
}

// Create a Supabase client instance
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

/**
 * Check Supabase connection
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
}

/**
 * Get user's energy points
 */
export async function incrementEnergyPoints(userId: string, points: number): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    if (error) throw error;
    return data || 0;
  } catch (err) {
    console.error('Failed to increment energy points:', err);
    toast({
      title: 'Operation Failed',
      description: 'Could not update energy points. Please try again.',
      variant: 'destructive',
    });
    return 0;
  }
}

// Export a function to check if configuration is valid
export function isSupabaseConfigValid(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}
