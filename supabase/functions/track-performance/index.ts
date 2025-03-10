
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", details: authError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { metrics, vitals } = await req.json();
    const userId = user.id;
    const timestamp = new Date().toISOString();

    // Process metrics if present
    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
      const metricsWithUser = metrics.map((metric) => ({
        ...metric,
        user_id: userId,
        created_at: timestamp,
      }));

      const { error: metricsError } = await supabase
        .from("performance_metrics")
        .insert(metricsWithUser);

      if (metricsError) {
        console.error("Error inserting metrics:", metricsError);
        return new Response(
          JSON.stringify({ error: "Failed to save metrics", details: metricsError }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Process web vitals if present
    if (vitals && Array.isArray(vitals) && vitals.length > 0) {
      const vitalsWithUser = vitals.map((vital) => ({
        ...vital,
        user_id: userId,
        timestamp: vital.timestamp || timestamp,
      }));

      const { error: vitalsError } = await supabase
        .from("web_vitals")
        .insert(vitalsWithUser);

      if (vitalsError) {
        console.error("Error inserting web vitals:", vitalsError);
        return new Response(
          JSON.stringify({ error: "Failed to save web vitals", details: vitalsError }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Performance data recorded successfully",
        timestamp,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in track-performance function:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
