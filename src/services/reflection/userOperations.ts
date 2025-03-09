
import { supabase } from '@/lib/supabaseClient';
import { incrementEnergyPoints } from '@/integrations/supabase/client';

/**
 * Update user points
 */
export const updateUserPoints = async (userId: string, pointsToAdd: number): Promise<number> => {
  try {
    const newPoints = await incrementEnergyPoints(userId, pointsToAdd);
    return newPoints;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Export function for use in other files
export { updateUserPoints };
