
import { AIInsight } from '@/services/ai/types';

// Define the options type for the mock to match the real hook's expectations
export interface ChakraInsightsOptions {
  focusChakras?: number[];
  includeRecommendations?: boolean;
  maxItems?: number;
}

// This mock adapter translates between the old and new API formats
export const mockChakraInsights = {
  getPersonalizedInsights: jest.fn().mockResolvedValue({
    insights: [
      { id: '1', content: 'Insight 1', type: 'meditation', title: 'Insight One', createdAt: new Date().toISOString() },
      { id: '2', content: 'Insight 2', type: 'reflection', title: 'Insight Two', createdAt: new Date().toISOString() }
    ],
    recommendations: ['Practice 1', 'Practice 2']
  }),
  
  // New version of getPersonalizedInsights that returns properly typed data
  getInsights: jest.fn((userId: string, chakras?: Record<string, boolean>, options?: ChakraInsightsOptions) => {
    return Promise.resolve({
      insights: [
        { id: '1', content: 'Insight 1', type: 'meditation', title: 'Insight One', createdAt: new Date().toISOString() },
        { id: '2', content: 'Insight 2', type: 'reflection', title: 'Insight Two', createdAt: new Date().toISOString() }
      ],
      recommendations: ['Practice 1', 'Practice 2']
    });
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

// Export a mock hook that follows the expected interface
export const mockUseChakraInsights = () => ({
  insights: [
    { id: '1', content: 'Insight 1', type: 'meditation', title: 'Insight One', createdAt: new Date().toISOString() },
    { id: '2', content: 'Insight 2', type: 'reflection', title: 'Insight Two', createdAt: new Date().toISOString() }
  ],
  recommendations: ['Practice 1', 'Practice 2'],
  loading: false,
  error: '',
  getInsightByType: (type: string) => ({ id: '1', content: 'Insight 1', type, title: 'Insight', createdAt: new Date().toISOString() }),
  getAllInsights: () => [
    { id: '1', content: 'Insight 1', type: 'meditation', title: 'Insight One', createdAt: new Date().toISOString() },
    { id: '2', content: 'Insight 2', type: 'reflection', title: 'Insight Two', createdAt: new Date().toISOString() }
  ],
  getRecommendations: () => ['Practice 1', 'Practice 2'],
  refreshInsights: () => Promise.resolve(true),
  personalizedInsights: ['Insight 1', 'Insight 2'],
  practiceRecommendations: ['Practice 1', 'Practice 2']
});

export default mockChakraInsights;
