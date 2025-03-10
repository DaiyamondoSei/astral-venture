
/**
 * User context service for personalized AI responses
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { logEvent } from "../../shared/responseUtils.ts";

/**
 * Fetch user context information for personalized responses
 * 
 * @param userId User ID
 * @returns User context data
 */
export async function fetchUserContext(userId: string): Promise<Record<string, any>> {
  if (!userId) {
    return {}; // Return empty context for anonymous users
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      logEvent("error", "Error fetching user profile", { userId, error: profileError.message });
    }
    
    // Fetch user consciousness data
    const { data: consciousness, error: consciousnessError } = await supabase
      .from('consciousness_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (consciousnessError && consciousnessError.code !== 'PGRST116') {
      logEvent("error", "Error fetching consciousness data", { userId, error: consciousnessError.message });
    }
    
    // Fetch user chakra system
    const { data: chakraSystem, error: chakraError } = await supabase
      .from('chakra_systems')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (chakraError && chakraError.code !== 'PGRST116') {
      logEvent("error", "Error fetching chakra system", { userId, error: chakraError.message });
    }
    
    // Fetch recent reflections
    const { data: reflections, error: reflectionsError } = await supabase
      .from('energy_reflections')
      .select('id, content, created_at, energy_level, emotion')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (reflectionsError) {
      logEvent("error", "Error fetching reflections", { userId, error: reflectionsError.message });
    }
    
    // Fetch completed practices
    const { data: practices, error: practicesError } = await supabase
      .from('completed_practices')
      .select('category, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);
    
    if (practicesError) {
      logEvent("error", "Error fetching practices", { userId, error: practicesError.message });
    }
    
    // Build the context object
    const context: Record<string, any> = {
      userId,
      profile: profile || undefined,
      astralLevel: profile?.astral_level || 1,
      preferredTopics: profile?.preferences?.topics || [],
      consciousness: consciousness || undefined,
      chakraSystem: chakraSystem || undefined,
      recentReflections: reflections || [],
      recentPractices: practices || []
    };
    
    return context;
  } catch (error) {
    logEvent("error", "Error building user context", { 
      userId, 
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return minimal context in case of error
    return { userId };
  }
}
