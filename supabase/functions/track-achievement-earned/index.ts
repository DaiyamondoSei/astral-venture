
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userId, achievementId, achievementData } = await req.json();
    
    // Validate required parameters
    if (!userId || !achievementId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Record the achievement event
    const { data: eventData, error: eventError } = await supabase
      .from('achievement_events')
      .insert([
        {
          user_id: userId,
          event_type: 'achievement_earned',
          event_data: {
            achievement_id: achievementId,
            achievement_details: achievementData
          },
          points_earned: achievementData?.points || 0
        }
      ]);
    
    if (eventError) {
      throw eventError;
    }
    
    // Add energy points for the achievement
    let pointsAdded = false;
    const pointsToAdd = achievementData?.points || 25; // Default 25 points if not specified
    
    if (pointsToAdd > 0) {
      const { data: pointsData, error: pointsError } = await supabase.rpc(
        'add_energy_points',
        {
          user_id_param: userId,
          points_param: pointsToAdd
        }
      );
      
      if (pointsError) {
        console.error("Error adding points:", pointsError);
      } else {
        pointsAdded = true;
      }
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        achievement_tracked: true,
        points_added: pointsAdded,
        points: pointsToAdd
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
