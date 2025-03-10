
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Rich context data for AI queries
 */
interface UserContextData {
  username?: string;
  consciousnessLevel?: number;
  interests?: string[];
  recentReflections?: {
    id: string;
    text: string;
    createdAt: string;
  }[];
  chakraData?: Record<string, any>;
}

/**
 * Fetch context data for the AI query
 * 
 * @param supabase Supabase client
 * @param userId User ID to fetch context for
 * @param reflectionId Optional reflection ID for more specific context
 */
export async function fetchContextData(
  supabase: any,
  userId?: string, 
  reflectionId?: string
): Promise<UserContextData> {
  const contextData: UserContextData = {};
  
  try {
    // Skip if no user ID provided
    if (!userId) return contextData;
    
    // Fetch user profile data (in parallel)
    const userProfilePromise = supabase
      .from("user_profiles")
      .select("username, astral_level, interests")
      .eq("id", userId)
      .single();
    
    // Fetch reflection data if ID is provided
    const reflectionPromise = reflectionId 
      ? supabase
          .from("energy_reflections")
          .select("*")
          .eq("id", reflectionId)
          .single()
      : Promise.resolve({ data: null });
    
    // Fetch recent reflections regardless
    const recentReflectionsPromise = supabase
      .from("energy_reflections")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);
    
    // Wait for all requests to complete
    const [
      { data: userProfile, error: userProfileError },
      { data: reflection, error: reflectionError },
      { data: recentReflections, error: recentReflectionsError }
    ] = await Promise.all([
      userProfilePromise,
      reflectionPromise,
      recentReflectionsPromise
    ]);
    
    // Add user profile data
    if (userProfile && !userProfileError) {
      contextData.username = userProfile.username;
      contextData.consciousnessLevel = userProfile.astral_level;
      contextData.interests = userProfile.interests;
    }
    
    // Add reflection data
    if (reflection && !reflectionError) {
      // Specific reflection data would be added here
      // This could be structured differently based on needs
    }
    
    // Add recent reflections
    if (recentReflections && !recentReflectionsError) {
      contextData.recentReflections = recentReflections.map(r => ({
        id: r.id,
        text: r.content,
        createdAt: r.created_at
      }));
    }
    
    return contextData;
  } catch (error) {
    console.error("Error fetching context data:", error);
    return contextData;
  }
}

/**
 * Build a rich context string for the AI model based on available data
 * 
 * @param userProvidedContext Context provided by the user in their request
 * @param contextData Context data fetched from the database
 */
export function buildRichContext(
  userProvidedContext?: string,
  contextData: UserContextData = {}
): string {
  const contextParts: string[] = [];
  
  // Add user-provided context if available
  if (userProvidedContext) {
    contextParts.push(`User context: ${userProvidedContext.trim()}`);
  }
  
  // Add user profile context if available
  if (contextData.username || contextData.consciousnessLevel) {
    contextParts.push(
      "User profile information:" +
      (contextData.username ? ` Name: ${contextData.username}.` : "") +
      (contextData.consciousnessLevel ? ` Consciousness level: ${contextData.consciousnessLevel}.` : "")
    );
  }
  
  // Add interests if available
  if (contextData.interests && contextData.interests.length > 0) {
    contextParts.push(`User interests: ${contextData.interests.join(", ")}.`);
  }
  
  // Add recent reflections if available
  if (contextData.recentReflections && contextData.recentReflections.length > 0) {
    contextParts.push("Recent reflections from the user:");
    
    contextData.recentReflections.forEach((reflection) => {
      const shortText = reflection.text.substring(0, 150) + (reflection.text.length > 150 ? "..." : "");
      contextParts.push(`- ${shortText} (${new Date(reflection.createdAt).toLocaleDateString()})`);
    });
  }
  
  return contextParts.join("\n\n");
}
