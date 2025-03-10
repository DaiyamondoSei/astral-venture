
/**
 * Context handling utilities for AI query processing
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

/**
 * Fetch contextual data for an AI query
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param reflectionId - Optional reflection ID
 * @returns Context data object
 */
export async function fetchContextData(
  supabase: SupabaseClient,
  userId?: string, 
  reflectionId?: string
): Promise<Record<string, any>> {
  const contextData: Record<string, any> = {};
  
  if (!userId) {
    return contextData;
  }
  
  try {
    // Fetch user profile data
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user profile:", userError);
    } else if (userProfile) {
      contextData.userProfile = userProfile;
    }
    
    // Fetch user's consciousness metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('consciousness_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (metricsError) {
      console.error("Error fetching consciousness metrics:", metricsError);
    } else if (metricsData) {
      contextData.consciousnessMetrics = metricsData;
    }
    
    // If reflectionId is provided, fetch the specific reflection
    if (reflectionId) {
      const { data: reflection, error: reflectionError } = await supabase
        .from('energy_reflections')
        .select('*')
        .eq('id', reflectionId)
        .single();
      
      if (reflectionError) {
        console.error("Error fetching reflection:", reflectionError);
      } else if (reflection) {
        contextData.reflection = reflection;
      }
    }
    
    // Fetch recent reflections for context
    const { data: recentReflections, error: reflectionsError } = await supabase
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (reflectionsError) {
      console.error("Error fetching recent reflections:", reflectionsError);
    } else if (recentReflections) {
      contextData.recentReflections = recentReflections;
    }
    
    return contextData;
  } catch (error) {
    console.error("Error fetching context data:", error);
    return contextData;
  }
}

/**
 * Build a rich context object for AI request
 * 
 * @param userProvidedContext - Context provided by the user
 * @param contextData - Context data from the database
 * @returns Rich context string for the AI
 */
export function buildRichContext(
  userProvidedContext?: string,
  contextData: Record<string, any> = {}
): string {
  let richContext = '';
  
  // Add user-provided context if available
  if (userProvidedContext) {
    richContext += `User Context: ${userProvidedContext}\n\n`;
  }
  
  // Add user profile context if available
  if (contextData.userProfile) {
    const profile = contextData.userProfile;
    richContext += `User Profile: Astral Level ${profile.astral_level}, Energy Points ${profile.energy_points}\n\n`;
  }
  
  // Add consciousness metrics if available
  if (contextData.consciousnessMetrics) {
    const metrics = contextData.consciousnessMetrics;
    richContext += `Consciousness Level: ${metrics.level}\n`;
    richContext += `Awareness Score: ${metrics.awareness_score}/100\n`;
    richContext += `Chakra Balance: ${metrics.chakra_balance}/100\n\n`;
  }
  
  // Add reflection context if available
  if (contextData.reflection) {
    richContext += `Current Reflection: ${contextData.reflection.content}\n\n`;
  }
  
  // Add recent reflections for historical context
  if (contextData.recentReflections && contextData.recentReflections.length > 0) {
    richContext += `Recent Reflections:\n`;
    
    contextData.recentReflections.forEach((reflection: any, index: number) => {
      richContext += `${index + 1}. ${reflection.content.substring(0, 100)}...\n`;
    });
    
    richContext += '\n';
  }
  
  return richContext;
}
