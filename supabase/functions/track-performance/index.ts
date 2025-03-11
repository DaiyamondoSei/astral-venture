
/**
 * Performance Metrics Tracking Edge Function
 * 
 * This edge function receives performance metrics from clients and stores them in the database.
 * It includes comprehensive validation and error handling.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  validatePerformancePayload 
} from "./validation.ts";
import { processMetrics, storePerformanceMetrics } from "./utils.ts";
import { TrackPerformancePayload, PerformanceDataError } from "./types.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

// Supabase client initialization
function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed. Use POST."
      }),
      { 
        status: 405, 
        headers: corsHeaders 
      }
    );
  }

  try {
    // Parse request body
    const requestData = await req.json();
    
    // Validate the request payload
    const validation = validatePerformancePayload(requestData);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.message || "Invalid payload",
          details: validation.errors
        }),
        { 
          status: 400, 
          headers: corsHeaders 
        }
      );
    }

    // Get authenticated user (if available)
    const authHeader = req.headers.get('Authorization');
    let userId = "anonymous";
    
    if (authHeader) {
      const supabase = getSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1]);
      
      if (!error && user) {
        userId = user.id;
      }
    }
    
    // Use session ID from payload if available
    if (requestData.userId) {
      userId = requestData.userId;
    }
    
    // Process the validated payload
    const payload = requestData as TrackPerformancePayload;
    const processedData = processMetrics(payload, userId);
    
    // Store metrics in the database
    const storageResult = await storePerformanceMetrics(userId, processedData);
    
    if (!storageResult.saved) {
      throw new Error(storageResult.error || "Failed to save metrics");
    }
    
    // Calculate any performance recommendations
    const recommendations = generateRecommendations(payload);
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        metricsProcessed: payload.metrics.length + (payload.webVitals?.length || 0),
        timestamp: new Date().toISOString(),
        recommendations: recommendations.length > 0 ? recommendations : undefined
      }),
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
  } catch (error) {
    // Log the error
    console.error("Error processing performance metrics:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
});

/**
 * Generate performance recommendations based on metrics
 */
function generateRecommendations(payload: TrackPerformancePayload): string[] {
  const recommendations: string[] = [];
  
  // Check for slow rendering
  const renderMetrics = payload.metrics.filter(m => m.type === 'render');
  const slowRenders = renderMetrics.filter(m => m.value > 16);
  
  if (slowRenders.length > 0) {
    const components = [...new Set(slowRenders.map(m => m.component_name || 'Unknown'))];
    if (components.length === 1) {
      recommendations.push(`Consider optimizing the ${components[0]} component which is rendering slowly.`);
    } else if (components.length > 1) {
      recommendations.push(`Consider optimizing these slow rendering components: ${components.join(', ')}.`);
    }
  }
  
  // Check web vitals
  if (payload.webVitals) {
    const poorVitals = payload.webVitals.filter(v => v.rating === 'poor');
    
    if (poorVitals.length > 0) {
      const vitalNames = [...new Set(poorVitals.map(v => v.name))];
      recommendations.push(`Improve core web vitals: ${vitalNames.join(', ')}.`);
    }
    
    // Specific LCP recommendation
    const lcp = payload.webVitals.find(v => v.name === 'LCP');
    if (lcp && lcp.value > 2500) {
      recommendations.push(`Your Largest Contentful Paint (${Math.round(lcp.value)}ms) exceeds the recommended 2.5s threshold.`);
    }
    
    // Specific CLS recommendation
    const cls = payload.webVitals.find(v => v.name === 'CLS');
    if (cls && cls.value > 0.1) {
      recommendations.push(`Your Cumulative Layout Shift (${cls.value.toFixed(3)}) exceeds the recommended 0.1 threshold.`);
    }
  }
  
  // Check memory usage
  const memoryMetrics = payload.metrics.filter(m => m.type === 'memory');
  if (memoryMetrics.length > 0) {
    const highMemory = memoryMetrics.filter(m => m.value > 50000000); // 50MB
    if (highMemory.length > 0) {
      recommendations.push("Memory usage is high. Consider checking for memory leaks or optimizing resource usage.");
    }
  }
  
  return recommendations;
}
