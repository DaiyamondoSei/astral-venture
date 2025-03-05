
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { getChakraName } from './chakraHelpers.ts';

// Function to fetch user context from Supabase
export async function fetchUserContext(userId: string) {
  if (!userId) return "";
  
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        auth: { persistSession: false }
      }
    );
    
    let userContext = "";
    
    // Fetch user profile
    const { data: profileData } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileData) {
      userContext += `User has ${profileData.energy_points} energy points and is at astral level ${profileData.astral_level}. `;
    }
    
    // Fetch recent reflections
    const { data: reflectionsData } = await supabaseClient
      .from('energy_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (reflectionsData && reflectionsData.length > 0) {
      userContext += `Recent reflection themes: ${reflectionsData.map(r => r.dominant_emotion).filter(Boolean).join(', ')}. `;
      
      // Get activated chakras
      const allChakras = reflectionsData
        .flatMap(r => r.chakras_activated || [])
        .filter(Boolean);
      
      if (allChakras.length > 0) {
        // Count frequency of each chakra
        const chakraCounts = allChakras.reduce((acc, chakra) => {
          acc[chakra] = (acc[chakra] || 0) + 1;
          return acc;
        }, {});
        
        // Get the most active chakras
        const mostActiveChakras = Object.entries(chakraCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([chakra]) => getChakraName(parseInt(chakra)));
        
        userContext += `Most active chakras: ${mostActiveChakras.join(', ')}. `;
      }
    }
    
    return userContext;
  } catch (error) {
    console.error("Error fetching user context:", error);
    return "";
  }
}
