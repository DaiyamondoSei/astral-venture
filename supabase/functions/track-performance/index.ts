
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Main handler for tracking performance metrics
async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse the request body
    const { metrics, userId } = await req.json();
    
    if (!metrics) {
      return new Response(
        JSON.stringify({ error: "Performance metrics are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get the authorization header if present
    const authHeader = req.headers.get('Authorization');
    let tokenUserId = null;
    
    if (authHeader) {
      // Extract the token
      const token = authHeader.replace('Bearer ', '');
      
      // Get the user from the token
      const supabase = createSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && user) {
        tokenUserId = user.id;
      }
    }
    
    // Use provided userId or tokenUserId
    const effectiveUserId = userId || tokenUserId || 'anonymous';
    
    // Create a new Supabase client
    const supabase = createSupabaseClient();
    
    // Insert the performance metrics
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(metrics.map((metric: any) => ({
        ...metric,
        user_id: effectiveUserId
      })));
    
    if (error) {
      console.error("Error inserting performance metrics:", error);
      return new Response(
        JSON.stringify({ error: "Failed to store performance metrics" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Tracked ${metrics.length} performance metrics`,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in track-performance function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while tracking performance",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}

serve(handler);
