
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Import shared types
// Note: Edge functions cannot directly import from src/, this is a representation
// of how the types would be shared using type definitions
interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

interface ComponentMetric {
  componentName: string;
  renderTime: number;
  renderType: 'initial' | 'update' | 'effect';
  timestamp: number;
}

interface WebVitalMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

interface PerformanceMetricPayload {
  sessionId: string;
  deviceInfo: any;
  appVersion: string;
  metrics: ComponentMetric[];
  webVitals: WebVitalMetric[];
  timestamp: number;
}

// CORS headers for cross-origin requests
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
    // Extract user information from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse({
        code: "AUTHENTICATION_ERROR",
        message: "Missing or invalid authorization token",
      }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return createErrorResponse({
        code: "AUTHENTICATION_ERROR",
        message: "Invalid authorization token",
        details: authError?.message
      }, 401);
    }

    // Parse payload
    const payload: PerformanceMetricPayload = await req.json();
    
    // Validate payload
    if (!validatePayload(payload)) {
      return createErrorResponse({
        code: "VALIDATION_ERROR",
        message: "Invalid performance metrics payload"
      }, 400);
    }

    // Create session record if it doesn't exist
    const { error: sessionError } = await supabase
      .from('performance_sessions')
      .upsert({
        session_id: payload.sessionId,
        user_id: user.id,
        device_info: payload.deviceInfo,
        app_version: payload.appVersion,
        created_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

    if (sessionError) {
      console.error("Error storing session:", sessionError);
      return createErrorResponse({
        code: "DATABASE_ERROR",
        message: "Failed to store session data",
        details: sessionError.message
      }, 500);
    }
    
    // Track component metrics
    if (payload.metrics && payload.metrics.length > 0) {
      const componentMetrics = payload.metrics.map(metric => ({
        component_name: metric.componentName,
        render_time: metric.renderTime,
        render_type: metric.renderType,
        user_id: user.id,
        timestamp: new Date(metric.timestamp).toISOString(),
        session_id: payload.sessionId
      }));
      
      const { error: metricsError } = await supabase
        .from('performance_component_metrics')
        .insert(componentMetrics);
      
      if (metricsError) {
        console.error("Error storing component metrics:", metricsError);
        // Continue even if there's an error with component metrics
      }
    }
    
    // Track web vitals
    if (payload.webVitals && payload.webVitals.length > 0) {
      const webVitals = payload.webVitals.map(vital => ({
        metric_name: vital.name,
        metric_value: vital.value,
        category: vital.category,
        user_id: user.id,
        timestamp: new Date(vital.timestamp).toISOString(),
        session_id: payload.sessionId
      }));
      
      const { error: vitalsError } = await supabase
        .from('performance_web_vitals')
        .insert(webVitals);
      
      if (vitalsError) {
        console.error("Error storing web vitals:", vitalsError);
        // Continue even if there's an error with web vitals
      }
    }
    
    // Return success response
    return createSuccessResponse({
      message: "Performance metrics tracked successfully",
      count: {
        components: payload.metrics?.length || 0,
        webVitals: payload.webVitals?.length || 0
      }
    });
    
  } catch (error) {
    console.error("Unexpected error in track-performance:", error);
    return createErrorResponse({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details: error.message
    }, 500);
  }
});

// Helper functions

function validatePayload(payload: PerformanceMetricPayload): boolean {
  if (!payload) return false;
  if (!payload.sessionId || typeof payload.sessionId !== 'string') return false;
  if (!payload.timestamp || typeof payload.timestamp !== 'number') return false;
  
  // Validate metrics if present
  if (payload.metrics && (!Array.isArray(payload.metrics) || 
      payload.metrics.some(m => !m.componentName || !m.renderTime))) {
    return false;
  }
  
  // Validate web vitals if present
  if (payload.webVitals && (!Array.isArray(payload.webVitals) || 
      payload.webVitals.some(v => !v.name || typeof v.value !== 'number'))) {
    return false;
  }
  
  return true;
}

function createSuccessResponse<T>(data: T): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

function createErrorResponse(
  error: { code: string; message: string; details?: any },
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
