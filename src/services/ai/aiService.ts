
import { supabase } from '@/integrations/supabase/client';
import { HistoricalReflection } from '@/components/reflection/types';

export interface AIInsight {
  id: string;
  content: string;
  category: string;
  confidence: number;
  created_at: string;
  reflection_id?: string;
}

export interface AIQuestion {
  question: string;
  context?: string;
  reflectionIds?: string[];
}

export interface AIResponse {
  answer: string;
  relatedInsights: AIInsight[];
  suggestedPractices?: string[];
}

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
 * Ask the AI assistant a question about experiences or practices
 * 
 * @param questionData - Question and optional context
 * @param userId - User ID for personalization
 * @returns AI response with answer and related content
 */
export async function askAIAssistant(
  questionData: AIQuestion,
  userId: string
): Promise<AIResponse> {
  try {
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: { 
        question: questionData.question,
        context: questionData.context,
        reflectionIds: questionData.reflectionIds,
        userId 
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    return {
      answer: "I'm sorry, I couldn't process your question at this time. Please try again later.",
      relatedInsights: []
    };
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
