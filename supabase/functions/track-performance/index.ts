
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
function handleCorsRequest() {
  return new Response(null, {
    headers: corsHeaders
  });
}

// Create error response with consistent format
function createErrorResponse(code: string, message: string, details?: any, status = 400) {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details
      },
      success: false
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

// Create success response with consistent format
function createSuccessResponse(data: any, metadata?: any) {
  return new Response(
    JSON.stringify({
      data,
      metadata,
      success: true
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

// Validate required parameters
function validateRequiredParameters(data: any, requiredParams: string[]) {
  const missingParams = requiredParams.filter(param => data[param] === undefined);
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

// Create Supabase client
function createSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Process performance data
function processPerformanceData(data: any, userId: string) {
  try {
    const sessionId = data.sessionId || `session-${Date.now()}`;
    
    // Process component metrics
    const componentMetrics = Array.isArray(data.metrics) 
      ? data.metrics.map((metric: any) => ({
          component_name: metric.componentName,
          render_time: metric.renderTime,
          render_type: metric.renderType || 'update',
          timestamp: new Date(metric.timestamp || Date.now()).toISOString(),
          user_id: userId
        }))
      : [];
    
    // Process web vitals
    const webVitals = Array.isArray(data.webVitals) 
      ? data.webVitals.map((vital: any) => ({
          metric_name: vital.name,
          metric_value: vital.value,
          category: vital.category || 'performance',
          timestamp: new Date(vital.timestamp || Date.now()).toISOString(),
          user_id: userId
        }))
      : [];
    
    // Create session record
    const session = {
      session_id: sessionId,
      user_id: userId,
      device_info: data.deviceInfo || {},
      app_version: data.appVersion || '1.0.0',
      created_at: new Date().toISOString()
    };
    
    return {
      session,
      componentMetrics,
      webVitals
    };
  } catch (error) {
    console.error("Error processing performance data:", error);
    throw new Error(`Failed to process performance data: ${error.message}`);
  }
}

// Main handler for tracking performance metrics
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createErrorResponse(
        "INVALID_JSON",
        "Invalid JSON in request body",
        { error: parseError.message },
        400
      );
    }
    
    // Validate required fields - metrics or webVitals must be present
    if ((!requestData.metrics || !Array.isArray(requestData.metrics) || requestData.metrics.length === 0) &&
        (!requestData.webVitals || !Array.isArray(requestData.webVitals) || requestData.webVitals.length === 0)) {
      return createErrorResponse(
        "MISSING_PARAMETERS",
        "Missing or invalid performance metrics",
        { details: "Either metrics or webVitals array must be provided" },
        400
      );
    }

    // Get session ID or generate one
    const sessionId = requestData.sessionId || `session-${Date.now()}`;
    
    // Extract user information if available
    const { userId } = requestData;
    let tokenUserId = null;
    
    // Get the authorization header if present
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      // Extract the token
      const token = authHeader.replace('Bearer ', '');
      
      // Get the user from the token
      const supabase = createSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && user) {
        tokenUserId = user.id;
      }
    }
    
    // Use provided userId, tokenUserId, or 'anonymous'
    const effectiveUserId = userId || tokenUserId || 'anonymous';
    
    // Process the performance data
    const processedData = processPerformanceData(requestData, effectiveUserId);
    
    // Create a new Supabase client
    const supabase = createSupabaseClient();
    
    // Store session data
    const { error: sessionError } = await supabase
      .from('performance_sessions')
      .upsert([processedData.session], {
        onConflict: 'session_id'
      });
    
    if (sessionError) {
      console.error("Error storing session data:", sessionError);
    }
    
    // Store component metrics if present
    if (processedData.componentMetrics.length > 0) {
      const { error: metricsError } = await supabase
        .from('performance_component_metrics')
        .insert(processedData.componentMetrics);
      
      if (metricsError) {
        console.error("Error storing component metrics:", metricsError);
      }
    }
    
    // Store web vitals if present
    if (processedData.webVitals.length > 0) {
      const { error: vitalsError } = await supabase
        .from('performance_web_vitals')
        .insert(processedData.webVitals);
      
      if (vitalsError) {
        console.error("Error storing web vitals:", vitalsError);
      }
    }
    
    // Return success response
    return createSuccessResponse(
      { 
        session: sessionId,
        metricsCount: processedData.componentMetrics.length,
        vitalsCount: processedData.webVitals.length,
        message: `Successfully tracked performance data for user ${effectiveUserId}`
      },
      { 
        userId: effectiveUserId,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Error in track-performance function:", error);
    
    return createErrorResponse(
      "INTERNAL_ERROR",
      "An error occurred while tracking performance",
      { error: error.message },
      500
    );
  }
});
