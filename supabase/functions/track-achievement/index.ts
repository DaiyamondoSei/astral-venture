
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle requests to the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { userId, achievementId, progress, autoAward = true } = await req.json();
    
    // Validate required parameters
    if (!userId || !achievementId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: userId and achievementId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Call the update_achievement_progress RPC function
    const { data, error } = await supabase.rpc(
      "update_achievement_progress",
      {
        user_id_param: userId,
        achievement_id_param: achievementId,
        progress_value: progress ?? 0,
        auto_award: autoAward
      }
    );
    
    if (error) {
      console.error("Error updating achievement progress:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if achievement was newly awarded to send notification
    let notification = null;
    if (data && data.newly_awarded) {
      // Add notification data
      notification = {
        achievement: data.achievement_data,
        awarded_at: data.awarded_at,
        points: data.achievement_data?.requirements?.points || 25
      };
      
      // Log achievement
      console.log(`Achievement awarded to user ${userId}: ${achievementId}`);
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        notification
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
