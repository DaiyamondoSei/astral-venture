
// Updated to fix the issue with missing imports
import { api, ApiError } from '@/utils/apiClient';
import { toast } from '@/components/ui/use-toast';

// Function to generate insights from user reflections
export const generateInsightsFromReflections = async (
  reflections: any[],
  userId: string
): Promise<any> => {
  try {
    if (!reflections || reflections.length === 0) {
      throw new Error('No reflections provided for insight generation');
    }

    // Use our standardized API client
    const insights = await api.generateInsights(reflections, userId);
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    
    // Format error message based on error type
    const errorMessage = error instanceof ApiError
      ? `${error.message} (${error.code})`
      : error.message || 'An unknown error occurred';
    
    toast({
      title: "Failed to generate insights",
      description: errorMessage,
      variant: "destructive"
    });
    return [];
  }
};

// Function to get AI assistant response for a specific reflection
export const getAIAssistantResponse = async (
  message: string,
  reflectionId?: string,
  reflectionContent?: string
): Promise<string | null> => {
  try {
    // Use our standardized API client
    const response = await api.getAiResponse(message, reflectionId, reflectionContent);
    return response.response;
  } catch (error) {
    console.error('Error getting AI assistant response:', error);
    
    // Format error message based on error type
    const errorMessage = error instanceof ApiError
      ? `${error.message} (${error.code})`
      : error.message || 'An unknown error occurred';
    
    toast({
      title: "AI Assistant Error",
      description: errorMessage,
      variant: "destructive"
    });
    return null;
  }
};

// Export the getReflectionInsights function to fix imports
export const getReflectionInsights = getAIAssistantResponse;
