
import { createInsightPrompt, createEmotionalAnalysisPrompt } from "../utils/promptUtils.ts";
import { ContextData } from "../types.ts";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch user context data to enhance AI responses
 */
export async function fetchUserContext(userId: string) {
  try {
    // In a production app, we would fetch user profile, preferences,
    // and history from the database to personalize responses
    return {
      userId,
      interactionHistory: [],
      preferences: {},
      practiceLevel: "beginner"
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return {
      userId,
      practiceLevel: "beginner"
    };
  }
}

/**
 * Fetch additional context data from the database
 */
export async function fetchContextData(
  supabase: SupabaseClient,
  userId?: string,
  reflectionId?: string
): Promise<ContextData> {
  const contextData: ContextData = {};
  
  if (!userId) return contextData;
  
  try {
    // Get user profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('astral_level, energy_points, username')
      .eq('id', userId)
      .single();
      
    if (profile) {
      contextData.userProfile = {
        userLevel: profile.astral_level,
        energyPoints: profile.energy_points,
        username: profile.username
      };
    }
    
    // If reflection ID is provided, get that specific reflection
    if (reflectionId) {
      const { data: reflection } = await supabase
        .from('energy_reflections')
        .select('content, dominant_emotion, emotional_depth, chakras_activated')
        .eq('id', reflectionId)
        .single();
        
      if (reflection) {
        contextData.reflection = {
          content: reflection.content,
          dominantEmotion: reflection.dominant_emotion,
          emotionalDepth: reflection.emotional_depth,
          chakrasActivated: reflection.chakras_activated
        };
      }
    }
    
    return contextData;
  } catch (error) {
    console.error("Error fetching context data:", error);
    return contextData;
  }
}

/**
 * Build a contextualized prompt with user information
 */
export function buildContextualizedPrompt(
  query: string,
  userContext: any,
  reflectionContent?: string
): string {
  // If reflection content is provided, focus on analyzing it
  if (reflectionContent) {
    return createEmotionalAnalysisPrompt(reflectionContent);
  }

  // For regular queries, add user context
  const practiceLevel = userContext?.practiceLevel || 'beginner';
  const contextPrefix = `[Context: User is a ${practiceLevel} practitioner]`;
  
  return `${contextPrefix}\n\nQuestion: ${query}`;
}

/**
 * Build rich context for the AI request
 */
export function buildRichContext(context: string | undefined, contextData: ContextData): string {
  const parts: string[] = [];
  
  // Add provided context if available
  if (context) {
    parts.push(context);
  }
  
  // Add user profile context
  if (contextData.userProfile) {
    parts.push(`User Level: ${contextData.userProfile.userLevel}`);
    parts.push(`Energy Points: ${contextData.userProfile.energyPoints}`);
    if (contextData.userProfile.username) {
      parts.push(`Username: ${contextData.userProfile.username}`);
    }
  }
  
  // Add reflection context
  if (contextData.reflection) {
    parts.push(`Reflection Content: ${contextData.reflection.content}`);
    if (contextData.reflection.dominantEmotion) {
      parts.push(`Dominant Emotion: ${contextData.reflection.dominantEmotion}`);
    }
    if (contextData.reflection.emotionalDepth) {
      parts.push(`Emotional Depth: ${contextData.reflection.emotionalDepth}`);
    }
    if (contextData.reflection.chakrasActivated) {
      parts.push(`Chakras Activated: ${contextData.reflection.chakrasActivated}`);
    }
  }
  
  return parts.join('\n');
}
