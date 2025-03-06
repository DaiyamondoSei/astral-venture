
import { UserPreferences, ContentRecommendation, UserActivity } from './types';
import { preferencesService } from './preferencesService';
import { recommendationService } from './recommendations/recommendationService';
import { activityRepository } from './recommendations/activityRepository';

/**
 * Service for generating personalized recommendations
 */
export const recommendationEngine = {
  /**
   * Get personalized content recommendations for a user
   * @param userId User ID
   * @param limit Maximum number of recommendations to return
   * @returns Array of content recommendations
   */
  async getRecommendations(userId: string, limit = 5): Promise<ContentRecommendation[]> {
    try {
      // Get user preferences
      const preferences = await preferencesService.getUserPreferences(userId);
      
      // If user has opted out of recommendations, return empty array
      if (!preferences.privacySettings.allowRecommendations) {
        console.log('User has opted out of recommendations');
        return [];
      }
      
      // Generate recommendations
      return recommendationService.getRecommendations(userId, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  },
  
  /**
   * Record user activity for improving recommendations
   * @param userId User ID 
   * @param activity User activity data
   */
  async recordActivity(userId: string, activity: Omit<UserActivity, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    try {
      // Check if user allows activity tracking
      const preferences = await preferencesService.getUserPreferences(userId);
      
      if (!preferences.privacySettings.storeActivityHistory) {
        console.log('User has opted out of activity tracking');
        return;
      }
      
      // Record the activity
      await recommendationService.recordActivity(userId, activity);
    } catch (error) {
      console.error('Error recording user activity:', error);
    }
  },

  /**
   * Get user activities for personalization algorithm
   * @param userId User ID
   * @returns User activities
   */
  async getUserActivities(userId: string): Promise<UserActivity[]> {
    return activityRepository.getUserActivities(userId);
  }
};
