
import { supabase } from '@/integrations/supabase/client';
import { PersonalizationMetrics } from './types';

/**
 * Service for calculating and retrieving personalization impact metrics
 */
export const personalizationMetricsService = {
  /**
   * Get personalization metrics for a user
   * @param userId User ID
   * @returns Personalization metrics
   */
  async getMetrics(userId: string): Promise<PersonalizationMetrics | null> {
    try {
      // First check if metrics exist in database
      const { data, error } = await supabase
        .from('personalization_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          engagementScore: data.engagement_score,
          contentRelevanceRating: data.content_relevance_rating,
          chakraBalanceImprovement: data.chakra_balance_improvement,
          emotionalGrowthRate: data.emotional_growth_rate,
          progressAcceleration: data.progress_acceleration,
          lastUpdated: data.updated_at
        };
      }
      
      // If no metrics exist, calculate them
      return await this.calculateMetrics(userId);
    } catch (error) {
      console.error('Error fetching personalization metrics:', error);
      return null;
    }
  },
  
  /**
   * Calculate personalization metrics for a user
   * @param userId User ID
   * @returns Calculated personalization metrics
   */
  async calculateMetrics(userId: string): Promise<PersonalizationMetrics> {
    try {
      // Get user activities
      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Default metrics in case of no data
      const defaultMetrics: PersonalizationMetrics = {
        engagementScore: 0,
        contentRelevanceRating: 0,
        chakraBalanceImprovement: 0,
        emotionalGrowthRate: 0,
        progressAcceleration: 0,
        lastUpdated: new Date().toISOString()
      };
      
      if (!activities || activities.length === 0) {
        return defaultMetrics;
      }
      
      // Calculate engagement score (0-100)
      const activityCount = activities.length;
      const recentActivities = activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        const now = new Date();
        const daysSince = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30; // Last 30 days
      }).length;
      
      const engagementScore = Math.min(100, Math.round((recentActivities / 30) * 100));
      
      // Calculate content relevance rating based on completion rates (0-100)
      const contentViews = activities.filter(a => a.activity_type === 'content_view');
      const relevanceSum = contentViews.reduce((sum, activity) => {
        return sum + (activity.completion_rate || 0);
      }, 0);
      
      const contentRelevanceRating = contentViews.length > 0 
        ? Math.round((relevanceSum / contentViews.length))
        : 0;
      
      // Calculate chakra balance improvement (-100 to 100)
      const oldestChakraActivity = activities
        .filter(a => a.chakras_activated && a.chakras_activated.length > 0)
        .pop();
      
      const newestChakraActivity = activities
        .filter(a => a.chakras_activated && a.chakras_activated.length > 0)
        .shift();
      
      let chakraBalanceImprovement = 0;
      
      if (oldestChakraActivity && newestChakraActivity) {
        const oldChakras = oldestChakraActivity.chakras_activated || [];
        const newChakras = newestChakraActivity.chakras_activated || [];
        
        chakraBalanceImprovement = Math.min(100, Math.max(-100, 
          (newChakras.length - oldChakras.length) * 20
        ));
      }
      
      // Calculate emotional growth rate (0-100)
      const reflections = activities.filter(a => a.activity_type === 'reflection');
      const oldestReflectionDepth = reflections.length > 0 ? 
        (reflections[reflections.length - 1].metadata?.depth || 0) : 0;
      
      const newestReflectionDepth = reflections.length > 0 ?
        (reflections[0].metadata?.depth || 0) : 0;
      
      const emotionalGrowthRate = Math.round(
        Math.min(100, Math.max(0, (newestReflectionDepth - oldestReflectionDepth) * 100))
      );
      
      // Calculate progress acceleration (-100 to 100)
      const firstMonthActivities = activities
        .filter(a => {
          const activityDate = new Date(a.timestamp);
          const firstMonth = new Date(activities[activities.length - 1].timestamp);
          firstMonth.setMonth(firstMonth.getMonth() + 1);
          return activityDate <= firstMonth;
        }).length;
      
      const lastMonthActivities = recentActivities;
      
      const progressAcceleration = firstMonthActivities > 0 ?
        Math.min(100, Math.max(-100, 
          ((lastMonthActivities - firstMonthActivities) / firstMonthActivities) * 100
        )) : 0;
      
      // Compile metrics
      const metrics: PersonalizationMetrics = {
        engagementScore,
        contentRelevanceRating,
        chakraBalanceImprovement,
        emotionalGrowthRate,
        progressAcceleration,
        lastUpdated: new Date().toISOString()
      };
      
      // Store metrics in database
      await supabase
        .from('personalization_metrics')
        .upsert({
          user_id: userId,
          engagement_score: metrics.engagementScore,
          content_relevance_rating: metrics.contentRelevanceRating,
          chakra_balance_improvement: metrics.chakraBalanceImprovement,
          emotional_growth_rate: metrics.emotionalGrowthRate,
          progress_acceleration: metrics.progressAcceleration,
          updated_at: metrics.lastUpdated
        });
      
      return metrics;
    } catch (error) {
      console.error('Error calculating personalization metrics:', error);
      
      // Return default metrics in case of error
      return {
        engagementScore: 0,
        contentRelevanceRating: 0,
        chakraBalanceImprovement: 0,
        emotionalGrowthRate: 0,
        progressAcceleration: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
};
