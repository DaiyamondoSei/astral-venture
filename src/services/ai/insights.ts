
import { AIInsight } from './types';

/**
 * Processes and analyzes user data to extract meaningful insights
 */
export function processUserInsights(
  userData: any[], 
  includeRecommendations: boolean = true
): AIInsight[] {
  // This is a fallback implementation when the AI service is unavailable
  const insights: AIInsight[] = [];
  
  if (!userData || userData.length === 0) {
    return [];
  }
  
  // Add a simple insight based on the amount of data
  insights.push({
    id: 'local-insight-1',
    type: 'reflection',
    title: 'Your Self-Reflection Journey',
    content: `You've recorded ${userData.length} reflections. Regular self-reflection is a powerful tool for personal growth.`,
    createdAt: new Date().toISOString(),
    relevanceScore: 0.9,
    tags: ['reflection', 'growth']
  });
  
  // Add a recommendation if enabled
  if (includeRecommendations) {
    insights.push({
      id: 'local-recommendation-1',
      type: 'practice',
      title: 'Suggested Practice',
      content: 'Try beginning your day with a 5-minute meditation focused on setting your intentions for the day.',
      createdAt: new Date().toISOString(),
      relevanceScore: 0.8,
      tags: ['meditation', 'recommendation', 'morning-routine']
    });
  }
  
  return insights;
}

/**
 * Get insights that might be relevant for a user's current situation
 */
export function getContextualInsights(
  context: string, 
  previousInsights: AIInsight[] = []
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  // Check context keywords and provide relevant insights
  const lowercaseContext = context.toLowerCase();
  
  if (lowercaseContext.includes('stress') || lowercaseContext.includes('anxiety')) {
    insights.push({
      id: 'contextual-stress-1',
      type: 'meditation',
      title: 'Stress Relief Meditation',
      content: 'A simple breathing technique can help reduce stress. Try breathing in for 4 counts, holding for 4, and exhaling for 6 counts.',
      createdAt: new Date().toISOString(),
      relevanceScore: 0.95,
      tags: ['stress', 'anxiety', 'breathing']
    });
  }
  
  if (lowercaseContext.includes('sleep') || lowercaseContext.includes('rest')) {
    insights.push({
      id: 'contextual-sleep-1',
      type: 'wisdom',
      title: 'Improving Sleep Quality',
      content: 'Creating a consistent sleep schedule helps your body establish a natural rhythm. Try to go to bed and wake up at the same time each day.',
      createdAt: new Date().toISOString(),
      relevanceScore: 0.9,
      tags: ['sleep', 'rest', 'routine']
    });
  }
  
  return insights;
}
