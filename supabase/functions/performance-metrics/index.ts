
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { 
  corsHeaders,
  createPreflightResponse,
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  validateRequiredParameters
} from "../shared/responseUtils.ts";
import { withAuth } from "../shared/authUtils.ts";

// Define the metrics payload type
interface PerformanceMetricPayload {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  max_render_time: number;
  min_render_time: number;
  metric_type: string;
  context?: Record<string, any>;
}

interface WebVitalPayload {
  name: string;
  value: number;
  category: 'interaction' | 'loading' | 'visual_stability';
}

interface MetricsPayload {
  metrics: PerformanceMetricPayload[];
  webVitals?: WebVitalPayload[];
  deviceInfo?: {
    deviceType?: string;
    browserName?: string;
    osName?: string;
    screenWidth?: number;
    screenHeight?: number;
    connectionType?: string;
  };
}

/**
 * Process performance metrics
 */
async function handleMetricsRequest(user: any, req: Request) {
  try {
    // Parse request body
    const payload: MetricsPayload = await req.json();
    
    // Validate required parameters
    const validation = validateRequiredParameters(
      { metrics: payload.metrics },
      ["metrics"]
    );
    
    if (!validation.isValid) {
      return createErrorResponse(
        ErrorCode.MISSING_PARAMETERS,
        "Missing required parameters",
        { missingParams: validation.missingParams }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Ensure the performance_metrics table exists
    await supabase.rpc('ensure_performance_metrics_table');
    
    // Process performance metrics
    if (payload.metrics && payload.metrics.length > 0) {
      const metricsWithUser = payload.metrics.map(metric => ({
        ...metric,
        user_id: user?.id || null,
        client_timestamp: new Date().toISOString()
      }));
      
      const { error: metricsError } = await supabase
        .from('performance_metrics')
        .insert(metricsWithUser);
      
      if (metricsError) {
        console.error("Error inserting performance metrics:", metricsError);
      }
    }
    
    // Process web vitals if provided
    if (payload.webVitals && payload.webVitals.length > 0) {
      const webVitalsWithUser = payload.webVitals.map(vital => ({
        name: vital.name,
        value: vital.value,
        category: vital.category,
        user_id: user?.id || null,
        client_timestamp: new Date().toISOString()
      }));
      
      const { error: vitalsError } = await supabase
        .from('web_vitals')
        .insert(webVitalsWithUser);
      
      if (vitalsError) {
        console.error("Error inserting web vitals:", vitalsError);
      }
    }
    
    // Process device info if provided
    if (payload.deviceInfo) {
      // Store device info in a separate table or as part of user profile
      // This is optional and can be implemented in the future
    }
    
    return createSuccessResponse(
      { processed: payload.metrics.length, timestamp: new Date().toISOString() },
      { operation: "metrics_processed" }
    );
  } catch (error) {
    console.error("Error processing metrics:", error);
    return createErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Failed to process metrics",
      { errorMessage: error.message }
    );
  }
}

/**
 * Get performance metrics for a user or the system
 */
async function handleGetMetrics(user: any, req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const component = url.searchParams.get('component');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get metrics for the user
    const metrics = await supabase.rpc(
      'get_performance_metrics',
      {
        user_id_param: user.id,
        limit_param: limit,
        offset_param: offset
      }
    );
    
    if (metrics.error) {
      return createErrorResponse(
        ErrorCode.SERVER_ERROR,
        "Failed to retrieve metrics",
        { errorMessage: metrics.error.message }
      );
    }
    
    // Filter by component if specified
    let results = metrics.data;
    if (component) {
      results = results.filter(m => m.component_name === component);
    }
    
    return createSuccessResponse(
      { metrics: results },
      { 
        count: results.length,
        limit,
        offset
      }
    );
  } catch (error) {
    console.error("Error retrieving metrics:", error);
    return createErrorResponse(
      ErrorCode.SERVER_ERROR,
      "Failed to retrieve metrics",
      { errorMessage: error.message }
    );
  }
}

// Main handler for the edge function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return createPreflightResponse();
  }
  
  // Get endpoint
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();

  // Route requests
  if (req.method === "GET") {
    return withAuth(req, handleGetMetrics);
  } else if (req.method === "POST") {
    return withAuth(req, handleMetricsRequest);
  } else {
    return createErrorResponse(
      ErrorCode.INVALID_PARAMETERS,
      "Method not supported",
      { method: req.method }
    );
  }
});
