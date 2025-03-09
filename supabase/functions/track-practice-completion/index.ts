
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCorsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Authorization middleware
async function withAuth(req: Request, handler: Function): Promise<Response> {
  try {
    // Get JWT token from request
    const authorization = req.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Call the handler with the authenticated user
    return await handler(user, req);
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during authentication' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Process practice completion
async function processPracticeCompletion(user: any, req: Request): Promise<Response> {
  try {
    const { userId, practiceId, duration, reflection } = await req.json();
    
    // Validate the request
    if (!userId || !practiceId || !duration) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify the user ID matches the authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get practice details to calculate energy points
    const { data: practice, error: practiceError } = await supabaseAdmin
      .from('practices')
      .select('energy_points, type, chakra_association')
      .eq('id', practiceId)
      .single();
    
    if (practiceError || !practice) {
      return new Response(
        JSON.stringify({ error: "Practice not found", details: practiceError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Calculate energy points
    let energyPointsEarned = practice.energy_points;
    
    // Bonus points for longer meditation sessions
    if (practice.type === 'meditation' && duration > 10) {
      energyPointsEarned += Math.floor(duration / 5); // Bonus points for every 5 minutes
    }
    
    // Record practice completion
    const { data: completion, error: completionError } = await supabaseAdmin
      .from('practice_completions')
      .insert({
        user_id: userId,
        practice_id: practiceId,
        duration,
        energy_points_earned: energyPointsEarned,
        reflection,
        chakras_activated: practice.chakra_association,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (completionError) {
      return new Response(
        JSON.stringify({ error: "Failed to record completion", details: completionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update user's total energy points
    const { data: userProfile, error: userError } = await supabaseAdmin
      .rpc('increment_points', {
        row_id: userId,
        points_to_add: energyPointsEarned
      });
    
    if (userError) {
      console.error("Error updating user points:", userError);
      // Continue even if points update fails
    }
    
    // Update user streak and stats (as a background task)
    EdgeRuntime.waitUntil(updateUserPracticeStats(supabaseAdmin, userId, practice.type));
    
    return new Response(
      JSON.stringify({
        success: true,
        completionId: completion.id,
        energyPointsEarned,
        chakrasActivated: practice.chakra_association
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in practice completion:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Background task to update user practice stats
async function updateUserPracticeStats(supabaseClient: any, userId: string, practiceType: string) {
  try {
    // Get last completion date
    const { data: lastCompletion } = await supabaseClient
      .from('practice_completions')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(2);
    
    if (!lastCompletion || lastCompletion.length < 2) {
      // First completion or not enough data for streak
      return;
    }
    
    // Check if this is a continuation of a streak (completed within last 36 hours)
    const lastCompletionDate = new Date(lastCompletion[1].completed_at);
    const now = new Date();
    const hoursDifference = (now.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60);
    
    let streakIncrement = 0;
    
    if (hoursDifference <= 36) {
      // Continuation of streak
      streakIncrement = 1;
    } else {
      // Streak broken
      streakIncrement = 0;
      // Reset streak
      await supabaseClient
        .from('user_streaks')
        .update({ current_streak: 0 })
        .eq('user_id', userId);
    }
    
    if (streakIncrement > 0) {
      // Update streak
      const { data: streak } = await supabaseClient
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .single();
      
      if (streak) {
        const newCurrentStreak = streak.current_streak + streakIncrement;
        const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);
        
        await supabaseClient
          .from('user_streaks')
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak
          })
          .eq('user_id', userId);
      }
    }
    
    // Update practice stats
    const { data: stats, error: statsError } = await supabaseClient
      .from('practice_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (statsError && statsError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error("Error retrieving practice stats:", statsError);
      return;
    }
    
    // Create or update practice stats
    if (!stats) {
      // Create new stats
      await supabaseClient
        .from('practice_stats')
        .insert({
          user_id: userId,
          total_completed: 1,
          favorite_type: practiceType,
          practice_counts: { [practiceType]: 1 },
          last_completed_at: new Date().toISOString()
        });
    } else {
      // Update existing stats
      const practiceCounts = stats.practice_counts || {};
      practiceCounts[practiceType] = (practiceCounts[practiceType] || 0) + 1;
      
      // Determine favorite type
      let favoriteType = stats.favorite_type;
      let maxCount = 0;
      
      for (const [type, count] of Object.entries(practiceCounts)) {
        if (count > maxCount) {
          maxCount = count as number;
          favoriteType = type;
        }
      }
      
      await supabaseClient
        .from('practice_stats')
        .update({
          total_completed: stats.total_completed + 1,
          favorite_type: favoriteType,
          practice_counts: practiceCounts,
          last_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error updating practice stats:", error);
  }
}

// Main edge function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }
  
  // Process with authentication
  return withAuth(req, processPracticeCompletion);
});
