
/**
 * Validation utilities for the track-performance edge function
 */
import { 
  PerformanceMetric, 
  WebVitalMetric, 
  TrackPerformancePayload,
  ValidationResult,
  DeviceInfo,
  isValidMetricType,
  isValidWebVitalCategory,
  isValidWebVitalName
} from './types';

/**
 * Validates a performance metric object
 */
export function validatePerformanceMetric(metric: unknown, index: number): { valid: boolean; error?: string } {
  if (!metric || typeof metric !== 'object' || Array.isArray(metric)) {
    return { valid: false, error: `Metric at index ${index} must be an object` };
  }

  const typed = metric as Partial<PerformanceMetric>;
  
  // Required fields
  if (!typed.metric_name || typeof typed.metric_name !== 'string') {
    return { valid: false, error: `Metric at index ${index} missing required string field: metric_name` };
  }
  
  if (typed.value === undefined || typeof typed.value !== 'number' || isNaN(typed.value)) {
    return { valid: false, error: `Metric at index ${index} missing required number field: value` };
  }
  
  if (!typed.category || typeof typed.category !== 'string') {
    return { valid: false, error: `Metric at index ${index} missing required string field: category` };
  }
  
  if (!typed.type || typeof typed.type !== 'string' || !isValidMetricType(typed.type)) {
    return { 
      valid: false, 
      error: `Metric at index ${index} has invalid type. Must be one of: render, interaction, load, memory, network, resource, javascript, css, animation, metric, summary, performance, webVital` 
    };
  }
  
  // Optional fields with type validation
  if (typed.component_name !== undefined && typeof typed.component_name !== 'string') {
    return { valid: false, error: `Metric at index ${index} field component_name must be a string` };
  }
  
  if (typed.user_id !== undefined && typeof typed.user_id !== 'string') {
    return { valid: false, error: `Metric at index ${index} field user_id must be a string` };
  }
  
  if (typed.session_id !== undefined && typeof typed.session_id !== 'string') {
    return { valid: false, error: `Metric at index ${index} field session_id must be a string` };
  }
  
  if (typed.page_url !== undefined && typeof typed.page_url !== 'string') {
    return { valid: false, error: `Metric at index ${index} field page_url must be a string` };
  }
  
  if (typed.environment !== undefined && typeof typed.environment !== 'string') {
    return { valid: false, error: `Metric at index ${index} field environment must be a string` };
  }
  
  if (typed.rating !== undefined && 
      typed.rating !== 'good' && 
      typed.rating !== 'needs-improvement' && 
      typed.rating !== 'poor') {
    return { 
      valid: false, 
      error: `Metric at index ${index} field rating must be one of: good, needs-improvement, poor` 
    };
  }
  
  // Validate timestamp
  if (typed.timestamp !== undefined) {
    if (typeof typed.timestamp !== 'string' && typeof typed.timestamp !== 'number') {
      return { valid: false, error: `Metric at index ${index} field timestamp must be a string or number` };
    }
    
    if (typeof typed.timestamp === 'string') {
      const date = new Date(typed.timestamp);
      if (isNaN(date.getTime())) {
        return { valid: false, error: `Metric at index ${index} field timestamp is not a valid date string` };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Validates a web vital object
 */
export function validateWebVital(vital: unknown, index: number): { valid: boolean; error?: string } {
  if (!vital || typeof vital !== 'object' || Array.isArray(vital)) {
    return { valid: false, error: `Web vital at index ${index} must be an object` };
  }
  
  const typed = vital as Partial<WebVitalMetric>;
  
  // Required fields
  if (!typed.name || typeof typed.name !== 'string') {
    return { valid: false, error: `Web vital at index ${index} missing required string field: name` };
  }
  
  if (typed.value === undefined || typeof typed.value !== 'number' || isNaN(typed.value)) {
    return { valid: false, error: `Web vital at index ${index} missing required number field: value` };
  }
  
  if (!typed.category || typeof typed.category !== 'string' || !isValidWebVitalCategory(typed.category)) {
    return { 
      valid: false, 
      error: `Web vital at index ${index} has invalid category. Must be one of: loading, interaction, visual_stability, responsiveness` 
    };
  }
  
  if (typed.timestamp === undefined || typeof typed.timestamp !== 'number' || isNaN(typed.timestamp)) {
    return { valid: false, error: `Web vital at index ${index} missing required number field: timestamp` };
  }
  
  // Optional fields
  if (typed.rating !== undefined && 
      typed.rating !== 'good' && 
      typed.rating !== 'needs-improvement' && 
      typed.rating !== 'poor') {
    return { 
      valid: false, 
      error: `Web vital at index ${index} field rating must be one of: good, needs-improvement, poor` 
    };
  }
  
  // If name is set, validate it's a known web vital
  if (typed.name && !isValidWebVitalName(typed.name)) {
    return { 
      valid: false, 
      error: `Web vital at index ${index} has unknown name. Known vitals are: CLS, FCP, LCP, TTFB, FID, INP` 
    };
  }
  
  return { valid: true };
}

/**
 * Validates device information object
 */
export function validateDeviceInfo(deviceInfo: unknown): { valid: boolean; error?: string } {
  if (!deviceInfo || typeof deviceInfo !== 'object' || Array.isArray(deviceInfo)) {
    return { valid: false, error: 'deviceInfo must be an object' };
  }
  
  const typed = deviceInfo as Partial<DeviceInfo>;
  
  // Optional fields type validation
  if (typed.userAgent !== undefined && typeof typed.userAgent !== 'string') {
    return { valid: false, error: 'deviceInfo.userAgent must be a string' };
  }
  
  if (typed.deviceCategory !== undefined && typeof typed.deviceCategory !== 'string') {
    return { valid: false, error: 'deviceInfo.deviceCategory must be a string' };
  }
  
  if (typed.screenWidth !== undefined && (typeof typed.screenWidth !== 'number' || isNaN(typed.screenWidth))) {
    return { valid: false, error: 'deviceInfo.screenWidth must be a number' };
  }
  
  if (typed.screenHeight !== undefined && (typeof typed.screenHeight !== 'number' || isNaN(typed.screenHeight))) {
    return { valid: false, error: 'deviceInfo.screenHeight must be a number' };
  }
  
  if (typed.devicePixelRatio !== undefined && (typeof typed.devicePixelRatio !== 'number' || isNaN(typed.devicePixelRatio))) {
    return { valid: false, error: 'deviceInfo.devicePixelRatio must be a number' };
  }
  
  // Connection validation
  if (typed.connection !== undefined) {
    if (typeof typed.connection !== 'object' || Array.isArray(typed.connection)) {
      return { valid: false, error: 'deviceInfo.connection must be an object' };
    }
    
    if (typed.connection.effectiveType !== undefined && typeof typed.connection.effectiveType !== 'string') {
      return { valid: false, error: 'deviceInfo.connection.effectiveType must be a string' };
    }
    
    if (typed.connection.downlink !== undefined && (typeof typed.connection.downlink !== 'number' || isNaN(typed.connection.downlink))) {
      return { valid: false, error: 'deviceInfo.connection.downlink must be a number' };
    }
    
    if (typed.connection.rtt !== undefined && (typeof typed.connection.rtt !== 'number' || isNaN(typed.connection.rtt))) {
      return { valid: false, error: 'deviceInfo.connection.rtt must be a number' };
    }
    
    if (typed.connection.saveData !== undefined && typeof typed.connection.saveData !== 'boolean') {
      return { valid: false, error: 'deviceInfo.connection.saveData must be a boolean' };
    }
  }
  
  // Memory validation
  if (typed.memory !== undefined) {
    if (typeof typed.memory !== 'object' || Array.isArray(typed.memory)) {
      return { valid: false, error: 'deviceInfo.memory must be an object' };
    }
    
    if (typed.memory.jsHeapSizeLimit !== undefined && (typeof typed.memory.jsHeapSizeLimit !== 'number' || isNaN(typed.memory.jsHeapSizeLimit))) {
      return { valid: false, error: 'deviceInfo.memory.jsHeapSizeLimit must be a number' };
    }
    
    if (typed.memory.totalJSHeapSize !== undefined && (typeof typed.memory.totalJSHeapSize !== 'number' || isNaN(typed.memory.totalJSHeapSize))) {
      return { valid: false, error: 'deviceInfo.memory.totalJSHeapSize must be a number' };
    }
    
    if (typed.memory.usedJSHeapSize !== undefined && (typeof typed.memory.usedJSHeapSize !== 'number' || isNaN(typed.memory.usedJSHeapSize))) {
      return { valid: false, error: 'deviceInfo.memory.usedJSHeapSize must be a number' };
    }
  }
  
  return { valid: true };
}

/**
 * Validates the entire performance tracking payload
 */
export function validatePerformancePayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { 
      valid: false, 
      errors: [{ field: '', message: 'Payload must be an object' }],
      message: 'Invalid payload format'
    };
  }
  
  const typed = payload as Partial<TrackPerformancePayload>;
  const errors: { field: string; message: string }[] = [];
  
  // Required fields validation
  if (!typed.metrics || !Array.isArray(typed.metrics)) {
    errors.push({ field: 'metrics', message: 'metrics must be an array' });
  }
  
  if (!typed.timestamp || typeof typed.timestamp !== 'string') {
    errors.push({ field: 'timestamp', message: 'timestamp is required and must be a string' });
  } else {
    const date = new Date(typed.timestamp);
    if (isNaN(date.getTime())) {
      errors.push({ field: 'timestamp', message: 'timestamp must be a valid date string' });
    }
  }
  
  if (!typed.source || (typed.source !== 'web' && typed.source !== 'mobile' && typed.source !== 'desktop')) {
    errors.push({ field: 'source', message: 'source must be one of: web, mobile, desktop' });
  }
  
  // Optional fields validation
  if (typed.sessionId !== undefined && typeof typed.sessionId !== 'string') {
    errors.push({ field: 'sessionId', message: 'sessionId must be a string' });
  }
  
  if (typed.userId !== undefined && typeof typed.userId !== 'string') {
    errors.push({ field: 'userId', message: 'userId must be a string' });
  }
  
  // Metrics validation
  if (typed.metrics && Array.isArray(typed.metrics)) {
    typed.metrics.forEach((metric, index) => {
      const validation = validatePerformanceMetric(metric, index);
      if (!validation.valid && validation.error) {
        errors.push({ field: `metrics[${index}]`, message: validation.error });
      }
    });
  }
  
  // Web vitals validation
  if (typed.webVitals !== undefined) {
    if (!Array.isArray(typed.webVitals)) {
      errors.push({ field: 'webVitals', message: 'webVitals must be an array' });
    } else {
      typed.webVitals.forEach((vital, index) => {
        const validation = validateWebVital(vital, index);
        if (!validation.valid && validation.error) {
          errors.push({ field: `webVitals[${index}]`, message: validation.error });
        }
      });
    }
  }
  
  // Device info validation
  if (typed.deviceInfo !== undefined) {
    const deviceValidation = validateDeviceInfo(typed.deviceInfo);
    if (!deviceValidation.valid && deviceValidation.error) {
      errors.push({ field: 'deviceInfo', message: deviceValidation.error });
    }
  }
  
  return { 
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    message: errors.length > 0 ? 'Performance payload validation failed' : undefined
  };
}
