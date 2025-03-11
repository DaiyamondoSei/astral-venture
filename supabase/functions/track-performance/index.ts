
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import type { 
  TrackPerformancePayload, 
  TrackPerformanceResponse, 
  PerformanceMetric,
  WebVitalMetric 
} from "./types.ts";

/**
 * Edge Function: track-performance
 * 
 * Securely tracks performance metrics from client applications
 * and stores them in the database for analysis.
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process metrics
    const errors: Array<{metricIndex: number, message: string}> = [];
    const validMetrics: PerformanceMetric[] = [];
    const validWebVitals: WebVitalMetric[] = [];

    // Validate and sanitize each metric
    payload.metrics.forEach((metric, index) => {
      try {
        // Required fields validation
        if (!metric.metric_name || typeof metric.value !== 'number' || !metric.type) {
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

    // Process web vitals if present
    if (payload.webVitals && Array.isArray(payload.webVitals)) {
      payload.webVitals.forEach((vital, index) => {
        try {
          // Basic validation
          if (!vital.name || typeof vital.value !== 'number' || !vital.category) {
            throw new Error("Missing required fields in web vital");
          }

          validWebVitals.push(vital);
        } catch (error) {
          errors.push({ metricIndex: index, message: `Web vital error: ${error.message}` });
          console.error(`Error processing web vital at index ${index}:`, error);
        }
      });
    }

    // Ensure the performance_metrics table exists
    await supabase.rpc('ensure_performance_metrics_table');

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

    // Insert web vitals if present
    if (validWebVitals.length > 0) {
      const { error: vitalError } = await supabase
        .from("web_vitals")
        .insert(validWebVitals.map(vital => ({
          name: vital.name,
          value: vital.value,
          category: vital.category,
          user_id: payload.userId,
          client_timestamp: new Date(vital.timestamp).toISOString(),
          rating: vital.rating
        })));

      if (vitalError) {
        console.error(`Web vitals error: ${vitalError.message}`);
        errors.push({ metricIndex: -1, message: `Web vitals error: ${vitalError.message}` });
      } else {
        console.log(`Successfully processed ${validWebVitals.length} web vitals`);
      }
    }

    // Generate recommendations based on metrics
    const recommendations = generateRecommendations(validMetrics, validWebVitals);

    // Prepare response
    const response: TrackPerformanceResponse = {
      success: true,
      metricsProcessed: validMetrics.length + validWebVitals.length,
      timestamp: new Date().toISOString(),
      recommendations,
    };

    if (errors.length > 0) {
      response.success = validMetrics.length > 0 || validWebVitals.length > 0;
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
 * Generates recommendations based on performance metrics and web vitals
 */
function generateRecommendations(metrics: PerformanceMetric[], webVitals: WebVitalMetric[] = []): string[] {
  const recommendations: string[] = [];
  
  // Generate recommendations based on metrics
  const slowRenders = metrics.filter(m => 
    m.type === 'render' && m.value > 100); // 100ms threshold
  
  if (slowRenders.length > 0) {
    const components = [...new Set(slowRenders.map(m => m.component_name).filter(Boolean))];
    if (components.length > 0) {
      recommendations.push(
        `Consider optimizing these slow components: ${components.join(', ')}`
      );
    }
  }

  // Generate recommendations based on web vitals
  if (webVitals.length > 0) {
    const highCLS = webVitals.find(v => v.name === 'CLS' && v.value > 0.1);
    if (highCLS) {
      recommendations.push(
        `Consider improving visual stability - CLS is ${highCLS.value.toFixed(2)}`
      );
    }

    const slowLCP = webVitals.find(v => v.name === 'LCP' && v.value > 2500);
    if (slowLCP) {
      recommendations.push(
        `Consider improving loading performance - LCP is ${(slowLCP.value/1000).toFixed(2)}s`
      );
    }
  }
  
  return recommendations;
}
