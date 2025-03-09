
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId, pointsToAdd } = await req.json();

    // Validate required fields
    if (!userId || pointsToAdd === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get the current energy points
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('energy_points, astral_level')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const currentPoints = userData?.energy_points || 0;
    const currentLevel = userData?.astral_level || 1;
    const newPoints = currentPoints + pointsToAdd;
    
    // Calculate new astral level (logarithmic progression)
    const newAstralLevel = Math.floor(Math.log10(newPoints + 1) * 3) + 1;
    const hasLeveledUp = newAstralLevel > currentLevel;
    
    // Update the user profile with new points and level
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        energy_points: newPoints,
        astral_level: newAstralLevel,
        last_active_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Record this energy increase in the history table
    await supabase
      .from('energy_points_history')
      .insert({
        user_id: userId,
        points_added: pointsToAdd,
        source: 'portal_activation',
        new_total: newPoints,
        created_at: new Date().toISOString()
      });
    
    // If user leveled up, record an achievement
    if (hasLeveledUp) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: `astral_level_${newAstralLevel}`,
          awarded: true,
          progress: 1,
          awarded_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newPoints, 
        previousPoints: currentPoints,
        pointsAdded: pointsToAdd,
        newLevel: newAstralLevel,
        hasLeveledUp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in increment-energy-points:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
