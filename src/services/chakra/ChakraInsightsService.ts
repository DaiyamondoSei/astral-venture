
/**
 * ChakraInsightsService
 * Service for generating insights related to chakras and energy centers
 */
import { AIInsight, AIResponse, AIQuestion, AIQuestionOptions } from '../ai/types';
import { askAIAssistant } from '../ai/assistant';

// Define chakra names for easier reference
const chakraNames = {
  root: 'Root',
  sacral: 'Sacral',
  solarPlexus: 'Solar Plexus',
  heart: 'Heart',
  throat: 'Throat',
  thirdEye: 'Third Eye',
  crown: 'Crown'
};

// Map normalized chakra data to user-friendly names
const normalizeChakraData = (chakraData) => {
  return Object.entries(chakraData).reduce((acc, [key, value]) => {
    acc[chakraNames[key] || key] = value;
    return acc;
  }, {});
};

export const ChakraInsightsService = {
  /**
   * Ask a question to the AI assistant
   */
  askQuestion: async (question: string | AIQuestion, options?: AIQuestionOptions): Promise<AIResponse> => {
    return askAIAssistant(question, options);
  },

  /**
   * Get insights based on chakra activity
   */
  getInsights: async (userId: string, chakras?: Record<string, number>): Promise<AIInsight[]> => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Example chakra data if not provided
      const chakraData = chakras || {
        root: 0.6,
        sacral: 0.75,
        solarPlexus: 0.4,
        heart: 0.8,
        throat: 0.5,
        thirdEye: 0.7,
        crown: 0.3
      };

      // Normalize chakra data
      const normalizedChakras = normalizeChakraData(chakraData);

      // Request insights from AI based on chakra activity
      const question: AIQuestion = {
        text: `Generate insights for user based on their chakra activity: ${JSON.stringify(normalizedChakras)}`,
        userId,
        context: 'chakra_insights'
      };

      const aiResponse = await askAIAssistant(question);

      // Generate insights from AI response
      const insights: AIInsight[] = [
        {
          id: 'chakra-insight-1',
          type: 'meditation',
          title: 'Chakra Balancing',
          content: aiResponse.answer,
          createdAt: new Date().toISOString()
        },
        {
          id: 'chakra-insight-2',
          type: 'practice',
          title: 'Recommended Practices',
          content: aiResponse.suggestedPractices?.join('\n') || 'No practices suggested.',
          createdAt: new Date().toISOString()
        }
      ];

      return insights;
    } catch (error) {
      console.error('Error getting chakra insights:', error);
      return [];
    }
  },

  /**
   * Generate reflection prompts based on chakra activity
   */
  generateReflection: async (topic: string): Promise<string> => {
    try {
      const question: AIQuestion = {
        text: `Generate a reflection prompt about ${topic} for spiritual growth.`,
        context: 'reflection_generation'
      };

      const aiResponse = await askAIAssistant(question);
      return aiResponse.answer;
    } catch (error) {
      console.error('Error generating reflection:', error);
      return 'What insights have you gained about yourself today?';
    }
  },

  /**
   * Get personalized recommendations based on user data
   */
  getPersonalizedRecommendations: async (userId: string, topics?: string[]): Promise<string[]> => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const topicsText = topics && topics.length > 0 
        ? `focusing on the following topics: ${topics.join(', ')}`
        : 'based on their overall spiritual journey';

      const question: AIQuestion = {
        text: `Generate personalized practice recommendations for user ${topicsText}.`,
        userId,
        context: 'personalized_recommendations'
      };

      const aiResponse = await askAIAssistant(question);
      return aiResponse.suggestedPractices || [];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [
        'Practice mindful breathing for 5 minutes',
        'Journal about your emotions',
        'Connect with nature'
      ];
    }
  },

  /**
   * Get personalized insights (alias for backwards compatibility)
   */
  getPersonalizedInsights: async (userId: string, chakras?: Record<string, number>): Promise<AIInsight[]> => {
    return ChakraInsightsService.getInsights(userId, chakras);
  }
};

export default ChakraInsightsService;
