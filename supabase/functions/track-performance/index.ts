
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  first_render_time: number | null;
  client_timestamp: string;
}

interface WebVitalMetric {
  name: string;
  value: number;
  category: 'interaction' | 'loading' | 'visual_stability';
  client_timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Setup Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from authorization header
    const authHeader = req.headers.get("Authorization");
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
      }
    }

    // Parse request body
    const { metrics = [], web_vitals = [] } = await req.json();

    // Insert metrics into database
    if (metrics.length > 0) {
      const metricsWithUserId = metrics.map((metric: PerformanceMetric) => ({
        ...metric,
        user_id: userId,
        recorded_at: new Date().toISOString()
      }));

      const { error: metricsError } = await supabase
        .from('performance_metrics')
        .insert(metricsWithUserId);

      if (metricsError) {
        console.error("Error inserting performance metrics:", metricsError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: metricsError.message,
            operation: "metrics" 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Insert web vitals into database
    if (web_vitals.length > 0) {
      const vitalsWithUserId = web_vitals.map((vital: WebVitalMetric) => ({
        ...vital,
        user_id: userId,
        recorded_at: new Date().toISOString()
      }));

      const { error: vitalsError } = await supabase
        .from('web_vitals')
        .insert(vitalsWithUserId);

      if (vitalsError) {
        console.error("Error inserting web vitals:", vitalsError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: vitalsError.message,
            operation: "web_vitals" 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics_count: metrics.length,
        vitals_count: web_vitals.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
