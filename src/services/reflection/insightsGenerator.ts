
import { api } from '@/utils/apiClient';
import { AIQuestion } from '@/services/ai/types';

/**
 * Get AI insights for reflections
 */
export const getReflectionInsights = async (
  reflectionId?: string, 
  reflectionContent?: string,
  question: string = "What insights can you provide about this reflection?"
): Promise<string | null> => {
  try {
    // Create a properly formatted question object
    const aiQuestion: AIQuestion = {
      text: question,
      context: reflectionContent,
      reflectionIds: reflectionId ? [reflectionId] : []
    };
    
    return await api.getAiResponse(aiQuestion)
      .then(data => data.response);
  } catch (error) {
    console.error('Error getting reflection insights:', error);
    return null;
  }
};
