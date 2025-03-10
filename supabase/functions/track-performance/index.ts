
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
    // Parse request body
    const { metrics, web_vitals } = await req.json();
    
    // Get authorization token to identify user
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user ID if token is provided
    let userId = null;
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }
    
    // Ensure performance metrics table exists
    await supabase.rpc('ensure_performance_metrics_table');
    
    // Process component metrics if provided
    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
      // Add user_id and server timestamp to each metric
      const metricsWithUser = metrics.map(metric => ({
        ...metric,
        user_id: userId,
        server_timestamp: new Date().toISOString()
      }));
      
      // Insert metrics into database
      const { error: insertError } = await supabase
        .from('performance_metrics')
        .insert(metricsWithUser);
      
      if (insertError) {
        console.error("Error inserting performance metrics:", insertError);
        throw new Error(`Failed to insert metrics: ${insertError.message}`);
      }
      
      console.log(`Inserted ${metricsWithUser.length} performance metrics`);
    }
    
    // Process web vitals if provided
    if (web_vitals && Array.isArray(web_vitals) && web_vitals.length > 0) {
      // Add user_id and server timestamp to each web vital
      const vitalsWithUser = web_vitals.map(vital => ({
        ...vital,
        user_id: userId,
        server_timestamp: new Date().toISOString()
      }));
      
      // Insert web vitals into database
      const { error: insertError } = await supabase
        .from('web_vitals')
        .insert(vitalsWithUser);
      
      if (insertError) {
        console.error("Error inserting web vitals:", insertError);
        throw new Error(`Failed to insert web vitals: ${insertError.message}`);
      }
      
      console.log(`Inserted ${vitalsWithUser.length} web vitals`);
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Performance data recorded successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
