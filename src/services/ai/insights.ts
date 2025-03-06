
import { supabase } from '@/integrations/supabase/client';
import { HistoricalReflection } from '@/components/reflection/types';
import { AIInsight } from './types';

/**
 * Process user reflections to generate AI insights
 * 
 * @param reflections - Array of user reflections to analyze
 * @returns Array of AI insights generated from the reflections
 */
export async function generateInsightsFromReflections(
  reflections: HistoricalReflection[]
): Promise<AIInsight[]> {
  try {
    // First, we prepare the reflection data
    const reflectionTexts = reflections.map(r => ({
      id: r.id,
      content: r.content,
      dominant_emotion: r.dominant_emotion,
      chakras_activated: r.chakras_activated,
      emotional_depth: r.emotional_depth,
      created_at: r.created_at
    }));
    
    // Call our Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { reflections: reflectionTexts }
    });
    
    if (error) throw error;
    
    return data.insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

/**
 * Get personalized practice recommendations based on user history
 * 
 * @param userId - User ID for personalization
 * @returns Array of practice recommendations
 */
export async function getPersonalizedRecommendations(
  userId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      body: { userId }
    });
    
    if (error) throw error;
    
    return data.recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [
      "Practice mindful breathing for 5 minutes",
      "Try a chakra balancing meditation",
      "Journal about your energy experiences"
    ];
  }
}
