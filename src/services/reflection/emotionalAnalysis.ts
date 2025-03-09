
import { api } from '@/utils/apiClient';
import { EnergyReflection, EmotionalJourney } from './types';
import { AIQuestion } from '@/services/ai/types';

/**
 * Fetch emotional journey data for a user
 * Aggregates reflection data to provide emotional insights
 */
export const fetchEmotionalJourney = async (userId: string): Promise<EmotionalJourney | null> => {
  try {
    // This would typically connect to a backend service
    // For now, return a stub implementation
    return {
      recentReflectionCount: 0,
      totalPointsEarned: 0,
      averageEmotionalDepth: 0,
      activatedChakras: [],
      dominantEmotions: [],
      lastReflectionDate: null,
      emotionalAnalysis: {},
      recentReflections: []
    };
  } catch (error) {
    console.error('Error fetching emotional journey:', error);
    return null;
  }
};

/**
 * Analyze reflection data for emotional insights
 */
export const analyzeReflectionContent = async (
  reflectionContent: string,
  userId?: string
): Promise<string | null> => {
  try {
    // Create a properly formatted question object
    const aiQuestion: AIQuestion = {
      text: "Analyze the emotional content of this reflection",
      context: reflectionContent,
      userId
    };
    
    const response = await api.getAiResponse(aiQuestion);
    return response.answer;
  } catch (error) {
    console.error('Error analyzing reflection content:', error);
    return null;
  }
};
