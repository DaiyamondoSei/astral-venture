
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { userId, pointsToAdd, source = 'default' } = await req.json();
    
    // Validate inputs
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!pointsToAdd || typeof pointsToAdd !== 'number' || pointsToAdd <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid points value" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user's current energy points
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('energy_points, astral_level')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Error fetching user profile: " + fetchError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const currentPoints = userData?.energy_points || 0;
    const currentLevel = userData?.astral_level || 1;
    const newPoints = currentPoints + pointsToAdd;
    
    // Calculate new astral level (logarithmic progression)
    const newAstralLevel = Math.floor(Math.log10(newPoints + 1) * 3) + 1;
    const leveledUp = newAstralLevel > currentLevel;
    
    // Update user profile with new energy points
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: newPoints,
        astral_level: newAstralLevel,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Error updating user profile: " + updateError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record in energy points history
    const { error: historyError } = await supabase
      .from('energy_points_history')
      .insert({
        user_id: userId,
        points_added: pointsToAdd,
        source: source,
        new_total: newPoints
      });
    
    if (historyError) {
      console.error("Error recording energy points history:", historyError);
    }
    
    // Check for level-up achievement if user leveled up
    if (leveledUp) {
      await checkLevelAchievements(supabase, userId, newAstralLevel);
    }
    
    return new Response(
      JSON.stringify({
        previousPoints: currentPoints,
        pointsAdded: pointsToAdd,
        newTotal: newPoints,
        previousLevel: currentLevel,
        newLevel: newAstralLevel,
        leveledUp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing energy points increment:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Check for and award level-based achievements
 */
async function checkLevelAchievements(supabase: any, userId: string, level: number) {
  try {
    const achievementIds = [];
    
    if (level >= 2) achievementIds.push('astral_level_2');
    if (level >= 3) achievementIds.push('astral_level_3');
    if (level >= 4) achievementIds.push('astral_level_4');
    if (level >= 5) achievementIds.push('astral_level_5');
    
    if (achievementIds.length === 0) return;
    
    // Check which achievements user already has
    const { data: existingAchievements, error: fetchError } = await supabase
      .from('user_achievements')
      .select('achievement_id, awarded')
      .eq('user_id', userId)
      .in('achievement_id', achievementIds);
    
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
    
    // Prepare achievements to award
    const achievementsToAward = achievementIds
      .filter(id => !existingMap.has(id) || !existingMap.get(id))
      .map(id => ({
        user_id: userId,
        achievement_id: id,
        progress: 100,
        awarded: true,
        awarded_at: new Date().toISOString()
      }));
    
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
    console.error("Error in checkLevelAchievements:", error);
  }
}
