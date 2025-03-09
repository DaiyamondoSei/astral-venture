
/**
 * Track AI usage for analytics
 */
export async function trackUsage(supabase: any, userId: string, usageData: any): Promise<void> {
  try {
    await supabase
      .from("ai_usage")
      .insert({
        user_id: userId,
        model: usageData.model,
        tokens_used: usageData.tokensUsed,
        query_type: usageData.queryType,
        timestamp: new Date().toISOString()
      });
      
    // Also update user metrics to reflect this usage
    await updateUserMetrics(supabase, userId, usageData);
  } catch (error) {
    console.error("Error tracking AI usage:", error);
  }
}

/**
 * Update user metrics based on AI usage
 */
async function updateUserMetrics(supabase: any, userId: string, usageData: any): Promise<void> {
  try {
    // Get current user profile
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("ai_interactions, updated_at")
      .eq("id", userId)
      .single();
      
    if (userProfile) {
      // Increment AI interactions count
      const currentInteractions = userProfile.ai_interactions || 0;
      
      await supabase
        .from("user_profiles")
        .update({ 
          ai_interactions: currentInteractions + 1,
          last_active_at: new Date().toISOString()
        })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Error updating user metrics:", error);
  }
}
