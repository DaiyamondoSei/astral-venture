
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Types for API responses
type ApiSuccessResponse<T> = {
  status: 'success';
  data: T;
  meta?: {
    processingTime?: number;
    version?: string;
  };
};

type ApiErrorResponse = {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    version?: string;
  };
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Function to generate insights from user reflections
export const generateInsightsFromReflections = async (
  reflections: any[],
  userId: string
): Promise<any> => {
  try {
    if (!reflections || reflections.length === 0) {
      throw new Error('No reflections provided for insight generation');
    }

    // Call our edge function
    const { data, error } = await supabase.functions.invoke<ApiResponse<{
      insights: any[];
    }>>('generate-insights', {
      body: { reflections, userId },
    });

    if (error) {
      console.error('Error calling generate-insights function:', error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }

    // Check for API error response
    if (data.status === 'error') {
      console.error('API returned error:', data.error);
      throw new Error(`API error: ${data.error.message}`);
    }

    // Return the generated insights
    return data.data.insights;
  } catch (error: any) {
    console.error('Error generating insights:', error);
    toast({
      title: "Failed to generate insights",
      description: error.message,
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
    // Call our ask-assistant edge function with standardized response handling
    const { data, error } = await supabase.functions.invoke<ApiResponse<{
      response: string;
      insights: any[];
      reflectionId?: string;
    }>>('ask-assistant', {
      body: { 
        message, 
        reflectionId, 
        reflectionContent 
      },
    });

    if (error) {
      console.error('Error calling ask-assistant function:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }

    // Check for API error response
    if (data.status === 'error') {
      console.error('API returned error:', data.error);
      throw new Error(`API error: ${data.error.message}`);
    }

    // Return the AI response
    return data.data.response;
  } catch (error: any) {
    console.error('Error getting AI assistant response:', error);
    toast({
      title: "AI Assistant Error",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
};
