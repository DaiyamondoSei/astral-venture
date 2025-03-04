
import { supabase } from '@/integrations/supabase/client';

export interface EnergyReflection {
  id: string;
  user_id: string;
  content: string;
  points_earned: number;
  created_at: string;
}

export const saveReflection = async (userId: string, content: string, pointsEarned: number) => {
  const { error } = await supabase
    .from('energy_reflections')
    .insert({
      user_id: userId,
      content: content,
      points_earned: pointsEarned
    } as any);
    
  if (error) throw error;
};

export const updateUserPoints = async (userId: string, pointsEarned: number) => {
  // Get current points
  const { data: userData, error: fetchError } = await supabase
    .from('user_profiles')
    .select('energy_points')
    .eq('id', userId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const currentPoints = userData?.energy_points || 0;
  const newPoints = currentPoints + pointsEarned;
  
  // Update user's points
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ 
      energy_points: newPoints,
      last_active_at: new Date().toISOString()
    })
    .eq('id', userId);
    
  if (updateError) throw updateError;
  
  return newPoints;
};
