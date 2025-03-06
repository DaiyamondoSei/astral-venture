
import { supabase } from '@/integrations/supabase/client';
import { UserActivity } from '../types';
import { Json } from '@/integrations/supabase/types';
import { normalizeChakraData } from '@/utils/emotion/chakraTypes';

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
      
      // Map database records to UserActivity type with proper type conversion
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        activityType: item.activity_type,
        timestamp: item.timestamp,
        duration: item.duration,
        // Convert JSON data to proper types
        chakrasActivated: normalizeChakraData(item.chakras_activated),
        completionRate: item.completion_rate,
        emotionalResponse: normalizeEmotionalResponse(item.emotional_response),
        metadata: item.metadata as Record<string, any> || {}
      }));
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }
};

/**
 * Normalizes emotional response data from JSON to string array
 */
function normalizeEmotionalResponse(emotionalResponse: Json | null): string[] {
  if (!emotionalResponse) return [];
  
  // If already an array, convert all items to strings
  if (Array.isArray(emotionalResponse)) {
    return emotionalResponse.map(item => String(item));
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof emotionalResponse === 'string') {
    try {
      const parsed = JSON.parse(emotionalResponse);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item));
      }
      return [emotionalResponse]; // Single string
    } catch (e) {
      return [emotionalResponse]; // Single string (not JSON)
    }
  }
  
  // If it's a number or boolean, convert to string
  if (typeof emotionalResponse === 'number' || typeof emotionalResponse === 'boolean') {
    return [String(emotionalResponse)];
  }
  
  // If it's an object, convert values to string array
  if (typeof emotionalResponse === 'object') {
    try {
      return Object.values(emotionalResponse).map(item => String(item));
    } catch (e) {
      return [];
    }
  }
  
  return [];
}
