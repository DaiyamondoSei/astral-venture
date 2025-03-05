
import { supabase } from '@/lib/supabaseClient';

// Function to update user points
export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  try {
    // First, get the current points
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const currentPoints = profileData?.energy_points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update the user's points
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ energy_points: newPoints })
      .eq('id', userId);
      
    if (error) throw error;
    return newPoints;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};
