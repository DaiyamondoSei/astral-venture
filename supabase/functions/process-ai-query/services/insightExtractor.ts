
type Insight = {
  type: string;
  content: string;
  confidence?: number;
};

/**
 * Extracts structured insights from an AI response text
 */
export function extractInsights(text: string): Insight[] {
  const insights: Insight[] = [];
  
  // Look for emotional insights
  const emotionalPatterns = extractPatterns(text, [
    'emotion', 'feeling', 'mood', 'anxiety', 'joy', 'peace', 
    'frustration', 'content', 'happy', 'sad', 'anger'
  ]);
  
  if (emotionalPatterns.length > 0) {
    insights.push({
      type: 'emotional',
      content: emotionalPatterns.join('. '),
      confidence: 0.8
    });
  }
  
  // Look for chakra insights
  const chakraPatterns = extractPatterns(text, [
    'chakra', 'root', 'sacral', 'solar plexus', 'heart', 
    'throat', 'third eye', 'crown', 'energy center'
  ]);
  
  if (chakraPatterns.length > 0) {
    insights.push({
      type: 'chakra',
      content: chakraPatterns.join('. '),
      confidence: 0.75
    });
  }
  
  // Look for practice recommendations
  const practicePatterns = extractPatterns(text, [
    'practice', 'meditat', 'breathe', 'exercise', 'journal', 
    'reflect', 'mindful', 'technique', 'ritual'
  ]);
  
  if (practicePatterns.length > 0) {
    insights.push({
      type: 'practice',
      content: practicePatterns.join('. '),
      confidence: 0.7
    });
  }
  
  // Look for awareness insights
  const awarenessPatterns = extractPatterns(text, [
    'aware', 'conscious', 'present', 'mindful', 'attentive', 
    'observe', 'notice', 'perspective'
  ]);
  
  if (awarenessPatterns.length > 0) {
    insights.push({
      type: 'awareness',
      content: awarenessPatterns.join('. '),
      confidence: 0.65
    });
  }
  
  return insights;
}

/**
 * Helper to extract sentences containing specific keywords
 */
function extractPatterns(text: string, keywords: string[]): string[] {
  // Split the text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Find sentences containing keywords
  const matches = new Set<string>();
  
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        matches.add(sentence.trim());
        break;
      }
    }
  }
  
  return Array.from(matches);
}

/**
 * Track query usage for analytics
 */
export async function trackUsage(
  supabaseClient: any, 
  userId: string, 
  metrics: {
    model: string;
    tokensUsed: number;
    queryType: string;
    processingTime: number;
    answerLength: number;
    insightsCount: number;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await supabaseClient
      .from('ai_usage_metrics')
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
  } catch (error) {
    console.error("Error tracking usage:", error);
    // Non-blocking - we don't want to fail the main function if tracking fails
  }
}
