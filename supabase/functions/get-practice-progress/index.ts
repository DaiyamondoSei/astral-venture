
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
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
    
    // Initialize Supabase client
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

// Get practice progress
async function getPracticeProgress(user: any, req: Request): Promise<Response> {
  try {
    const { userId } = await req.json();
    
    // Validate the request
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
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
    
    // Get practice stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('practice_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get user streak
    const { data: streak, error: streakError } = await supabaseAdmin
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .single();
    
    // Check if user completed a practice today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayCompletions, error: todayError } = await supabaseAdmin
      .from('practice_completions')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00Z`)
      .lte('completed_at', `${today}T23:59:59Z`)
      .limit(1);
    
    if (statsError && statsError.code !== 'PGRST116') {
      console.error("Error fetching practice stats:", statsError);
    }
    
    if (streakError && streakError.code !== 'PGRST116') {
      console.error("Error fetching streak:", streakError);
    }
    
    if (todayError) {
      console.error("Error checking today's completions:", todayError);
    }
    
    // Compile progress data
    const progress = {
      totalCompleted: stats?.total_completed || 0,
      streakCount: streak?.current_streak || 0,
      favoriteType: stats?.favorite_type || 'none',
      lastCompletedAt: stats?.last_completed_at || null,
      completedToday: todayCompletions && todayCompletions.length > 0
    };
    
    return new Response(
      JSON.stringify(progress),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting practice progress:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Main edge function handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }
  
  // Process with authentication
  return withAuth(req, getPracticeProgress);
});
