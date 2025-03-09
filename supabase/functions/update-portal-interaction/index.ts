
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
    const {
      userId,
      portalEnergy,
      interactionCount,
      resonanceLevel,
      lastInteractionTime
    } = await req.json();

    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if a record exists for this user
    const { data: existingData, error: checkError } = await supabase
      .from('user_energy_interactions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing record:', checkError);
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const updateData = {
      user_id: userId,
      portal_energy: portalEnergy,
      interaction_count: interactionCount,
      resonance_level: resonanceLevel,
      last_interaction_time: lastInteractionTime,
      updated_at: new Date().toISOString()
    };
    
    // Update or insert record
    let result;
    if (existingData?.id) {
      // Update existing record
      result = await supabase
        .from('user_energy_interactions')
        .update(updateData)
        .eq('user_id', userId);
    } else {
      // Create new record
      result = await supabase
        .from('user_energy_interactions')
        .insert({
          ...updateData,
          created_at: new Date().toISOString()
        });
    }
    
    if (result.error) {
      console.error('Error updating portal interaction:', result.error);
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for achievement unlock conditions
    if (interactionCount >= 5) {
      const achievementId = 'portal-adept';
      await checkAndAwardAchievement(supabase, userId, achievementId);
    }
    
    if (resonanceLevel >= 3) {
      const achievementId = 'high-resonance';
      await checkAndAwardAchievement(supabase, userId, achievementId);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          portalEnergy,
          interactionCount,
          resonanceLevel,
          lastInteractionTime
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in update-portal-interaction:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to check if user has an achievement and award if not
async function checkAndAwardAchievement(supabase, userId: string, achievementId: string) {
  // First check if the achievement exists
  const { data: achievementData } = await supabase
    .from('achievements')
    .select('id')
    .eq('id', achievementId)
    .single();
    
  if (!achievementData) {
    console.log(`Achievement ${achievementId} not found in database`);
    return;
  }
  
  // Check if user already has this achievement
  const { data: existingAchievement } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .eq('awarded', true)
    .maybeSingle();
    
  if (existingAchievement) {
    console.log(`User ${userId} already has achievement ${achievementId}`);
    return;
  }
  
  // Award the achievement
  const { error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      progress: 1,
      awarded: true,
      awarded_at: new Date().toISOString(),
    });
    
  if (error) {
    console.error(`Error awarding achievement ${achievementId} to user ${userId}:`, error);
  } else {
    console.log(`Awarded achievement ${achievementId} to user ${userId}`);
  }
}
