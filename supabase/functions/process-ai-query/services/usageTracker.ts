
/**
 * Track AI usage with detailed metrics for analytics
 */
export async function trackUsage(
  supabase: any, 
  userId: string, 
  data: {
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
    console.log(`Tracking usage for user ${userId}: ${data.tokensUsed} tokens, model: ${data.model}`);
    
    // Record AI usage in the ai_usage table
    await supabase
      .from("ai_usage")
      .insert({
        user_id: userId,
        model: data.model,
        tokens_used: data.tokensUsed,
        query_type: data.queryType,
        processing_time_ms: data.processingTime,
        answer_length: data.answerLength,
        insights_count: data.insightsCount,
        metadata: data.metadata || {},
        timestamp: new Date().toISOString()
      });
    
    // Update user's energy points as a background task
    try {
      // Calculate energy points based on token usage (simplified example)
      // In a real implementation, this could be more sophisticated
      const energyPointsEarned = Math.min(Math.ceil(data.tokensUsed / 100), 5);
      
      if (energyPointsEarned > 0) {
        console.log(`Adding ${energyPointsEarned} energy points to user ${userId}`);
        
        // Call the add_energy_points function
        await supabase.rpc('add_energy_points', {
          user_id_param: userId,
          points_param: energyPointsEarned
        });
      }
    } catch (pointsError) {
      // Don't fail the entire operation if points update fails
      console.error("Error updating energy points:", pointsError);
    }
  } catch (error) {
    console.error("Error tracking AI usage:", error);
    // We don't throw here to prevent the main operation from failing
  }
}
