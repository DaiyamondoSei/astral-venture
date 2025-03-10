
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Type definitions
type PerformanceMetric = {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenderCount: number;
  firstRenderTime?: number;
};

type TrackPerformanceRequest = {
  userId?: string;
  sessionId: string;
  metrics: PerformanceMetric[];
  deviceInfo?: {
    userAgent: string;
    deviceCategory: 'low' | 'medium' | 'high';
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connectionType?: string;
    viewport?: {
      width: number;
      height: number;
    };
    screenSize?: {
      width: number;
      height: number;
    };
    pixelRatio?: number;
  };
  route?: string;
  timestamp: string;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request data
    const requestData: TrackPerformanceRequest = await req.json();
    const { userId, sessionId, metrics, deviceInfo, route, timestamp } = requestData;

    if (!sessionId || !metrics || !Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data. Required: sessionId and metrics array" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Store performance metrics in database
    const { error: insertError } = await supabase
      .from("performance_metrics")
      .insert({
        user_id: userId || null,
        session_id: sessionId,
        metrics: metrics,
        device_info: deviceInfo || null,
        route: route || null,
        timestamp: timestamp || new Date().toISOString()
      });

    if (insertError) {
      console.error("Error inserting performance metrics:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store performance metrics" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Analyze metrics for actionable insights
    const slowComponents = metrics
      .filter(m => m.slowRenderCount > 0)
      .sort((a, b) => b.slowRenderCount - a.slowRenderCount);
    
    // Get top 3 slow components for immediate attention
    const topSlowComponents = slowComponents.slice(0, 3).map(c => ({
      name: c.componentName,
      avgRenderTime: c.averageRenderTime,
      slowRenderCount: c.slowRenderCount
    }));

    // Calculate overall performance score (simplistic version)
    // Lower score is better, score of 1.0 means all renders are within threshold
    let performanceScore = 1.0;
    if (metrics.length > 0) {
      const totalSlowRenders = metrics.reduce((sum, m) => sum + m.slowRenderCount, 0);
      const totalRenders = metrics.reduce((sum, m) => sum + m.renderCount, 0);
      if (totalRenders > 0) {
        performanceScore = 1 + (totalSlowRenders / totalRenders);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        performanceScore,
        topSlowComponents: topSlowComponents.length > 0 ? topSlowComponents : null,
        metricCount: metrics.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
