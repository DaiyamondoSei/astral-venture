
/**
 * Track AI usage for analytics and billing
 * This function runs as a background task and doesn't block the response
 */
export async function trackUsage(
  supabase: any, 
  userId: string, 
  usageData: {
    model: string;
    tokensUsed: number;
    queryType: string;
    processingTime?: number;
    answerLength?: number;
    insightsCount?: number;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    console.log(`Tracking usage for user ${userId}: ${JSON.stringify(usageData)}`);
    
    // Record usage in the database
    const { error } = await supabase
      .from("ai_usage")
      .insert({
        user_id: userId,
        model: usageData.model,
        tokens_used: usageData.tokensUsed,
        query_type: usageData.queryType,
        processing_time: usageData.processingTime,
        answer_length: usageData.answerLength,
        insights_count: usageData.insightsCount,
        additional_metadata: usageData.metadata,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      throw error;
    }
    
    // Perform additional analytics if needed
    if (usageData.tokensUsed > 1000) {
      await updateUserHighUsageMetric(supabase, userId);
    }
    
    // Update user's total token usage
    await updateUserTotalTokens(supabase, userId, usageData.tokensUsed);
    
    console.log(`Usage tracking completed for user ${userId}`);
  } catch (error) {
    console.error("Error tracking AI usage:", error);
    // Don't throw the error since this is a background task
  }
}

/**
 * Update high usage metric for users
 */
async function updateUserHighUsageMetric(supabase: any, userId: string): Promise<void> {
  try {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("high_usage_count")
      .eq("id", userId)
      .maybeSingle();
    
    if (userProfile) {
      const highUsageCount = (userProfile.high_usage_count || 0) + 1;
      
      await supabase
        .from("user_profiles")
        .update({ high_usage_count: highUsageCount })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Error updating high usage metric:", error);
  }
}

/**
 * Update total token usage for a user
 */
async function updateUserTotalTokens(supabase: any, userId: string, tokensUsed: number): Promise<void> {
  try {
    const { data: userStats } = await supabase
      .from("user_ai_stats")
      .select("total_tokens")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (userStats) {
      // Update existing record
      await supabase
        .from("user_ai_stats")
        .update({ 
          total_tokens: userStats.total_tokens + tokensUsed,
          last_query_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    } else {
      // Create new record
      await supabase
        .from("user_ai_stats")
        .insert({
          user_id: userId,
          total_tokens: tokensUsed,
          last_query_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error("Error updating total tokens:", error);
  }
}
