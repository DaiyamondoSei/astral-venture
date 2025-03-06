
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences, ContentRecommendation, UserActivity } from './types';
import { preferencesService } from './preferencesService';

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
      
      // Get user activity history for personalization
      const activities = await this.getUserActivities(userId);
      
      // Generate recommendations based on preferences and activity
      return this.generateRecommendations(userId, preferences, activities, limit);
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
      
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activity.activityType,
          timestamp: new Date().toISOString(),
          duration: activity.duration,
          chakras_activated: activity.chakrasActivated,
          completion_rate: activity.completionRate,
          emotional_response: activity.emotionalResponse,
          metadata: activity.metadata
        });
      
      if (error) throw error;
      
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
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
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
  },

  /**
   * Generate personalized recommendations based on user data
   * @param userId User ID
   * @param preferences User preferences
   * @param activities User activities
   * @param limit Maximum number of recommendations
   * @returns Array of personalized content recommendations
   */
  async generateRecommendations(
    userId: string, 
    preferences: UserPreferences, 
    activities: UserActivity[],
    limit: number
  ): Promise<ContentRecommendation[]> {
    try {
      // Get all available content
      const { data: allContent, error } = await supabase
        .from('content_library')
        .select('*');
      
      if (error) throw error;
      if (!allContent || allContent.length === 0) return [];
      
      // Calculate relevance scores based on preferences and activity
      const scoredContent = allContent.map(content => {
        // Calculate base relevance score from category preferences
        let relevanceScore = preferences.contentCategories.includes(content.category) ? 0.8 : 0.3;
        
        // Adjust score based on practice type preferences
        if (content.type === 'practice' || content.type === 'meditation') {
          relevanceScore *= preferences.practiceTypes.includes(content.practice_type) ? 1.2 : 0.8;
        }
        
        // Adjust score based on content level
        if (content.level === preferences.contentLevel) {
          relevanceScore *= 1.3;
        } else if (
          (content.level === 'beginner' && preferences.contentLevel === 'intermediate') ||
          (content.level === 'intermediate' && preferences.contentLevel === 'advanced')
        ) {
          relevanceScore *= 0.7;
        } else {
          relevanceScore *= 0.4; // Less relevant level
        }
        
        // Adjust score based on chakra alignment
        if (content.chakra_alignment && preferences.chakraFocus) {
          const hasMatchingChakra = content.chakra_alignment.some((chakra: number) => 
            preferences.chakraFocus.includes(chakra)
          );
          relevanceScore *= hasMatchingChakra ? 1.5 : 0.8;
        }
        
        // Adjust score based on activity history
        if (activities.length > 0) {
          // Check if user has viewed similar content
          const similarContentViews = activities.filter(a => 
            a.activityType === 'content_view' && 
            a.metadata?.contentId === content.id
          );
          
          // Lower score if already viewed recently (last 7 days)
          const recentView = similarContentViews.find(v => {
            const viewDate = new Date(v.timestamp);
            const now = new Date();
            const daysSince = (now.getTime() - viewDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince < 7;
          });
          
          if (recentView) {
            relevanceScore *= 0.5; // Reduce score for recently viewed content
          }
          
          // Increase score for content with similar emotional resonance to user's reflections
          const userEmotions = activities
            .filter(a => a.activityType === 'reflection')
            .flatMap(a => a.emotionalResponse || []);
          
          if (userEmotions.length > 0 && content.emotional_resonance) {
            const matchingEmotions = content.emotional_resonance.filter((emotion: string) => 
              userEmotions.includes(emotion)
            );
            
            relevanceScore *= (1 + (matchingEmotions.length * 0.2));
          }
        }
        
        // Generate recommendation reason
        let recommendationReason = '';
        
        if (preferences.contentCategories.includes(content.category)) {
          recommendationReason = `Based on your interest in ${content.category}`;
        } else if (content.chakra_alignment && preferences.chakraFocus.some(c => content.chakra_alignment.includes(c))) {
          const matchingChakras = preferences.chakraFocus
            .filter(c => content.chakra_alignment.includes(c))
            .map(getChakraName);
          recommendationReason = `Aligned with your ${matchingChakras.join(' and ')} chakra focus`;
        } else {
          recommendationReason = 'Suggested to expand your practice';
        }
        
        return {
          id: content.id,
          title: content.title,
          type: content.type,
          category: content.category,
          relevanceScore: relevanceScore,
          chakraAlignment: content.chakra_alignment,
          emotionalResonance: content.emotional_resonance,
          recommendationReason
        };
      });
      
      // Sort by relevance score and limit
      return scoredContent
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
};

/**
 * Get chakra name from index
 */
function getChakraName(index: number): string {
  const chakraNames = [
    'Root', 'Sacral', 'Solar Plexus', 'Heart', 
    'Throat', 'Third Eye', 'Crown'
  ];
  return chakraNames[index] || 'Unknown';
}
