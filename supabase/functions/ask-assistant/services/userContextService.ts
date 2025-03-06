
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Fetches user context data to personalize AI responses
 * @param userId User ID to fetch context for
 * @returns Object with user context information
 */
export async function fetchUserContext(userId: string): Promise<Record<string, any>> {
  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Start timing operation for performance monitoring
    const startTime = Date.now();
    
    // Initialize the context object
    const context: Record<string, any> = {
      userId,
      fetchedAt: new Date().toISOString(),
    };
    
    // Fetch the user profile information
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("energy_points, astral_level, last_active_at")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    } else if (profileData) {
      // Add profile data to context
      context.energyPoints = profileData.energy_points;
      context.astralLevel = profileData.astral_level;
      context.lastActive = profileData.last_active_at;
    }
    
    // Fetch recent reflections for emotional context
    const { data: reflectionsData, error: reflectionsError } = await supabaseAdmin
      .from("energy_reflections")
      .select("dominant_emotion, emotional_depth, chakras_activated, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (reflectionsError) {
      console.error("Error fetching user reflections:", reflectionsError);
    } else if (reflectionsData && reflectionsData.length > 0) {
      // Process emotions from reflections
      const emotions = reflectionsData
        .filter(r => r.dominant_emotion)
        .map(r => r.dominant_emotion);
      
      // Count emotion occurrences and find dominant ones
      const emotionCounts: Record<string, number> = {};
      emotions.forEach(emotion => {
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });
      
      // Sort emotions by count
      const dominantEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emotion]) => emotion);
      
      context.dominantEmotions = dominantEmotions;
      
      // Calculate average emotional depth
      const emotionalDepths = reflectionsData
        .filter(r => r.emotional_depth !== null)
        .map(r => r.emotional_depth);
      
      if (emotionalDepths.length > 0) {
        const avgDepth = emotionalDepths.reduce((sum, depth) => sum + depth, 0) / emotionalDepths.length;
        context.averageEmotionalDepth = avgDepth;
      }
      
      // Collect all activated chakras
      const allChakras = reflectionsData
        .flatMap(r => {
          // Handle both string and array formats
          if (typeof r.chakras_activated === 'string') {
            try {
              return JSON.parse(r.chakras_activated);
            } catch (e) {
              return [];
            }
          }
          return r.chakras_activated || [];
        });
      
      // Deduplicate chakras
      context.chakrasActivated = [...new Set(allChakras)];
      
      // Add last reflection date
      context.lastReflectionDate = reflectionsData[0].created_at;
    }
    
    // Log performance metrics
    const operationTime = Date.now() - startTime;
    console.log(`User context fetch completed in ${operationTime}ms`);
    
    return context;
  } catch (error) {
    console.error("Error fetching user context:", error);
    
    // Return minimal context in case of error
    return {
      userId,
      error: "Failed to fetch complete context",
    };
  }
}
