
import { UserActivity } from '../types';

// Cache for user activities (in-memory substitute for database)
const userActivitiesCache = new Map<string, UserActivity[]>();

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
      
      // Create a new activity object
      const newActivity: UserActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        timestamp: new Date().toISOString(),
        activityType: activity.activityType,
        duration: activity.duration,
        chakrasActivated: activity.chakrasActivated,
        completionRate: activity.completionRate,
        emotionalResponse: activity.emotionalResponse,
        metadata: activity.metadata
      };
      
      // Get existing activities or initialize empty array
      const existingActivities = userActivitiesCache.get(userId) || [];
      
      // Add new activity to the beginning of the array
      userActivitiesCache.set(userId, [newActivity, ...existingActivities]);
      
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
      
      // Get activities from cache or return empty array
      const activities = userActivitiesCache.get(userId) || [];
      
      // Return activities limited to the requested number
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }
};
