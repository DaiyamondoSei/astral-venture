
import { supabase } from '@/lib/supabaseClient';
import { AchievementEventType, AchievementType } from '@/components/onboarding/hooks/achievement/types';

/**
 * Track an achievement event
 * 
 * @param userId The user ID
 * @param eventType The type of achievement event
 * @param data Additional data for the event
 */
export async function trackAchievementEvent(
  userId: string,
  eventType: AchievementEventType,
  data?: Record<string, any>
) {
  try {
    if (!userId) {
      console.error('Cannot track achievement event: No user ID provided');
      return;
    }
    
    console.log(`Tracking achievement event: ${eventType}`, data);
    
    // Record the event in the database
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: eventType,
        metadata: data || {},
      });
      
    if (error) {
      console.error('Error tracking achievement event:', error);
    }
    
    return { success: !error };
  } catch (err) {
    console.error('Failed to track achievement event:', err);
    return { success: false, error: err };
  }
}

/**
 * Unlock an achievement for a user
 * 
 * @param userId The user ID
 * @param achievementId The achievement ID
 * @param data Additional data for the achievement
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string,
  data?: Record<string, any>
) {
  try {
    if (!userId || !achievementId) {
      console.error('Cannot unlock achievement: Missing user ID or achievement ID');
      return { success: false };
    }
    
    console.log(`Unlocking achievement ${achievementId} for user ${userId}`);
    
    // Record the achievement in the database
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
        metadata: data || {},
      });
      
    if (error) {
      // Check if it's a duplicate - achievement already unlocked
      if (error.code === '23505') { // Unique violation
        console.log(`Achievement ${achievementId} already unlocked for user ${userId}`);
        return { success: true, alreadyUnlocked: true };
      }
      
      console.error('Error unlocking achievement:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Failed to unlock achievement:', err);
    return { success: false, error: err };
  }
}
