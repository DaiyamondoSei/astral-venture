
import { UserPreferences, ContentRecommendation, UserActivity } from '../types';
import { activityRepository } from './activityRepository';
import { contentRepository } from './contentRepository';
import { analyzeUserActivities } from './activityAnalyzer';
import { scoreContent } from './contentScorer';
import { ScoredContent } from './types';

/**
 * Service for generating personalized recommendations
 */
export const recommendationService = {
  /**
   * Get personalized content recommendations for a user
   */
  async getRecommendations(userId: string, limit = 5): Promise<ContentRecommendation[]> {
    try {
      // Get user activities for personalization
      const activities = await activityRepository.getUserActivities(userId);
      
      // Get all available content
      const allContent = await contentRepository.getAllContent();
      
      if (!allContent || allContent.length === 0) return [];
      
      // Analyze user activities
      const activityAnalysis = analyzeUserActivities(activities);
      
      // Dummy preferences for testing until we have the real preferences service
      const preferences: UserPreferences = {
        contentCategories: ['meditation', 'chakras', 'reflection'],
        practiceTypes: ['guided-meditation', 'breathing'],
        chakraFocus: [3], // Heart chakra by default
        interfaceTheme: 'cosmic',
        notificationFrequency: 'daily',
        practiceReminders: true,
        contentLevel: 'beginner',
        privacySettings: {
          shareUsageData: true,
          allowRecommendations: true,
          storeActivityHistory: true,
          dataRetentionPeriod: 90
        }
      };
      
      // Score each piece of content
      const scoredContent: ScoredContent[] = allContent.map(content => 
        scoreContent(content, preferences, activityAnalysis)
      );
      
      // Sort by relevance score and limit
      return scoredContent
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  },
  
  /**
   * Record user activity for improving recommendations
   */
  async recordActivity(userId: string, activity: Omit<UserActivity, 'id' | 'userId' | 'timestamp'>): Promise<void> {
    return activityRepository.recordActivity(userId, activity);
  }
};
