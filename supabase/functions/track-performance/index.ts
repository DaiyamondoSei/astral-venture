
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Import shared utilities
import { 
  createSuccessResponse, 
  createErrorResponse, 
  ErrorCode, 
  validateRequiredParameters,
  logEvent,
  handleCorsRequest
} from "../shared/responseUtils.ts";
import { withAuth, getSupabaseAdmin } from "../shared/authUtils.ts";
import { executeQuery } from "../shared/databaseUtils.ts";

// Define performance metric types matching frontend types
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

interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  deviceMemory?: number | 'unknown';
  hardwareConcurrency?: number | 'unknown';
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
}

interface PerformanceMetricPayload {
  sessionId: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  metrics: ComponentMetric[];
  webVitals: WebVitalMetric[];
  timestamp: number;
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  return withAuth(req, handleTrackPerformance);
});

/**
 * Handler for the track-performance edge function
 */
async function handleTrackPerformance(user: any, req: Request): Promise<Response> {
  try {
    logEvent("info", "Processing performance metrics", { userId: user.id });
    
    // Parse and validate request body
    let payload: PerformanceMetricPayload;
    try {
      payload = await req.json();
      
      // Validate required fields
      const validation = validateRequiredParameters(
        { 
          sessionId: payload.sessionId, 
          timestamp: payload.timestamp,
          deviceInfo: payload.deviceInfo 
        },
        ["sessionId", "timestamp", "deviceInfo"]
      );
      
      if (!validation.isValid) {
        return createErrorResponse(
          ErrorCode.MISSING_PARAMETERS,
          "Missing required parameters",
          { missingParams: validation.missingParams }
        );
      }
    } catch (error) {
      return createErrorResponse(
        ErrorCode.VALIDATION_FAILED,
        "Invalid request format",
        { details: error.message }
      );
    }
    
    // Create session record if it doesn't exist
    const { error: sessionError } = await executeQuery(
      'performance_sessions',
      'upsert',
      {
        data: {
          session_id: payload.sessionId,
          user_id: user.id,
          device_info: payload.deviceInfo,
          app_version: payload.appVersion,
          created_at: new Date().toISOString()
        }
      }
    );

    if (sessionError) {
      logEvent("error", "Error storing session", { error: sessionError });
      return createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        "Failed to store session data",
        { details: sessionError.message }
      );
    }
    
    // Track component metrics
    if (payload.metrics && payload.metrics.length > 0) {
      await trackComponentMetrics(user.id, payload.sessionId, payload.metrics);
    }
    
    // Track web vitals
    if (payload.webVitals && payload.webVitals.length > 0) {
      await trackWebVitals(user.id, payload.sessionId, payload.webVitals);
    }
    
    // Generate aggregated metrics
    const success = await generateAggregatedMetrics(user.id);
    
    // Return success response
    return createSuccessResponse({
      message: "Performance metrics tracked successfully",
      count: {
        components: payload.metrics?.length || 0,
        webVitals: payload.webVitals?.length || 0
      },
      aggregationSuccessful: success
    });
    
  } catch (error) {
    logEvent("error", "Unexpected error in track-performance", { error });
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      "An unexpected error occurred",
      { details: error.message }
    );
  }
}

/**
 * Track component metrics
 */
async function trackComponentMetrics(
  userId: string, 
  sessionId: string,
  metrics: ComponentMetric[]
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    const componentMetrics = metrics.map(metric => ({
      component_name: metric.componentName,
      render_time: metric.renderTime,
      render_type: metric.renderType,
      user_id: userId,
      timestamp: new Date(metric.timestamp).toISOString(),
      session_id: sessionId
    }));
    
    const { error } = await supabase
      .from('performance_component_metrics')
      .insert(componentMetrics);
    
    if (error) {
      logEvent("error", "Error storing component metrics", { error });
    }
  } catch (error) {
    logEvent("error", "Exception storing component metrics", { error });
  }
}

/**
 * Track web vitals
 */
async function trackWebVitals(
  userId: string, 
  sessionId: string,
  webVitals: WebVitalMetric[]
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    const vitals = webVitals.map(vital => ({
      metric_name: vital.name,
      metric_value: vital.value,
      category: vital.category,
      user_id: userId,
      timestamp: new Date(vital.timestamp).toISOString(),
      session_id: sessionId
    }));
    
    const { error } = await supabase
      .from('performance_web_vitals')
      .insert(vitals);
    
    if (error) {
      logEvent("error", "Error storing web vitals", { error });
    }
  } catch (error) {
    logEvent("error", "Exception storing web vitals", { error });
  }
}

/**
 * Generate aggregated metrics for reporting
 */
async function generateAggregatedMetrics(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    
    // Call the database function to generate aggregated metrics
    const { error } = await supabase.rpc('generate_performance_aggregates', {
      user_id_param: userId
    });
    
    if (error) {
      logEvent("error", "Error generating aggregated metrics", { error });
      return false;
    }
    
    return true;
  } catch (error) {
    logEvent("error", "Exception generating aggregated metrics", { error });
    return false;
  }
}
