
import { api } from '@/utils/apiClient';

/**
 * Get AI insights for reflections
 */
export const getReflectionInsights = async (
  reflectionId?: string, 
  reflectionContent?: string,
  question: string = "What insights can you provide about this reflection?"
): Promise<string | null> => {
  try {
    return await api.getAiResponse(question, reflectionId, reflectionContent)
      .then(data => data.response);
  } catch (error) {
    console.error('Error getting reflection insights:', error);
    return null;
  }
};
