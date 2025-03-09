
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ContextData {
  userProfile?: {
    userLevel: number;
    energyPoints: number;
    [key: string]: any;
  };
  reflection?: {
    content: string;
    dominantEmotion?: string;
    emotionalDepth?: number;
    chakrasActivated?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Fetch context data for the AI request
 */
export async function fetchContextData(supabase: any, userId?: string, reflectionId?: string): Promise<ContextData> {
  const contextData: ContextData = {};
  
  // Get user profile data if userId is provided
  if (userId) {
    try {
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (userProfile) {
        contextData.userProfile = {
          userLevel: userProfile.astral_level,
          energyPoints: userProfile.energy_points
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }
  
  // Get reflection data if reflectionId is provided
  if (reflectionId) {
    try {
      const { data: reflection } = await supabase
        .from("energy_reflections")
        .select("*")
        .eq("id", reflectionId)
        .single();
      
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
 * Build a rich context string for the AI request
 */
export function buildRichContext(baseContext: string = "", contextData: ContextData): string {
  const contextParts = [baseContext];
  
  if (contextData.userProfile) {
    contextParts.push(`User Information: ${JSON.stringify(contextData.userProfile)}`);
  }
  
  if (contextData.reflection) {
    contextParts.push(`Reflection Information: ${JSON.stringify(contextData.reflection)}`);
  }
  
  return contextParts.filter(Boolean).join("\n\n");
}
