import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortalInteractionRequest {
  userId: string;
  currentEnergy?: number;
  portalEnergy?: number;
  currentInteractionCount?: number;
  interactionCount?: number;
  currentResonanceLevel?: number;
  resonanceLevel?: number;
  lastInteractionTime: string | null;
  userLevel?: number;
  reset?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body
    const requestData: PortalInteractionRequest = await req.json();
    
    const { 
      userId, 
      currentEnergy, 
      portalEnergy,
      currentInteractionCount, 
      interactionCount,
      currentResonanceLevel, 
      resonanceLevel,
      lastInteractionTime,
      userLevel = 1,
      reset = false
    } = requestData;
    
    // Validate userId
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle reset request
    if (reset) {
      return await handleResetInteraction(supabase, userId, corsHeaders);
    }
    
    // If we have current values, calculate new state
    if (currentEnergy !== undefined && 
        currentInteractionCount !== undefined && 
        currentResonanceLevel !== undefined) {
      return await handleCalculateNewState(
        supabase, 
        userId, 
        currentEnergy, 
        currentInteractionCount, 
        currentResonanceLevel, 
        lastInteractionTime, 
        userLevel,
        corsHeaders
      );
    }
    
    // Otherwise, just update with provided values
    if (portalEnergy !== undefined || 
        interactionCount !== undefined || 
        resonanceLevel !== undefined) {
      return await handleUpdateState(
        supabase, 
        userId, 
        portalEnergy || 0, 
        interactionCount || 0, 
        resonanceLevel || 1, 
        lastInteractionTime,
        corsHeaders
      );
    }
    
    // Invalid request
    return new Response(
      JSON.stringify({ error: "Invalid request parameters" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing portal interaction:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Reset portal interaction to default values
 */
async function handleResetInteraction(supabase: any, userId: string, corsHeaders: any) {
  try {
    // Update or insert portal state
    const { data, error } = await supabase
      .from('user_energy_interactions')
      .upsert({
        user_id: userId,
        portal_energy: 0,
        interaction_count: 0,
        resonance_level: 1,
        last_interaction_time: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        returning: 'representation'
      });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({
        portalEnergy: 0,
        interactionCount: 0,
        resonanceLevel: 1,
        lastInteractionTime: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate new state based on user interaction
 */
async function handleCalculateNewState(
  supabase: any,
  userId: string,
  currentEnergy: number,
  currentInteractionCount: number,
  currentResonanceLevel: number,
  lastInteractionTime: string | null,
  userLevel: number,
  corsHeaders: any
) {
  // Calculate time since last interaction
  const now = new Date();
  const timeSinceLastInteraction = lastInteractionTime 
    ? now.getTime() - new Date(lastInteractionTime).getTime()
    : Infinity;
  
  // Calculate energy increase
  const baseEnergyGain = 15;
  const comboMultiplier = timeSinceLastInteraction < 2000 ? 1.5 : 1;
  const levelBonus = userLevel * 2;
  
  const energyGain = baseEnergyGain * comboMultiplier + levelBonus;
  const newEnergy = Math.min(100, currentEnergy + energyGain);
  
  // Calculate new resonance level
  const newInteractionCount = currentInteractionCount + 1;
  let newResonance = currentResonanceLevel;
  
  if (newInteractionCount >= 20 && newResonance < 5) {
    newResonance = 5;
  } else if (newInteractionCount >= 15 && newResonance < 4) {
    newResonance = 4;
  } else if (newInteractionCount >= 10 && newResonance < 3) {
    newResonance = 3;
  } else if (newInteractionCount >= 5 && newResonance < 2) {
    newResonance = 2;
  }
  
  // Update portal state in database
  const { data, error } = await supabase
    .from('user_energy_interactions')
    .upsert({
      user_id: userId,
      portal_energy: newEnergy,
      interaction_count: newInteractionCount,
      resonance_level: newResonance,
      last_interaction_time: now.toISOString(),
      updated_at: now.toISOString()
    }, {
      onConflict: 'user_id',
      returning: 'representation'
    });
  
  if (error) throw error;
  
  let energyPointsAdded = 0;
  
  // Grant energy points if portal is fully charged
  if (newEnergy >= 100) {
    energyPointsAdded = 50 * newResonance; // Scale points with resonance level
    
    // Add energy points
    const { error: pointsError } = await supabase
      .from('energy_points_history')
      .insert({
        user_id: userId,
        points_added: energyPointsAdded,
        source: 'portal_activation',
        new_total: 0 // Will be updated by trigger
      });
    
    if (pointsError) {
      console.error("Error adding energy points:", pointsError);
    }
    
    // Update user profile with new energy points
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('energy_points')
      .eq('id', userId)
      .single();
    
    if (!profileError && profileData) {
      const currentPoints = profileData.energy_points || 0;
      const newPoints = currentPoints + energyPointsAdded;
      
      await supabase
        .from('user_profiles')
        .update({ 
          energy_points: newPoints,
          last_active_at: now.toISOString()
        })
        .eq('id', userId);
      
      // Reset portal energy after activation
      await supabase
        .from('user_energy_interactions')
        .update({ portal_energy: 0 })
        .eq('user_id', userId);
        
      newEnergy = 0;
    }
    
    // Check for achievements
    await checkForAchievements(supabase, userId, newResonance);
  }
  
  return new Response(
    JSON.stringify({
      portalEnergy: newEnergy,
      interactionCount: newInteractionCount,
      resonanceLevel: newResonance,
      lastInteractionTime: now.toISOString(),
      energyPointsAdded
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Update portal state with provided values
 */
async function handleUpdateState(
  supabase: any,
  userId: string,
  portalEnergy: number,
  interactionCount: number,
  resonanceLevel: number,
  lastInteractionTime: string | null,
  corsHeaders: any
) {
  try {
    // Update portal state in database
    const { data, error } = await supabase
      .from('user_energy_interactions')
      .upsert({
        user_id: userId,
        portal_energy: portalEnergy,
        interaction_count: interactionCount,
        resonance_level: resonanceLevel,
        last_interaction_time: lastInteractionTime,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        returning: 'representation'
      });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({
        portalEnergy,
        interactionCount,
        resonanceLevel,
        lastInteractionTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Check for and award achievements related to portal interactions
 */
async function checkForAchievements(supabase: any, userId: string, resonanceLevel: number) {
  try {
    // Check if user already has the achievement
    const { data: existingAchievements, error: fetchError } = await supabase
      .from('user_achievements')
      .select('achievement_id, awarded')
      .eq('user_id', userId)
      .in('achievement_id', ['portal_resonance_3', 'portal_resonance_5']);
    
    if (fetchError) {
      console.error("Error fetching achievements:", fetchError);
      return;
    }
    
    const existingMap = new Map();
    if (existingAchievements) {
      existingAchievements.forEach((achievement: any) => {
        existingMap.set(achievement.achievement_id, achievement.awarded);
      });
    }
    
    const achievementsToAward = [];
    
    // Check for resonance level 3 achievement
    if (resonanceLevel >= 3 && (!existingMap.has('portal_resonance_3') || !existingMap.get('portal_resonance_3'))) {
      achievementsToAward.push({
        user_id: userId,
        achievement_id: 'portal_resonance_3',
        progress: 100,
        awarded: true,
        awarded_at: new Date().toISOString()
      });
    }
    
    // Check for resonance level 5 achievement
    if (resonanceLevel >= 5 && (!existingMap.has('portal_resonance_5') || !existingMap.get('portal_resonance_5'))) {
      achievementsToAward.push({
        user_id: userId,
        achievement_id: 'portal_resonance_5',
        progress: 100,
        awarded: true,
        awarded_at: new Date().toISOString()
      });
    }
    
    // Award achievements if any
    if (achievementsToAward.length > 0) {
      const { error: upsertError } = await supabase
        .from('user_achievements')
        .upsert(achievementsToAward, {
          onConflict: 'user_id,achievement_id',
          returning: 'representation'
        });
      
      if (upsertError) {
        console.error("Error awarding achievements:", upsertError);
      }
    }
  } catch (error) {
    console.error("Error in checkForAchievements:", error);
  }
}
