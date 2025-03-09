
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ContextData } from "../types.ts";

/**
 * Fetch context data for an AI query
 */
export async function fetchContextData(
  supabaseAdmin: any, 
  userId?: string, 
  reflectionId?: string
): Promise<ContextData> {
  const contextData: ContextData = {};
  
  // Fetch user profile if userId is provided
  if (userId) {
    try {
      const { data: userProfile } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (userProfile) {
        contextData.userProfile = {
          userLevel: userProfile.astral_level || 1,
          energyPoints: userProfile.energy_points || 0,
          username: userProfile.username
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }
  
  // Fetch reflection data if reflectionId is provided
  if (reflectionId) {
    try {
      const { data: reflection } = await supabaseAdmin
        .from("energy_reflections")
        .select("*")
        .eq("id", reflectionId)
        .maybeSingle();
      
      if (reflection) {
        contextData.reflection = {
          content: reflection.content,
          dominantEmotion: reflection.dominant_emotion,
          emotionalDepth: reflection.emotional_depth,
          chakrasActivated: reflection.chakras_activated
        };
      }
    } catch (error) {
      console.error("Error fetching reflection:", error);
    }
  }
  
  return contextData;
}

/**
 * Build rich context for the AI request
 */
export function buildRichContext(basicContext: string = "", contextData: ContextData = {}): string {
  const contextParts: string[] = [];
  
  // Add basic context if provided
  if (basicContext) {
    contextParts.push(basicContext);
  }
  
  // Add user profile information if available
  if (contextData.userProfile) {
    contextParts.push(
      "User Information:\n" +
      `- Level: ${contextData.userProfile.userLevel}\n` +
      `- Energy Points: ${contextData.userProfile.energyPoints}`
    );
  }
  
  // Add reflection information if available
  if (contextData.reflection) {
    contextParts.push(
      "Reflection Information:\n" +
      `- Content: ${contextData.reflection.content}\n` +
      (contextData.reflection.dominantEmotion ? `- Dominant Emotion: ${contextData.reflection.dominantEmotion}\n` : "") +
      (contextData.reflection.emotionalDepth ? `- Emotional Depth: ${contextData.reflection.emotionalDepth}\n` : "") +
      (contextData.reflection.chakrasActivated ? `- Chakras Activated: ${JSON.stringify(contextData.reflection.chakrasActivated)}` : "")
    );
  }
  
  // Join all context parts with double line breaks
  return contextParts.join("\n\n");
}
