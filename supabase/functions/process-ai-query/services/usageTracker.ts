
/**
 * Utility for tracking AI usage for analytics and quotas
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

interface UsageMetrics {
  model: string;
  tokensUsed: number;
  queryType: string;
  processingTime: number;
  answerLength: number;
  insightsCount: number;
  metadata?: Record<string, any>;
}

/**
 * Track AI usage for a user
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param metrics - Usage metrics
 */
export async function trackUsage(
  supabase: SupabaseClient,
  userId: string,
  metrics: UsageMetrics
): Promise<void> {
  try {
    // Log the usage to a dedicated table
    const { error } = await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: userId,
        model: metrics.model,
        tokens_used: metrics.tokensUsed,
        query_type: metrics.queryType,
        processing_time_ms: metrics.processingTime,
        answer_length: metrics.answerLength,
        insights_count: metrics.insightsCount,
        metadata: metrics.metadata || {}
      });
    
    if (error) {
      console.error("Error tracking usage:", error);
    }
    
    // Update user metrics for personalization
    await updateUserMetrics(supabase, userId, metrics);
  } catch (error) {
    console.error("Error in trackUsage:", error);
  }
}

/**
 * Update user metrics based on AI usage
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param metrics - Usage metrics
 */
async function updateUserMetrics(
  supabase: SupabaseClient,
  userId: string,
  metrics: UsageMetrics
): Promise<void> {
  try {
    // Check if personalization metrics exist for the user
    const { data, error } = await supabase
      .from('personalization_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found
      console.error("Error checking personalization metrics:", error);
      return;
    }
    
    // Calculate engagement score increase based on query complexity
    const engagementIncrease = Math.min(
      5,
      Math.ceil(metrics.tokensUsed / 100) + 
      Math.ceil(metrics.insightsCount / 2)
    );
    
    if (data) {
      // Update existing metrics
      const { error: updateError } = await supabase
        .from('personalization_metrics')
        .update({
          engagement_score: Math.min(100, data.engagement_score + engagementIncrease),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error("Error updating personalization metrics:", updateError);
      }
    } else {
      // Create new metrics record
      const { error: insertError } = await supabase
        .from('personalization_metrics')
        .insert({
          user_id: userId,
          engagement_score: engagementIncrease,
          content_relevance_rating: 50, // Default starting value
          emotional_growth_rate: 0,
          chakra_balance_improvement: 0,
          progress_acceleration: 0
        });
      
      if (insertError) {
        console.error("Error creating personalization metrics:", insertError);
      }
    }
  } catch (error) {
    console.error("Error in updateUserMetrics:", error);
  }
}
