
/**
 * Service for providing chakra insights and analysis
 */

import { AIResponse, AIInsight } from '@/services/ai/types';
import { askAIAssistant } from '@/services/ai/assistant';

// Define chakra types and data
const chakraNames = ['root', 'sacral', 'solar_plexus', 'heart', 'throat', 'third_eye', 'crown'];

// Mock chakra activation data
const chakraActivations = {
  root: 0.6,
  sacral: 0.45,
  solar_plexus: 0.8,
  heart: 0.7,
  throat: 0.3,
  third_eye: 0.5,
  crown: 0.4
};

// Normalize chakra data for API
const normalizeChakraData = (chakras: Record<string, number>) => {
  return Object.entries(chakras).map(([name, value]) => ({
    chakra: name,
    activation: value
  }));
};

/**
 * Get personalized insights based on chakra activations
 */
export async function getPersonalizedInsights(userId: string, chakras?: Record<string, number>): Promise<AIInsight[]> {
  try {
    const userChakras = chakras || chakraActivations;
    const normalizedChakras = normalizeChakraData(userChakras);
    
    // Get most activated chakras
    const sortedChakras = Object.entries(userChakras)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);
    
    // Generate insights from AI
    const response = await askAIAssistant({
      text: `Provide insights for user with most active chakras: ${sortedChakras.join(', ')}`,
      context: `User chakra data: ${JSON.stringify(normalizedChakras)}`,
      userId
    });
    
    // Parse insights from response
    const insights: AIInsight[] = [
      {
        id: `insight-${Date.now()}-1`,
        type: 'energy',
        title: 'Energy Balance Insight',
        content: response.answer.substring(0, 150) + '...',
        createdAt: new Date().toISOString(),
        tags: sortedChakras
      },
      {
        id: `insight-${Date.now()}-2`,
        type: 'meditation',
        title: 'Recommended Meditation Focus',
        content: response.suggestedPractices?.[0] || 'Focus on balancing your energy centers through mindful meditation',
        createdAt: new Date().toISOString(),
        tags: ['meditation', ...sortedChakras]
      }
    ];
    
    return insights;
  } catch (error) {
    console.error('Error getting personalized insights:', error);
    
    // Return fallback insights
    return [{
      id: `insight-fallback-${Date.now()}`,
      type: 'energy',
      title: 'Energy Balance',
      content: 'Focus on balancing your energy centers through consistent practice',
      createdAt: new Date().toISOString(),
      tags: ['balance', 'energy']
    }];
  }
}

/**
 * Get personalized recommendations based on user data
 */
export async function getPersonalizedRecommendations(userId: string, topics?: string[]): Promise<string[]> {
  try {
    // Default topics if none provided
    const focusTopics = topics || ['meditation', 'reflection', 'energy'];
    
    // Generate recommendations from AI
    const response = await askAIAssistant({
      text: `Provide personalized recommendations for topics: ${focusTopics.join(', ')}`,
      userId
    });
    
    // Extract recommendations
    if (response.suggestedPractices && response.suggestedPractices.length > 0) {
      return response.suggestedPractices;
    }
    
    // Parse recommendations from text if not explicitly provided
    const recommendations = response.answer
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3);
    
    return recommendations.length > 0 ? recommendations : ['Meditation', 'Breathwork', 'Reflection'];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    
    // Return fallback recommendations
    return ['Daily meditation', 'Reflection journaling', 'Energy alignment'];
  }
}

/**
 * Export for use in other services
 */
export const ChakraInsightsService = {
  askQuestion: askAIAssistant,
  getInsights: getPersonalizedInsights,
  generateReflection: async (topic: string) => {
    try {
      const response = await askAIAssistant({
        text: `Generate a reflection prompt about: ${topic}`
      });
      return response.answer;
    } catch (error) {
      console.error('Error generating reflection:', error);
      return `Reflect on your experience with ${topic}`;
    }
  },
  getPersonalizedRecommendations
};
