
/**
 * Supabase Client Integration
 * 
 * This file provides a centralized Supabase client with proper error handling
 * and helper functions for common operations.
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/types/database';

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

// Create a Supabase client instance with the Database type
export const supabase = createClient<Database>(
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
 * Increment user's energy points
 * 
 * @param userId User ID to increment points for
 * @param points Number of points to add (can be negative to decrease)
 * @returns The new total points count
 */
export async function incrementEnergyPoints(userId: string, points: number): Promise<number> {
  if (!userId) {
    console.error('Cannot increment points: userId is required');
    return 0;
  }

  try {
    // Call the RPC function we've implemented in our database
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });
    
    if (error) throw error;
    
    // Record this in the points history table
    await supabase.from('energy_points_history').insert({
      user_id: userId,
      points_added: points,
      new_total: data || 0,
      source: 'api_action'
    });
    
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

/**
 * Get user profile data
 * 
 * @param userId User ID to get profile for
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string) {
  if (!userId) {
    console.error('Cannot fetch profile: userId is required');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return null;
  }
}

// Export a function to check if configuration is valid
export function isSupabaseConfigValid(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}
