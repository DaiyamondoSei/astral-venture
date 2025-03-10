
/**
 * Service for fetching user context data
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js";

/**
 * Fetch user context information from Supabase
 * 
 * @param userId User ID
 * @returns User context information
 */
export async function fetchUserContext(userId: string): Promise<any> {
  if (!userId) {
    return {};
  }
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    return {};
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError.message);
    }
    
    // Fetch recent completed practices
    const { data: practices, error: practicesError } = await supabase
      .from('completed_practices')
      .select(`
        id,
        practice_id,
        completed_at,
        duration,
        practices(
          id,
          title,
          description,
          category
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5);
    
    if (practicesError) {
      console.error("Error fetching user practices:", practicesError.message);
    }
    
    // Fetch recent insights
    const { data: insights, error: insightsError } = await supabase
      .from('user_insights')
      .select(`
        id,
        title,
        content,
        created_at,
        insight_type
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (insightsError) {
      console.error("Error fetching user insights:", insightsError.message);
    }
    
    // Fetch user achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achievement_id,
        awarded,
        awarded_at,
        achievements(
          id,
          title,
          description,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('awarded', true)
      .order('awarded_at', { ascending: false });
    
    if (achievementsError) {
      console.error("Error fetching user achievements:", achievementsError.message);
    }
    
    return {
      userId,
      profile: profile || null,
      practices: practices || [],
      insights: insights || [],
      achievements: achievements || []
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return { userId };
  }
}
