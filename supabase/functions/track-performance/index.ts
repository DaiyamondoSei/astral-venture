
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define response headers for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Performance metric types
interface PerformanceMetric {
  component_name: string;
  metric_name: string;
  value: number;
  device_capability: string;
  user_agent?: string;
  user_id?: string;
}

// Create response utilities
function createResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Track performance metrics in the database
async function trackMetrics(supabase: any, metrics: PerformanceMetric[]) {
  const { data, error } = await supabase
    .from("performance_metrics")
    .insert(metrics.map(metric => ({
      ...metric,
      recorded_at: new Date().toISOString()
    })));
    
  if (error) {
    console.error("Error storing metrics:", error);
    throw error;
  }
  
  return data;
}

// Get performance summary
async function getPerformanceSummary(supabase: any, userId: string, timePeriod: string) {
  const { data, error } = await supabase.rpc('get_performance_summary', {
    user_id_param: userId,
    time_period: timePeriod
  });
  
  if (error) {
    console.error("Error getting performance summary:", error);
    throw error;
  }
  
  return data;
}

// Serve the HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    
    // Handle different actions
    if (req.method === "POST" && action === "track") {
      const { metrics, userId } = await req.json();
      
      if (!metrics || !Array.isArray(metrics)) {
        return createResponse({ error: "Invalid metrics data" }, 400);
      }
      
      // Add user_id to each metric if provided
      const metricsWithUserId = metrics.map(metric => ({
        ...metric,
        user_id: userId || null
      }));
      
      // Store the metrics
      await trackMetrics(supabase, metricsWithUserId);
      
      return createResponse({
        success: true,
        message: "Metrics stored successfully",
        count: metrics.length
      });
    } 
    else if (req.method === "GET" && action === "summary") {
      const params = new URLSearchParams(url.search);
      const userId = params.get("userId");
      const timePeriod = params.get("timePeriod") || "day";
      
      if (!userId) {
        return createResponse({ error: "userId is required" }, 400);
      }
      
      // Get the performance summary
      const summary = await getPerformanceSummary(supabase, userId, timePeriod);
      
      return createResponse({
        success: true,
        summary
      });
    }
    
    // Handle unknown action
    return createResponse({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("Error in performance tracking:", error);
    
    return createResponse({
      success: false,
      error: error.message || "An error occurred processing the request"
    }, 500);
  }
});
