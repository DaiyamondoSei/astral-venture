
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
    const { metrics, vitals, timestamp } = await req.json();
    
    // Validate the payload
    if (!metrics || !Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ error: "Invalid metrics data: expected an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract authentication
    const authorization = req.headers.get("Authorization") || "";
    let userId = null;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify authentication if provided
    if (authorization.startsWith("Bearer ")) {
      const token = authorization.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (user && !authError) {
        userId = user.id;
      }
    }
    
    // Create the performance_metrics table if it doesn't exist
    const { error: schemaError } = await supabase.rpc("ensure_performance_metrics_table");
    
    if (schemaError) {
      console.error("Error ensuring performance metrics table:", schemaError);
    }
    
    // Store the metrics
    const { error: insertError } = await supabase
      .from("performance_metrics")
      .insert(
        metrics.map((metric: any) => ({
          ...metric,
          user_id: userId,
          client_timestamp: timestamp,
          server_timestamp: new Date().toISOString()
        }))
      );
    
    if (insertError) {
      console.error("Error inserting metrics:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Store web vitals if provided
    if (vitals && Array.isArray(vitals) && vitals.length > 0) {
      const { error: vitalsError } = await supabase
        .from("web_vitals")
        .insert(
          vitals.map((vital: any) => ({
            ...vital,
            user_id: userId,
            client_timestamp: vital.timestamp ? new Date(vital.timestamp).toISOString() : timestamp,
            server_timestamp: new Date().toISOString()
          }))
        );
      
      if (vitalsError) {
        console.error("Error inserting web vitals:", vitalsError);
      }
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Performance metrics recorded successfully",
        count: metrics.length
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
