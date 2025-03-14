
import { AIResponse, AIServiceOptions, EmotionalAnalysisResult } from './types';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';

// Default options for AI service requests
const defaultOptions: AIServiceOptions = {
  useCache: true,
  showLoadingToast: true,
  showErrorToast: true,
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Get a response from the AI service
 * 
 * @param query The query to send to the AI
 * @param options Configuration options
 * @returns AI response object
 */
export async function getAIResponse(
  query: string,
  options: Partial<AIServiceOptions> = {}
): Promise<AIResponse> {
  const mergedOptions = { ...defaultOptions, ...options };
  let toastId;

  try {
    // Show loading toast if enabled
    if (mergedOptions.showLoadingToast) {
      toastId = toast.loading('Processing your request...', {
        duration: 10000
      });
    }

    // Call the AI processor edge function
    const { data, error } = await supabase.functions.invoke('ai-processor-enhanced', {
      body: {
        action: 'query',
        query,
        model: mergedOptions.model,
        temperature: mergedOptions.temperature,
        maxTokens: mergedOptions.maxTokens,
        useCache: mergedOptions.useCache
      }
    });

    // Handle errors from the edge function
    if (error) {
      console.error('Error calling AI processor:', error);
      
      if (mergedOptions.showErrorToast) {
        toast.error('Unable to process your request. Please try again later.');
      }
      
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      throw new Error(`AI processing error: ${error.message}`);
    }

    // Format the response
    const aiResponse: AIResponse = {
      answer: data.result,
      type: 'markdown',
      meta: {
        model: mergedOptions.model,
        tokenUsage: 0, // This would come from the actual API response
        processingTime: data.processingTime || 0,
        cached: data.cached || false
      }
    };

    // Dismiss loading toast if it exists
    if (toastId) {
      toast.dismiss(toastId);
    }

    return aiResponse;
  } catch (error) {
    console.error('Error in AI processing service:', error);
    
    if (mergedOptions.showErrorToast) {
      toast.error('An error occurred while processing your request.');
    }
    
    if (toastId) {
      toast.dismiss(toastId);
    }
    
    // Return error response
    return {
      answer: 'I apologize, but I encountered an error processing your request. Please try again later.',
      type: 'text',
      meta: {
        model: mergedOptions.model,
        tokenUsage: 0,
        processingTime: 0
      }
    };
  }
}

/**
 * Analyze a reflection entry for emotional insights
 * 
 * @param reflectionContent The reflection text to analyze
 * @param options Configuration options
 * @returns Analysis results
 */
export async function analyzeReflection(
  reflectionContent: string,
  options: Partial<AIServiceOptions> = {},
  userId?: string
): Promise<EmotionalAnalysisResult> {
  const mergedOptions = { ...defaultOptions, ...options };
  let toastId;

  try {
    // Show loading toast if enabled
    if (mergedOptions.showLoadingToast) {
      toastId = toast.loading('Analyzing your reflection...', {
        duration: 10000
      });
    }

    // Call the AI processor edge function for reflection analysis
    const { data, error } = await supabase.functions.invoke('ai-processor-enhanced', {
      body: {
        action: 'analyze_reflection',
        reflectionContent,
        userId,
        useCache: mergedOptions.useCache
      }
    });

    // Handle errors from the edge function
    if (error) {
      console.error('Error analyzing reflection:', error);
      
      if (mergedOptions.showErrorToast) {
        toast.error('Unable to analyze your reflection. Please try again later.');
      }
      
      if (toastId) {
        toast.dismiss(toastId);
      }
      
      throw new Error(`Reflection analysis error: ${error.message}`);
    }

    // Format the analysis result
    const result = data.result.analysisResult;
    
    // Parse raw analysis into structured format
    // This is a simplified parser - in production, you would want a more robust solution
    const emotionalAnalysis: EmotionalAnalysisResult = {
      emotions: extractEmotions(result),
      chakras: extractChakras(result),
      insights: extractInsights(result),
      recommendedPractices: extractRecommendations(result),
      rawAnalysis: result
    };

    // Dismiss loading toast if it exists
    if (toastId) {
      toast.dismiss(toastId);
    }

    return emotionalAnalysis;
  } catch (error) {
    console.error('Error in reflection analysis service:', error);
    
    if (mergedOptions.showErrorToast) {
      toast.error('An error occurred while analyzing your reflection.');
    }
    
    if (toastId) {
      toast.dismiss(toastId);
    }
    
    // Return empty analysis
    return {
      emotions: [],
      chakras: [],
      insights: [],
      recommendedPractices: [],
      rawAnalysis: 'Analysis failed'
    };
  }
}

// Helper functions to extract structured data from raw analysis text

function extractEmotions(text: string): Array<{ name: string; intensity: number }> {
  // Simple pattern matching - in production use more robust NLP
  const emotions: Array<{ name: string; intensity: number }> = [];
  
  // Look for emotions section in the text
  const emotionsMatch = text.match(/Primary emotions identified:?([\s\S]*?)(?=\d\.|$)/i);
  
  if (emotionsMatch && emotionsMatch[1]) {
    const emotionsSection = emotionsMatch[1].trim();
    const emotionLines = emotionsSection.split('\n').filter(line => line.trim().length > 0);
    
    emotionLines.forEach(line => {
      // Try to extract emotion name and intensity
      const matches = line.match(/[-•*]?\s*([A-Za-z\s]+)(?:[:-]\s*)?(\d+)?/);
      if (matches && matches[1]) {
        const name = matches[1].trim();
        // Generate random intensity if not provided
        const intensity = matches[2] ? parseInt(matches[2]) : Math.floor(Math.random() * 100);
        emotions.push({ name, intensity: Math.min(intensity, 100) });
      }
    });
  }
  
  return emotions.length > 0 ? emotions : [
    { name: 'Neutral', intensity: 50 }
  ];
}

function extractChakras(text: string): Array<{ name: string; activation: number }> {
  // Simple pattern matching - in production use more robust NLP
  const chakras: Array<{ name: string; activation: number }> = [];
  
  // Look for chakras section in the text
  const chakrasMatch = text.match(/Chakra centers most active[^:]*:?([\s\S]*?)(?=\d\.|$)/i);
  
  if (chakrasMatch && chakrasMatch[1]) {
    const chakrasSection = chakrasMatch[1].trim();
    const chakraLines = chakrasSection.split('\n').filter(line => line.trim().length > 0);
    
    chakraLines.forEach(line => {
      // Try to extract chakra name and activation
      const matches = line.match(/[-•*]?\s*([A-Za-z\s]+)(?:[:-]\s*)?(\d+)?/);
      if (matches && matches[1]) {
        const name = matches[1].trim();
        // Generate random activation if not provided
        const activation = matches[2] ? parseInt(matches[2]) : Math.floor(Math.random() * 100);
        chakras.push({ name, activation: Math.min(activation, 100) });
      }
    });
  }
  
  return chakras.length > 0 ? chakras : [
    { name: 'Base', activation: 50 },
    { name: 'Solar Plexus', activation: 50 }
  ];
}

function extractInsights(text: string): string[] {
  // Look for insights section in the text
  const insightsMatch = text.match(/Growth opportunities and insights:?([\s\S]*?)(?=\d\.|$)/i);
  
  if (insightsMatch && insightsMatch[1]) {
    const insightsSection = insightsMatch[1].trim();
    return insightsSection.split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }
  
  return ['No specific insights detected'];
}

function extractRecommendations(text: string): string[] {
  // Look for recommendations section in the text
  const recommendationsMatch = text.match(/Personalized practice recommendations:?([\s\S]*?)(?=$)/i);
  
  if (recommendationsMatch && recommendationsMatch[1]) {
    const recommendationsSection = recommendationsMatch[1].trim();
    return recommendationsSection.split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }
  
  return ['Mindful breathing practice', 'Self-reflection journaling'];
}
