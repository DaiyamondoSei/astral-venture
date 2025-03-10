
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, activityType, duration, completionRate, chakrasActivated, emotionalResponse, metadata } = await req.json();
    
    if (!userId || !activityType) {
      return new Response(
        JSON.stringify({ error: "User ID and activity type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Insert the activity record
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        duration: duration,
        completion_rate: completionRate,
        chakras_activated: chakrasActivated,
        emotional_response: emotionalResponse,
        metadata: metadata || {}
      })
      .select();
      
    if (error) {
      throw error;
    }
    
    // Update user metrics as a background task
    EdgeRuntime.waitUntil(updateUserMetrics(supabase, userId, activityType, metadata, chakrasActivated, emotionalResponse));
    
    return new Response(
      JSON.stringify({ success: true, activity: data[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-activity function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Update user metrics based on activity type - now runs as a background task
async function updateUserMetrics(
  supabase: any, 
  userId: string, 
  activityType: string, 
  metadata: any, 
  chakrasActivated: any,
  emotionalResponse: any
) {
  try {
    // Check if metrics record exists first
    const { data: metrics } = await supabase
      .from('personalization_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!metrics) {
      // Create new metrics record if it doesn't exist with initial values
      const baseScore = activityType === 'ai_guidance' || activityType === 'divine_guidance' ? 5 : 1;
      
      await supabase
        .from('personalization_metrics')
        .insert({
          user_id: userId,
          engagement_score: baseScore
        });
        
      return;
    }
    
    // Initialize updates object
    const updates: Record<string, number> = {};
    
    // Calculate appropriate updates based on activity type
    switch (activityType) {
      case 'ai_guidance':
      case 'divine_guidance':
        // Higher engagement increase for AI interactions
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 5);
        break;
        
      case 'practice_completion':
        // Moderate engagement increase for practice completion
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 3);
        updates.content_relevance_rating = Math.min(100, (metrics.content_relevance_rating || 0) + 3);
        break;
        
      case 'reflection_creation':
        // Moderate engagement increase for reflections
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 2);
        updates.content_relevance_rating = Math.min(100, (metrics.content_relevance_rating || 0) + 3);
        
        // Emotional growth for reflections
        if (emotionalResponse || metadata?.emotionalResponse) {
          updates.emotional_growth_rate = Math.min(100, (metrics.emotional_growth_rate || 0) + 3);
        }
        break;
        
      case 'meditation':
        // Moderate engagement increase for meditation
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 2);
        updates.content_relevance_rating = Math.min(100, (metrics.content_relevance_rating || 0) + 2);
        break;
        
      default:
        // Small engagement increase for other activities
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 1);
    }
    
    // Update chakra balance if chakras were activated
    if (chakrasActivated || metadata?.chakrasActivated) {
      updates.chakra_balance_improvement = Math.min(100, (metrics.chakra_balance_improvement || 0) + 2);
    }
    
    // Update emotional growth if emotions were processed and not already updated
    if (!updates.emotional_growth_rate && (emotionalResponse || metadata?.emotionalResponse)) {
      updates.emotional_growth_rate = Math.min(100, (metrics.emotional_growth_rate || 0) + 2);
    }
    
    // Apply updates if there are any
    if (Object.keys(updates).length > 0) {
      await supabase
        .from('personalization_metrics')
        .update(updates)
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error updating user metrics:", error);
    // Continue execution even if metrics update fails
  }
}
