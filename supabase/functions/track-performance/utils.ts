
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Simple validation for performance data
export function validatePerformancePayload(data: any) {
  if (!data) {
    return { valid: false, error: "Missing performance data" };
  }
  
  // Check essential fields
  if (!data.sessionId) {
    return { valid: false, error: "Missing sessionId" };
  }
  
  // Ensure metrics and vitals are arrays
  if (data.metrics && !Array.isArray(data.metrics)) {
    return { valid: false, error: "metrics must be an array" };
  }
  
  if (data.webVitals && !Array.isArray(data.webVitals)) {
    return { valid: false, error: "webVitals must be an array" };
  }
  
  // Check device info
  if (!data.deviceInfo || typeof data.deviceInfo !== 'object') {
    return { valid: false, error: "Missing or invalid deviceInfo" };
  }
  
  return { valid: true };
}

// Process and aggregate metrics for storage
export function processMetrics(rawData: any, userId: string) {
  // Compute aggregate metrics
  const aggregateMetrics = aggregateComponentMetrics(rawData.metrics || []);
  
  // Enhance with additional context
  return {
    user_id: userId,
    session_id: rawData.sessionId,
    timestamp: new Date().toISOString(),
    device_category: rawData.deviceInfo.deviceCategory || 'unknown',
    device_info: rawData.deviceInfo,
    metrics: aggregateMetrics,
    web_vitals: rawData.webVitals || [],
    app_version: rawData.appVersion || '1.0.0',
    sessionId: rawData.sessionId
  };
}

// Aggregate metrics by component
function aggregateComponentMetrics(metrics: any[]) {
  const componentMap = new Map<string, any>();
  
  // Group by component
  for (const metric of metrics) {
    const componentName = metric.componentName;
    
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, {
        componentName,
        renderCount: 0,
        totalRenderTime: 0,
        avgRenderTime: 0,
        minRenderTime: Infinity,
        maxRenderTime: -Infinity,
        lastRenderTime: 0,
        renderTimes: []
      });
    }
    
    const component = componentMap.get(componentName);
    component.renderCount += 1;
    component.totalRenderTime += metric.renderTime;
    component.minRenderTime = Math.min(component.minRenderTime, metric.renderTime);
    component.maxRenderTime = Math.max(component.maxRenderTime, metric.renderTime);
    component.lastRenderTime = metric.renderTime;
    component.renderTimes.push(metric.renderTime);
  }
  
  // Calculate averages and remove raw data
  const result = [];
  for (const [, component] of componentMap) {
    component.avgRenderTime = component.totalRenderTime / component.renderCount;
    
    // Calculate standard deviation
    if (component.renderTimes.length > 1) {
      const mean = component.avgRenderTime;
      const variance = component.renderTimes.reduce((acc: number, val: number) => 
        acc + Math.pow(val - mean, 2), 0) / component.renderTimes.length;
      component.stdDeviation = Math.sqrt(variance);
    } else {
      component.stdDeviation = 0;
    }
    
    // Remove raw render times array
    delete component.renderTimes;
    
    result.push(component);
  }
  
  return result;
}

// Store the processed metrics in Supabase
export async function storePerformanceMetrics(userId: string, data: any) {
  try {
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Insert metrics
    const { error } = await supabaseAdmin
      .from("performance_metrics")
      .insert({
        user_id: userId,
        session_id: data.session_id,
        device_category: data.device_category,
        device_info: data.device_info,
        metrics_data: data.metrics,
        web_vitals: data.web_vitals,
        app_version: data.app_version
      });
    
    if (error) {
      console.error("Error saving performance metrics:", error);
      return { saved: false, error: error.message };
    }
    
    return { saved: true };
  } catch (error) {
    console.error("Error in storePerformanceMetrics:", error);
    return { saved: false, error: error.message || "Database error" };
  }
}
