
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
    
    // Update user metrics based on activity type
    await updateUserMetrics(supabase, userId, activityType, metadata);
    
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

// Update user metrics based on activity type
async function updateUserMetrics(supabase: any, userId: string, activityType: string, metadata: any) {
  try {
    // Get current metrics
    const { data: metrics } = await supabase
      .from('personalization_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!metrics) {
      // Create new metrics record if it doesn't exist
      await supabase
        .from('personalization_metrics')
        .insert({
          user_id: userId,
          engagement_score: activityType === 'ai_guidance' ? 5 : 1
        });
    } else {
      // Update existing metrics
      const updates: Record<string, number> = {};
      
      // Increase engagement score for AI interactions
      if (activityType === 'ai_guidance' || activityType === 'divine_guidance') {
        updates.engagement_score = Math.min(100, (metrics.engagement_score || 0) + 5);
      }
      
      // Increase content relevance for specific activities
      if (['practice_completion', 'reflection_creation', 'meditation'].includes(activityType)) {
        updates.content_relevance_rating = Math.min(100, (metrics.content_relevance_rating || 0) + 3);
      }
      
      // Update chakra balance improvement if chakras were activated
      if (metadata?.chakrasActivated) {
        updates.chakra_balance_improvement = Math.min(100, (metrics.chakra_balance_improvement || 0) + 2);
      }
      
      // Update emotional growth if emotions were processed
      if (metadata?.emotionalResponse || activityType === 'reflection_creation') {
        updates.emotional_growth_rate = Math.min(100, (metrics.emotional_growth_rate || 0) + 3);
      }
      
      // Apply updates if there are any
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('personalization_metrics')
          .update(updates)
          .eq('user_id', userId);
      }
    }
  } catch (error) {
    console.error("Error updating user metrics:", error);
    // Continue execution even if metrics update fails
  }
}
