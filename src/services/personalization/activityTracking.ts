
import { UserActivity } from './types';
import { recommendationEngine } from './recommendationEngine';

/**
 * Service for tracking user activity for personalization
 */
export const activityTrackingService = {
  /**
   * Track a content view
   * @param userId User ID
   * @param contentId Content ID 
   * @param duration Duration in seconds (optional)
   * @param completionRate Completion rate percentage (optional)
   */
  async trackContentView(
    userId: string, 
    contentId: string, 
    duration?: number, 
    completionRate?: number
  ): Promise<void> {
    await recommendationEngine.recordActivity(userId, {
      activityType: 'content_view',
      duration,
      completionRate,
      metadata: { contentId }
    });
  },
  
  /**
   * Track a practice completion
   * @param userId User ID
   * @param practiceId Practice ID
   * @param practiceType Type of practice
   * @param duration Duration in minutes
   * @param chakrasActivated Array of activated chakra indices
   * @param emotionalResponse Emotional response tags
   */
  async trackPracticeCompletion(
    userId: string,
    practiceId: string,
    practiceType: string,
    duration: number,
    chakrasActivated?: number[],
    emotionalResponse?: string[]
  ): Promise<void> {
    await recommendationEngine.recordActivity(userId, {
      activityType: 'practice_completion',
      duration,
      chakrasActivated,
      emotionalResponse,
      metadata: { practiceId, practiceType }
    });
  },
  
  /**
   * Track a reflection submission
   * @param userId User ID
   * @param reflectionId Reflection ID
   * @param chakrasActivated Array of activated chakra indices
   * @param emotionalResponse Emotional response tags
   * @param depth Emotional depth score (0-1)
   */
  async trackReflection(
    userId: string,
    reflectionId: string,
    chakrasActivated?: number[],
    emotionalResponse?: string[],
    depth?: number
  ): Promise<void> {
    await recommendationEngine.recordActivity(userId, {
      activityType: 'reflection',
      chakrasActivated,
      emotionalResponse,
      metadata: { reflectionId, depth }
    });
  },
  
  /**
   * Track a user preference change
   * @param userId User ID
   * @param preferenceType Type of preference changed
   * @param newValue New preference value
   */
  async trackPreferenceChange(
    userId: string,
    preferenceType: string,
    newValue: any
  ): Promise<void> {
    await recommendationEngine.recordActivity(userId, {
      activityType: 'preference_change',
      metadata: { preferenceType, newValue }
    });
  }
};
