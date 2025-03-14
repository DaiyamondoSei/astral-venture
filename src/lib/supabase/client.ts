
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  
  if (typeof window !== 'undefined') {
    toast({
      title: 'Configuration Error',
      description: 'Supabase connection failed. See console for details.',
      variant: 'destructive',
    });
  }
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

/**
 * Increment energy points for a user
 * @param userId User ID
 * @param points Number of points to add
 * @returns The updated total points
 */
export async function incrementEnergyPoints(userId: string, points: number): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('increment_points', {
      row_id: userId,
      points_to_add: points
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error incrementing energy points:', error);
    throw error;
  }
}

/**
 * Get total energy points for a user
 * @param userId User ID
 * @returns The total points
 */
export async function getTotalPoints(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_total_points', {
      user_id_param: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting total points:', error);
    throw error;
  }
}

/**
 * Test the Supabase connection
 * @returns Boolean indicating if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Export the default client
export default supabase;
