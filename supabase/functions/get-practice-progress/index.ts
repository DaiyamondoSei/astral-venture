
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
    const { userId } = await req.json();
    
    // Validate inputs
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching practice progress for user ${userId}`);
    
    // Get total completed practices
    const { data: completions, error: completionsError } = await supabase
      .from('practice_completions')
      .select('id, practice_id, completed_at, practice_type:practices(type)')
      .eq('user_id', userId);
    
    if (completionsError) {
      return new Response(
        JSON.stringify({ error: "Error fetching completions: " + completionsError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      return new Response(
        JSON.stringify({ error: "Error fetching streak: " + streakError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the data
    const totalCompleted = completions.length;
    
    // Determine if user completed any practice today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = completions.some(
      completion => completion.completed_at.split('T')[0] === today
    );
    
    // Find favorite practice type
    const typeCounts: Record<string, number> = {};
    completions.forEach(completion => {
      const type = completion.practice_type?.type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    let favoriteType = 'none';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteType = type;
      }
    }
    
    // Get last completed date
    let lastCompletedAt = null;
    if (completions.length > 0) {
      // Sort by date (newest first)
      const sortedCompletions = [...completions].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      lastCompletedAt = sortedCompletions[0].completed_at;
    }
    
    const result = {
      totalCompleted,
      streakCount: streakData?.current_streak || 0,
      favoriteType,
      lastCompletedAt,
      completedToday
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing practice progress request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
