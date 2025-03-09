
import { createInsightPrompt } from "../utils/promptUtils.ts";

export async function fetchContextData(supabaseClient: any, userId?: string, reflectionId?: string) {
  const data: Record<string, any> = {};
  
  if (!userId) return data;
  
  try {
    // Fetch user profile data if userId is provided
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('username, astral_level, energy_points, preferences')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    } else if (profile) {
      data.userProfile = profile;
    }
    
    // Fetch reflection data if reflectionId is provided
    if (reflectionId) {
      const { data: reflection, error: reflectionError } = await supabaseClient
        .from('energy_reflections')
        .select('content, energy_level, chakras, emotions, created_at')
        .eq('id', reflectionId)
        .single();
      
      if (reflectionError) {
        console.error("Error fetching reflection:", reflectionError);
      } else if (reflection) {
        data.reflection = reflection;
      }
      
      // Get recent reflections for additional context
      const { data: recentReflections, error: recentError } = await supabaseClient
        .from('energy_reflections')
        .select('content, energy_level, created_at')
        .eq('user_id', userId)
        .neq('id', reflectionId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (recentError) {
        console.error("Error fetching recent reflections:", recentError);
      } else if (recentReflections && recentReflections.length > 0) {
        data.recentReflections = recentReflections;
      }
    }
    
    // Fetch chakra system data
    const { data: chakraSystem, error: chakraError } = await supabaseClient
      .from('chakra_systems')
      .select('chakras')
      .eq('user_id', userId)
      .single();
    
    if (chakraError && chakraError.code !== 'PGRST116') {
      console.error("Error fetching chakra system:", chakraError);
    } else if (chakraSystem) {
      data.chakraSystem = chakraSystem.chakras;
    }
  } catch (error) {
    console.error("Error in fetchContextData:", error);
  }
  
  return data;
}

export function buildRichContext(context: string = "", contextData: Record<string, any> = {}) {
  let richContext = context || "";
  
  // Add user profile context if available
  if (contextData.userProfile) {
    const profile = contextData.userProfile;
    richContext += `\n\nUser Information:\n- Level: ${profile.astral_level || 1}\n- Energy Points: ${profile.energy_points || 0}`;
    
    if (profile.preferences) {
      richContext += `\n- Preferences: ${typeof profile.preferences === 'object' ? JSON.stringify(profile.preferences) : profile.preferences}`;
    }
  }
  
  // Add reflection context if available
  if (contextData.reflection) {
    const reflection = contextData.reflection;
    richContext += `\n\nCurrent Reflection:\n"${reflection.content}"\n`;
    richContext += `- Energy Level: ${reflection.energy_level || 'Not specified'}\n`;
    
    if (reflection.emotions && reflection.emotions.length > 0) {
      richContext += `- Emotions: ${Array.isArray(reflection.emotions) ? reflection.emotions.join(', ') : reflection.emotions}\n`;
    }
    
    if (reflection.chakras && reflection.chakras.length > 0) {
      richContext += `- Chakras: ${Array.isArray(reflection.chakras) ? reflection.chakras.join(', ') : reflection.chakras}\n`;
    }
  }
  
  // Add recent reflections context if available
  if (contextData.recentReflections && contextData.recentReflections.length > 0) {
    richContext += `\n\nRecent Reflections:\n`;
    contextData.recentReflections.forEach((reflection: any, index: number) => {
      richContext += `${index + 1}. "${reflection.content.substring(0, 100)}${reflection.content.length > 100 ? '...' : ''}"\n`;
    });
  }
  
  // Add chakra system context if available
  if (contextData.chakraSystem) {
    richContext += `\n\nChakra System Status:\n`;
    
    for (const [chakra, status] of Object.entries(contextData.chakraSystem)) {
      richContext += `- ${chakra}: ${status}\n`;
    }
  }
  
  // Add insight generation prompt if this is for a reflection
  if (contextData.reflection) {
    richContext += `\n\n${createInsightPrompt()}`;
  }
  
  return richContext;
}
