
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define achievement threshold checks
const achievementChecks = [
  {
    id: 'chakra_first_activation',
    query: async (supabase, userId) => {
      const { data, error } = await supabase
        .from('user_chakras')
        .select('*')
        .eq('user_id', userId)
        .gte('activation_level', 0.5)
        .limit(1);
      
      return { 
        meetsThreshold: data && data.length > 0,
        progress: data && data.length > 0 ? 100 : 0 
      };
    }
  },
  {
    id: 'chakra_three_activated',
    query: async (supabase, userId) => {
      const { data, error } = await supabase
        .from('user_chakras')
        .select('*')
        .eq('user_id', userId)
        .gte('activation_level', 0.5);
      
      const chakraCount = data?.length || 0;
      const progress = Math.min((chakraCount / 3) * 100, 100);
      
      return { 
        meetsThreshold: chakraCount >= 3,
        progress 
      };
    }
  },
  {
    id: 'chakra_all_activated',
    query: async (supabase, userId) => {
      const { data, error } = await supabase
        .from('user_chakras')
        .select('*')
        .eq('user_id', userId)
        .gte('activation_level', 0.5);
      
      const chakraCount = data?.length || 0;
      const progress = Math.min((chakraCount / 7) * 100, 100);
      
      return { 
        meetsThreshold: chakraCount >= 7,
        progress 
      };
    }
  },
  {
    id: 'portal_resonance_3',
    query: async (supabase, userId) => {
      const { data, error } = await supabase.rpc('get_user_portal_state', { user_id_param: userId });
      
      if (error) {
        console.error("Portal state error:", error);
        return { meetsThreshold: false, progress: 0 };
      }
      
      const portalState = data?.[0];
      const resonanceLevel = portalState?.resonance_level || 0;
      const progress = Math.min((resonanceLevel / 3) * 100, 100);
      
      return { 
        meetsThreshold: resonanceLevel >= 3,
        progress 
      };
    }
  }
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Run all achievement checks and update achievements that meet thresholds
    const results = await Promise.all(
      achievementChecks.map(async (check) => {
        const { meetsThreshold, progress } = await check.query(supabase, userId);
        
        // Update achievement progress or award achievement if threshold met
        if (progress > 0) {
          const { data, error } = await supabase.rpc(
            'update_achievement_progress', 
            { 
              user_id_param: userId,
              achievement_id_param: check.id,
              progress_value: progress,
              auto_award: meetsThreshold
            }
          );
          
          if (error) {
            console.error(`Error updating achievement ${check.id}:`, error);
            return { id: check.id, success: false, error: error.message };
          }
          
          return { 
            id: check.id, 
            success: true, 
            awarded: meetsThreshold,
            progress
          };
        }
        
        return { id: check.id, success: true, awarded: false, progress };
      })
    );
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
