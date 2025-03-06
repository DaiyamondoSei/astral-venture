
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
  },
  {
    question_type: "consciousness",
    answer: "Consciousness is the awareness of your existence and the world around you. Expanding your consciousness involves becoming more aware of your thoughts, emotions, and the interconnectedness of all things.",
    practices: [
      "Practice mindful awareness throughout your daily activities",
      "Explore different states of consciousness through meditation",
      "Keep a consciousness journal to track your insights"
    ]
  },
  {
    question_type: "intuition",
    answer: "Intuition is your inner guidance system, a form of knowing that transcends logical reasoning. Developing your intuition helps you make decisions aligned with your higher self and true purpose.",
    practices: [
      "Take a few minutes each day to sit quietly and listen to your inner voice",
      "Practice intuitive decision-making on small daily choices",
      "Notice and record intuitive insights that prove accurate"
    ]
  }
];

// Common questions and their cached responses to avoid repeated API calls
const CACHED_RESPONSES = new Map<string, {
  answer: string;
  suggestedPractices: string[];
  timestamp: number;
}>();

// Maximum age for cached responses in milliseconds (1 day)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

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
    energy: ["energy", "vibration", "frequency", "aura", "field", "spiritual", "practice"],
    consciousness: ["conscious", "awareness", "awaken", "perception", "mindful", "presence"],
    intuition: ["intuition", "gut feeling", "inner voice", "insight", "knowing", "guidance"]
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
 * Check if there's a cached response for the question
 * @param question User's question
 * @returns Cached response if available, null otherwise
 */
function getCachedResponse(question: string): {
  answer: string;
  suggestedPractices: string[];
} | null {
  // Normalize the question to improve cache hits
  const normalizedQuestion = question.toLowerCase().trim();
  
  // Common prefixes to remove for better matching
  const prefixes = [
    "can you tell me about", "what is", "how do i", "explain", 
    "tell me about", "i want to know about", "please explain"
  ];
  
  // Try to match any cached response
  for (const [cachedQuestion, cachedResponse] of CACHED_RESPONSES.entries()) {
    // Skip expired cache entries
    if (Date.now() - cachedResponse.timestamp > MAX_CACHE_AGE) {
      CACHED_RESPONSES.delete(cachedQuestion);
      continue;
    }
    
    let normalizedCached = cachedQuestion.toLowerCase().trim();
    
    // If the questions are very similar, return the cached response
    if (normalizedQuestion === normalizedCached) {
      return {
        answer: cachedResponse.answer,
        suggestedPractices: cachedResponse.suggestedPractices
      };
    }
    
    // Try matching without common prefixes
    for (const prefix of prefixes) {
      const questionWithoutPrefix = normalizedQuestion.startsWith(prefix) 
        ? normalizedQuestion.substring(prefix.length).trim() 
        : normalizedQuestion;
        
      const cachedWithoutPrefix = normalizedCached.startsWith(prefix)
        ? normalizedCached.substring(prefix.length).trim()
        : normalizedCached;
        
      if (questionWithoutPrefix === cachedWithoutPrefix) {
        return {
          answer: cachedResponse.answer,
          suggestedPractices: cachedResponse.suggestedPractices
        };
      }
    }
  }
  
  return null;
}

/**
 * Cache a response for future reference
 * @param question User's question
 * @param response AI response to cache
 */
function cacheResponse(question: string, response: AIResponse): void {
  // Don't cache very short responses or if caching is disabled
  if (response.answer.length < 50 || !response.meta || response.meta.model === "fallback") {
    return;
  }
  
  // Store in cache with timestamp
  CACHED_RESPONSES.set(question, {
    answer: response.answer,
    suggestedPractices: response.suggestedPractices || [],
    timestamp: Date.now()
  });
  
  // Limit cache size to 50 entries by removing oldest if needed
  if (CACHED_RESPONSES.size > 50) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of CACHED_RESPONSES.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      CACHED_RESPONSES.delete(oldestKey);
    }
  }
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
    // Check for cached response first
    const cachedResponse = getCachedResponse(questionData.question);
    if (cachedResponse) {
      console.log("Using cached response for question");
      return {
        answer: cachedResponse.answer,
        relatedInsights: [],
        suggestedPractices: cachedResponse.suggestedPractices,
        meta: {
          model: "cached",
          tokenUsage: 0,
          processingTime: 0
        }
      };
    }
    
    // Prepare request data
    const requestData = { 
      message: questionData.question,
      context: questionData.context,
      reflectionIds: questionData.reflectionIds,
      stream: questionData.stream || false,
      userId 
    };
    
    console.log("Sending request to AI assistant:", requestData);
    
    // Call the Supabase Edge Function
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
    const response = {
      answer: data.response || data.answer,
      relatedInsights: data.insights || [],
      suggestedPractices: data.suggestedPractices || [],
      meta
    };
    
    // Cache the response for future use
    cacheResponse(questionData.question, response);
    
    return response;
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
