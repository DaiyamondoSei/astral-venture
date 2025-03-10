
/**
 * Context handling for AI queries
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

/**
 * Fetch context data for an AI query
 * 
 * @param supabase Supabase client
 * @param userId Optional user ID
 * @param reflectionId Optional reflection ID
 * @returns Context data
 */
export async function fetchContextData(
  supabase: SupabaseClient,
  userId?: string,
  reflectionId?: string
): Promise<any> {
  const contextData: any = {};
  
  // Fetch user profile if userId is provided
  if (userId) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && profile) {
        contextData.profile = profile;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }
  
  // Fetch reflection data if reflectionId is provided
  if (reflectionId) {
    try {
      const { data: reflection, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('id', reflectionId)
        .single();
      
      if (!error && reflection) {
        contextData.reflection = reflection;
      }
    } catch (error) {
      console.error("Error fetching reflection:", error);
    }
  }
  
  return contextData;
}

/**
 * Build a rich context string for the AI query
 * 
 * @param context Base context
 * @param contextData Additional context data
 * @returns Rich context string
 */
export function buildRichContext(
  context?: string,
  contextData: any = {}
): string {
  let richContext = context || "";
  
  // Add user profile information if available
  if (contextData.profile) {
    const profile = contextData.profile;
    
    richContext += "\n\nUser Profile Information:";
    
    if (profile.full_name) {
      richContext += `\nName: ${profile.full_name}`;
    }
    
    if (profile.astral_level) {
      richContext += `\nAstral Level: ${profile.astral_level}`;
    }
    
    if (profile.consciousness_level) {
      richContext += `\nConsciousness Level: ${profile.consciousness_level}`;
    }
    
    if (profile.meditation_minutes) {
      const hours = Math.floor(profile.meditation_minutes / 60);
      const minutes = profile.meditation_minutes % 60;
      richContext += `\nMeditation Experience: ${hours} hours and ${minutes} minutes`;
    }
    
    if (profile.energy_points) {
      richContext += `\nEnergy Points: ${profile.energy_points}`;
    }
  }
  
  // Add reflection information if available
  if (contextData.reflection) {
    const reflection = contextData.reflection;
    
    richContext += "\n\nReflection Information:";
    
    if (reflection.title) {
      richContext += `\nTitle: ${reflection.title}`;
    }
    
    if (reflection.content) {
      richContext += `\nContent: ${reflection.content}`;
    }
    
    if (reflection.created_at) {
      const date = new Date(reflection.created_at);
      richContext += `\nCreated: ${date.toLocaleDateString()}`;
    }
  }
  
  return richContext;
}
