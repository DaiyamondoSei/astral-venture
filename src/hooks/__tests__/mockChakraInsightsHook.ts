
import { AIInsight } from '@/services/ai/types';

// This mock adapter translates between the old and new API formats
export const mockChakraInsights = {
  getPersonalizedInsights: jest.fn().mockResolvedValue({
    personalizedInsights: ['Insight 1', 'Insight 2'],
    practiceRecommendations: ['Practice 1', 'Practice 2']
  }),
  
  // Helper to format response from new format to old format
  adaptResponse: (
    insights: AIInsight[], 
    recommendations: string[]
  ) => {
    return {
      personalizedInsights: insights.map(i => i.content),
      practiceRecommendations: recommendations
    };
  }
};
