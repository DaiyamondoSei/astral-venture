
import { supabase } from '@/integrations/supabase/client';
import { UserActivity } from '../types';

/**
 * Repository for user activity data
 */
export const activityRepository = {
  /**
   * Record user activity
   */
  async recordActivity(
    userId: string, 
    activity: Omit<UserActivity, 'id' | 'userId' | 'timestamp'>
  ): Promise<void> {
    try {
      console.log(`Recording activity for user ${userId}`, activity);
      
      // Insert activity into the user_activities table
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activity.activityType,
          duration: activity.duration,
          chakras_activated: activity.chakrasActivated,
          completion_rate: activity.completionRate,
          emotional_response: activity.emotionalResponse,
          metadata: activity.metadata
        });
        
      if (error) {
        throw error;
      }
      
    } catch (error) {
      console.error('Error recording user activity:', error);
      throw error;
    }
  },
  
  /**
   * Get user activities
   */
  async getUserActivities(userId: string, limit = 100): Promise<UserActivity[]> {
    try {
      console.log(`Getting activities for user ${userId}, limit: ${limit}`);
      
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
        
      if (error) {
        throw error;
      }
      
      // Map database records to UserActivity type
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        activityType: item.activity_type,
        timestamp: item.timestamp,
        duration: item.duration,
        chakrasActivated: item.chakras_activated,
        completionRate: item.completion_rate,
        emotionalResponse: item.emotional_response,
        metadata: item.metadata
      }));
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }
};
