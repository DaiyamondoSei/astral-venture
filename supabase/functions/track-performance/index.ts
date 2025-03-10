
import { serve } from "std/server";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "supabase";
import type { TrackPerformancePayload, TrackPerformanceResponse, PerformanceMetric } from "./types.ts";

/**
 * Edge Function: track-performance
 * 
 * Securely tracks performance metrics from client applications
 * and stores them in the database for analysis
 */

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const payload: TrackPerformancePayload = await req.json();
    
    // Validate the payload
    if (!payload.metrics || !Array.isArray(payload.metrics) || payload.metrics.length === 0) {
      throw new Error("Invalid payload: metrics array is required");
    }

    // Validate timestamp
    if (!payload.timestamp || isNaN(Date.parse(payload.timestamp))) {
      throw new Error("Invalid payload: timestamp must be a valid date string");
    }

    // Process metrics
    const errors: Array<{metricIndex: number, message: string}> = [];
    const validMetrics: PerformanceMetric[] = [];

    // Validate and sanitize each metric
    payload.metrics.forEach((metric, index) => {
      try {
        // Required fields validation
        if (!metric.metric_name || !metric.value || !metric.type || !metric.category) {
          throw new Error("Missing required fields in metric");
        }

        // Sanitize and format the metric
        const sanitizedMetric: PerformanceMetric = {
          ...metric,
          timestamp: metric.timestamp || payload.timestamp,
          user_id: metric.user_id || payload.userId,
          session_id: metric.session_id || payload.sessionId,
          environment: Deno.env.get("ENVIRONMENT") || "production"
        };

        validMetrics.push(sanitizedMetric);
      } catch (error) {
        errors.push({ metricIndex: index, message: error.message });
        console.error(`Error processing metric at index ${index}:`, error);
      }
    });

    // Insert validated metrics into the database
    if (validMetrics.length > 0) {
      const { error: dbError } = await supabase
        .from("performance_metrics")
        .insert(validMetrics);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log(`Successfully processed ${validMetrics.length} metrics`);
    }

    // Track asynchronously in background
    if (typeof EdgeRuntime?.waitUntil === 'function' && validMetrics.length > 0) {
      EdgeRuntime.waitUntil(
        analyzeMetricsInBackground(validMetrics, supabase)
      );
    }

    // Prepare response
    const response: TrackPerformanceResponse = {
      success: true,
      metricsProcessed: validMetrics.length,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(validMetrics),
    };

    if (errors.length > 0) {
      response.success = validMetrics.length > 0;
      response.errors = errors;
    }

    // Return successful response
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Performs background analysis on metrics
 */
async function analyzeMetricsInBackground(
  metrics: PerformanceMetric[], 
  supabase: any
): Promise<void> {
  try {
    // Group metrics for analysis
    const webVitals = metrics.filter(m => 
      ["FCP", "LCP", "CLS", "FID", "TTFB", "INP"].includes(m.metric_name));
    
    const componentMetrics = metrics.filter(m => 
      m.type === 'render' && m.component_name);
    
    // Update performance summaries if needed
    if (webVitals.length > 0 || componentMetrics.length > 0) {
      const sessionId = metrics[0].session_id;
      
      if (sessionId) {
        // Check for existing summary
        const { data: existingData } = await supabase
          .from("performance_summaries")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();
        
        // Calculate summary data
        // This would be expanded in a real implementation
        
        // Log completion
        console.log(`Background analysis completed for session ${sessionId}`);
      }
    }
  } catch (error) {
    console.error("Background analysis error:", error);
  }
}

/**
 * Generates recommendations based on performance metrics
 */
function generateRecommendations(metrics: PerformanceMetric[]): string[] {
  const recommendations: string[] = [];
  
  // Example recommendation logic
  const slowRenders = metrics.filter(m => 
    m.type === 'render' && m.value > 100); // 100ms threshold
  
  if (slowRenders.length > 0) {
    const components = [...new Set(slowRenders.map(m => m.component_name))];
    if (components.length > 0) {
      recommendations.push(
        `Consider optimizing these slow components: ${components.join(', ')}`
      );
    }
  }
  
  return recommendations;
}
