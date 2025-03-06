
import { supabase } from '@/integrations/supabase/client';
import { HistoricalReflection } from '@/components/reflection/types';

export interface AIInsight {
  id?: string;
  content: string;
  category: string;
  confidence?: number;
  relevance?: number;
  created_at?: string;
  reflection_id?: string;
}

export interface AIQuestion {
  question: string;
  context?: string;
  reflectionIds?: string[];
  stream?: boolean;
}

export interface AIResponse {
  answer: string;
  relatedInsights: AIInsight[];
  suggestedPractices?: string[];
  meta?: {
    model?: string;
    tokenUsage?: number;
    processingTime?: number;
  };
}

// Supported AI models
export type AIModel = 
  | "gpt-4o"         // High quality, higher cost, slower
  | "gpt-4o-mini";   // Good quality, lower cost, faster

// Fallback responses for when AI service is unavailable
const FALLBACK_RESPONSES = [
  {
    question_type: "meditation",
    answer: "Meditation is a powerful practice for cultivating inner peace and awareness. Start with just 5 minutes of focusing on your breath, allowing thoughts to pass without judgment. Consistency is more important than duration.",
    practices: [
      "Focus on your breath for 5 minutes each morning",
      "Practice body scanning meditation before sleep",
      "Try a guided meditation app for structured practice"
    ]
  },
  {
    question_type: "chakra",
    answer: "Chakras are energy centers that influence our physical, emotional, and spiritual wellbeing. When balanced, they allow energy to flow freely throughout your body, promoting harmony and vitality.",
    practices: [
      "Visualize each chakra glowing with its corresponding color",
      "Use sound healing with chakra-specific frequencies",
      "Practice yoga poses that target specific chakras"
    ]
  },
  {
    question_type: "energy",
    answer: "Your energy field is constantly interacting with your environment and others around you. Maintaining healthy boundaries and regular energy clearing practices can help you stay centered and vibrant.",
    practices: [
      "Visualize a protective light surrounding your body",
      "Practice grounding by connecting with nature",
      "Use salt baths to clear your energy field"
    ]
  }
];

/**
 * Find the best fallback response based on the question content
 * @param question User's question
 * @returns Best matching fallback response
 */
function findFallbackResponse(question: string): {answer: string; practices: string[]} {
  // Keywords to match against question types
  const keywordMap = {
    meditation: ["meditate", "meditation", "breathe", "breathing", "mindful", "focus", "calm"],
    chakra: ["chakra", "energy center", "root", "sacral", "solar plexus", "heart", "throat", "third eye", "crown"],
    energy: ["energy", "vibration", "frequency", "aura", "field", "spiritual", "practice"]
  };
  
  // Score each response type based on keyword matches
  const scores = FALLBACK_RESPONSES.map(response => {
    const type = response.question_type as keyof typeof keywordMap;
    const keywords = keywordMap[type] || [];
    
    // Count how many keywords match
    const score = keywords.reduce((count, keyword) => {
      return count + (question.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    return { response, score };
  });
  
  // Find best matching response
  const bestMatch = scores.sort((a, b) => b.score - a.score)[0];
  
  // If nothing matches well, use the first fallback
  if (bestMatch.score === 0) {
    return { 
      answer: FALLBACK_RESPONSES[0].answer, 
      practices: FALLBACK_RESPONSES[0].practices 
    };
  }
  
  return { 
    answer: bestMatch.response.answer, 
    practices: bestMatch.response.practices 
  };
}

/**
 * Process user reflections to generate AI insights
 * 
 * @param reflections - Array of user reflections to analyze
 * @returns Array of AI insights generated from the reflections
 */
export async function generateInsightsFromReflections(
  reflections: HistoricalReflection[]
): Promise<AIInsight[]> {
  try {
    // First, we prepare the reflection data
    const reflectionTexts = reflections.map(r => ({
      id: r.id,
      content: r.content,
      dominant_emotion: r.dominant_emotion,
      chakras_activated: r.chakras_activated,
      emotional_depth: r.emotional_depth,
      created_at: r.created_at
    }));
    
    // Call our Supabase Edge Function for AI analysis
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { reflections: reflectionTexts }
    });
    
    if (error) throw error;
    
    return data.insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

/**
 * Ask the AI assistant a question about experiences or practices
 * 
 * @param questionData - Question and optional context
 * @param userId - User ID for personalization
 * @returns AI response with answer and related content
 */
export async function askAIAssistant(
  questionData: AIQuestion,
  userId: string
): Promise<AIResponse> {
  try {
    // Call our Supabase Edge Function
    const requestData = { 
      message: questionData.question,
      context: questionData.context,
      reflectionIds: questionData.reflectionIds,
      stream: questionData.stream || false,
      userId 
    };
    
    console.log("Sending request to AI assistant:", requestData);
    
    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: requestData
    });
    
    if (error) {
      console.error("Error from ask-assistant function:", error);
      // Handle quota errors specifically
      if (error.message && error.message.includes("quota")) {
        throw new Error("AI service quota exceeded. Please try again later.");
      }
      throw error;
    }
    
    console.log("Received response from AI assistant:", data);
    
    // Extract metadata if available
    const meta = {
      model: data.meta?.model || "unknown",
      tokenUsage: data.meta?.tokenUsage || 0,
      processingTime: data.meta?.processingTime || 0
    };
    
    // Structure the response
    return {
      answer: data.response || data.answer,
      relatedInsights: data.insights || [],
      suggestedPractices: data.suggestedPractices || [],
      meta
    };
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    
    // Use fallback response in case of error
    const fallback = findFallbackResponse(questionData.question);
    
    return {
      answer: `I'm sorry, I couldn't process your question at this time. ${fallback.answer}`,
      relatedInsights: [],
      suggestedPractices: fallback.practices,
      meta: {
        model: "fallback",
        tokenUsage: 0,
        processingTime: 0
      }
    };
  }
}

/**
 * Get personalized practice recommendations based on user history
 * 
 * @param userId - User ID for personalization
 * @returns Array of practice recommendations
 */
export async function getPersonalizedRecommendations(
  userId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-recommendations', {
      body: { userId }
    });
    
    if (error) throw error;
    
    return data.recommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [
      "Practice mindful breathing for 5 minutes",
      "Try a chakra balancing meditation",
      "Journal about your energy experiences"
    ];
  }
}

// Export all functions as an object for easier imports
export const aiService = {
  generateInsightsFromReflections,
  askAIAssistant,
  getPersonalizedRecommendations
};
