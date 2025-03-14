import { AIQuestion, AIResponse } from '@/components/ai-assistant/types';
import { supabase } from '@/lib/supabaseUnified';

/**
 * Get personalized AI recommendations based on user history
 * @param userId User ID to get recommendations for
 * @returns Array of recommendation strings
 */
export async function getPersonalizedRecommendations(userId: string): Promise<string[]> {
  try {
    // First, try to get recommendations from the cache
    const { data: cachedData, error: cacheError } = await supabase
      .from('ai_recommendations_cache')
      .select('recommendations')
      .eq('user_id', userId)
      .single();

    if (!cacheError && cachedData && cachedData.recommendations) {
      return cachedData.recommendations;
    }

    // Fallback recommendations if no personalization data available
    const defaultRecommendations = [
      "Practice mindful breathing for 5 minutes daily",
      "Try a chakra balancing meditation",
      "Journal about your energy experiences",
      "Explore the energy visualization in the Practice section",
      "Complete today's suggested practice"
    ];

    // Store default recommendations in cache for future use
    await supabase
      .from('ai_recommendations_cache')
      .upsert({
        user_id: userId,
        recommendations: defaultRecommendations,
        updated_at: new Date().toISOString()
      });

    return defaultRecommendations;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    // Return fallback recommendations if there's an error
    return [
      "Practice mindful breathing for 5 minutes daily",
      "Try a chakra balancing meditation",
      "Journal about your energy experiences"
    ];
  }
}

/**
 * Ask a question to the AI assistant
 * 
 * @param question The question to ask or an AIQuestion object
 * @param options Optional configuration
 * @returns Promise with AI response
 */
export const askAIAssistant = async (
  question: string | AIQuestion,
  options: AIQuestionOptions = {}
): Promise<AIResponse> => {
  try {
    // Create a proper question object
    const questionObj: AIQuestion = typeof question === 'string' 
      ? { text: question } 
      : question;
    
    // For frontend testing/demo, we'll simulate a backend response
    await simulateBackendDelay(1500);
    
    // Create a demo response
    const response = generateDemoResponse(questionObj);
    
    return response;
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    return {
      answer: 'Sorry, I encountered an error processing your request.',
      type: 'error',
      suggestedPractices: []
    };
  }
};

/**
 * For frontend testing/demo purposes only
 * This generates a mock response
 */
function generateDemoResponse(question: AIQuestion): AIResponse {
  const { text: questionText } = question;
  
  // For demo/testing purposes
  if (questionText.toLowerCase().includes('meditation')) {
    return {
      answer: 'Meditation is a practice where an individual uses a technique – such as mindfulness, or focusing the mind on a particular object, thought, or activity – to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.',
      type: 'text',
      suggestedPractices: [
        'Mindful breathing meditation',
        'Body scan meditation',
        'Loving-kindness meditation'
      ],
      meta: {
        model: 'gpt-4o-mini',
        tokenUsage: 205,
        processingTime: 342
      }
    };
  }
  
  if (questionText.toLowerCase().includes('chakra')) {
    return {
      answer: 'Chakras are the energy centers in your body. According to ancient texts, there are 7 main chakras that align along your spine, from the base to the crown of your head. Each is associated with specific physical, psychological, and spiritual aspects of well-being.',
      type: 'text',
      suggestedPractices: [
        'Root chakra meditation',
        'Chakra balancing yoga',
        'Sound healing with chakra frequencies'
      ],
      meta: {
        model: 'gpt-4o',
        tokenUsage: 368,
        processingTime: 512
      }
    };
  }
  
  // Default response
  return {
    answer: `I've received your question: "${questionText}". This is a simulated AI response for development purposes. In a production environment, this would connect to an actual AI service.`,
    type: 'text',
    suggestedPractices: [
      'Mindful breathing',
      'Gratitude journaling',
      'Nature connection practice'
    ],
    meta: {
      model: 'gpt-3.5-turbo',
      tokenUsage: 125,
      processingTime: 278
    }
  };
}

/**
 * Process question with AI service
 * @param question AIQuestion object to process
 * @returns Promise with AI response
 */
export async function processAIQuestion(question: AIQuestion): Promise<AIResponse> {
  // Implementation would go here
  // For now, return a mock response
  return {
    answer: `This is a response to your question: "${question.text}"`,
    type: 'text',
    meta: {
      model: 'gpt-4o-mini',
      tokenUsage: 150,
      processingTime: 2.3
    }
  };
}
