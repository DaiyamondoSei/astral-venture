
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wkmyvthtyjcdzhzvfyji.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXl2dGh0eWpjZHpoenZmeWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDM5OTMsImV4cCI6MjA1NjY3OTk5M30.iOgl9X2mcl-eQi5CzhluFYqVal1Qevk4kTav4zVfeMU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add custom function to handle incrementing values
export const incrementEnergyPoints = async (userId: string, pointsToAdd: number) => {
  try {
    // Get current energy points
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentPoints = userData?.energy_points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update with new points value
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: newPoints,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return newPoints;
  } catch (error) {
    console.error('Error incrementing energy points:', error);
    throw error;
  }
};
