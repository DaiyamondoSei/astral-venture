
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createInsightPrompt } from "../utils/promptUtils.ts";

/**
 * Fetches user context from various data sources for personalized AI responses
 */
export async function fetchUserContext(userId: string) {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Get user profile data
    const { data: profileData, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
    
    // Get recent reflections
    const { data: reflections, error: reflectionsError } = await supabaseClient
      .from("energy_reflections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (reflectionsError) {
      console.error("Error fetching reflections:", reflectionsError);
    }
    
    // Get chakra system data
    const { data: chakraData, error: chakraError } = await supabaseClient
      .from("chakra_systems")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (chakraError) {
      console.error("Error fetching chakra data:", chakraError);
    }
    
    // Get consciousness metrics
    const { data: metricsData, error: metricsError } = await supabaseClient
      .from("consciousness_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (metricsError) {
      console.error("Error fetching consciousness metrics:", metricsError);
    }
    
    return {
      profile: profileData || null,
      recentReflections: reflections || [],
      chakraSystem: chakraData || null,
      consciousnessMetrics: metricsData || null
    };
  } catch (error) {
    console.error("Error in fetchUserContext:", error);
    return {
      profile: null,
      recentReflections: [],
      chakraSystem: null,
      consciousnessMetrics: null
    };
  }
}

/**
 * Builds a contextualized prompt based on user data and the current query
 */
export function buildContextualizedPrompt(
  message: string,
  userContext: any,
  reflectionContent?: string
): string {
  // Start with the user's message
  let prompt = message;
  
  // Add relevant context based on what's available
  const contextParts = [];
  
  // Add reflection content if provided
  if (reflectionContent) {
    contextParts.push(`Here is my reflection: "${reflectionContent}"`);
  }
  
  // Add user's consciousness level if available
  if (userContext.profile?.astral_level) {
    contextParts.push(`My consciousness level is: ${userContext.profile.astral_level}`);
  }
  
  // Add activated chakras if available
  if (userContext.chakraSystem?.activated_chakras?.length > 0) {
    const chakras = userContext.chakraSystem.activated_chakras.join(", ");
    contextParts.push(`My currently activated chakras are: ${chakras}`);
  }
  
  // Add recent reflection themes if available
  if (userContext.recentReflections?.length > 0) {
    const themes = userContext.recentReflections
      .map((r: any) => r.themes || [])
      .flat()
      .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
      .slice(0, 5)
      .join(", ");
    
    if (themes) {
      contextParts.push(`Recent themes in my reflections: ${themes}`);
    }
  }
  
  // Combine all context parts
  if (contextParts.length > 0) {
    prompt += "\n\nContext:\n" + contextParts.join("\n");
  }
  
  return prompt;
}
