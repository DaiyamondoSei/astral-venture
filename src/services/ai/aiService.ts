
import { supabase } from '@/lib/supabaseUnified';
import { ContentRecommendation } from '@/components/ai-assistant/types';

// Get AI response to a specific question
export async function getAIResponse(question: string, options?: {
  useCache?: boolean;
  showLoadingToast?: boolean;
  showErrorToast?: boolean;
  model?: string;
}) {
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: {
        question,
        model: options?.model || 'gpt-4o-mini',
        useCache: options?.useCache ?? true
      },
    });

    if (error) {
      console.error('Error calling AI service:', error);
      throw new Error(error.message || 'Error processing your request');
    }

    return data;
  } catch (error) {
    console.error('Error in AI request:', error);
    throw error;
  }
}

// Get personalized recommendations for a user
export async function getPersonalizedRecommendations(
  userId: string,
  options?: {
    limit?: number;
    category?: string;
    contentLevel?: string;
  }
): Promise<ContentRecommendation[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      body: {
        userId,
        limit: options?.limit || 5,
        category: options?.category,
        contentLevel: options?.contentLevel
      },
    });

    if (error) {
      console.error('Error fetching personalized recommendations:', error);
      return [];
    }

    return data?.recommendations || [];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}

// Export other AI-related functions here
export const aiService = {
  getAIResponse,
  getPersonalizedRecommendations
};

export default aiService;
