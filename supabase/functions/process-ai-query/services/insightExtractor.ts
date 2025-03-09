
/**
 * Extract structured insights from AI responses
 */
export function extractInsights(text: string): any[] {
  const insights = [];
  
  // Extract emotional insights
  const emotionalMatch = text.match(/(?:emotions|emotional pattern|feeling)s?:?\s*([^.]*\.)/i);
  if (emotionalMatch && emotionalMatch[1]) {
    insights.push({
      type: 'emotional',
      content: emotionalMatch[1].trim()
    });
  }
  
  // Extract chakra insights
  const chakraMatch = text.match(/(?:chakra|energy center)s?:?\s*([^.]*\.)/i);
  if (chakraMatch && chakraMatch[1]) {
    insights.push({
      type: 'chakra',
      content: chakraMatch[1].trim()
    });
  }
  
  // Extract practice recommendations
  const practiceMatch = text.match(/(?:practice|recommendation|exercise|technique)s?:?\s*([^.]*\.)/i);
  if (practiceMatch && practiceMatch[1]) {
    insights.push({
      type: 'practice',
      content: practiceMatch[1].trim()
    });
  }
  
  // Extract awareness insights
  const awarenessMatch = text.match(/(?:awareness|insight|realization|understanding)s?:?\s*([^.]*\.)/i);
  if (awarenessMatch && awarenessMatch[1]) {
    insights.push({
      type: 'awareness',
      content: awarenessMatch[1].trim()
    });
  }
  
  return insights;
}

/**
 * Track API usage for monitoring
 */
export async function trackUsage(supabaseClient: any, userId: string, usageData: any): Promise<void> {
  try {
    // In a production system, we would store usage data for quotas and billing
    console.log(`Tracked usage for user ${userId}:`, usageData);
  } catch (error) {
    console.error("Error tracking usage:", error);
  }
}
