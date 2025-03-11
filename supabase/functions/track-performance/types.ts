
// Import shared types from main application
// These are duplicated here because Edge Functions can't import from src/ directory

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 
  | 'render' 
  | 'interaction' 
  | 'load' 
  | 'memory' 
  | 'network' 
  | 'resource' 
  | 'javascript' 
  | 'css' 
  | 'animation' 
  | 'metric' 
  | 'summary' 
  | 'performance' 
  | 'webVital';

/**
 * Web vital metrics
 */
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

/**
 * Web vital rating types
 */
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Device information structure
 */
export interface DeviceInfo {
  userAgent?: string;
  deviceCategory?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  memory?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
}

/**
 * Web vital metric structure
 */
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: WebVitalRating;
  delta?: number;
  id?: string;
}

/**
 * Performance metric record for database storage
 */
export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  category: string;
  timestamp: string | number;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  device_info?: DeviceInfo | Record<string, any>;
  metadata?: Record<string, any>;
  environment?: string;
  rating?: WebVitalRating;
  id?: string;
}

/**
 * Request payload for performance tracking edge function
 */
export interface TrackPerformancePayload {
  metrics: PerformanceMetric[];
  webVitals?: WebVitalMetric[];
  sessionId?: string;
  userId?: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'desktop';
  deviceInfo?: DeviceInfo;
}

/**
 * Performance data error structure
 */
export interface PerformanceDataError {
  metricIndex: number;
  message: string;
  field?: string;
  code?: string;
}

/**
 * Response from performance tracking edge function
 */
export interface TrackPerformanceResponse {
  success: boolean;
  metricsProcessed: number;
  timestamp: string;
  errors?: PerformanceDataError[];
  recommendations?: string[];
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors?: { field: string; message: string }[];
  message?: string;
}

/**
 * Error codes for performance tracking
 */
export enum ErrorCode {
  INVALID_METRIC = 'INVALID_METRIC',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Type guards for runtime type safety
 */
export function isValidMetricType(type: string): type is MetricType {
  return [
    'render', 'interaction', 'load', 'memory', 'network', 
    'resource', 'javascript', 'css', 'animation', 
    'metric', 'summary', 'performance', 'webVital'
  ].includes(type as MetricType);
}

export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['CLS', 'FCP', 'LCP', 'TTFB', 'FID', 'INP'].includes(name as WebVitalName);
}

export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return [
    'loading', 'interaction', 'visual_stability', 'responsiveness'
  ].includes(category as WebVitalCategory);
}

export function isValidRating(rating: string): rating is WebVitalRating {
  return ['good', 'needs-improvement', 'poor'].includes(rating as WebVitalRating);
}

export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const metric = obj as Partial<PerformanceMetric>;
  return (
    typeof metric.metric_name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.category === 'string' &&
    typeof metric.type === 'string' &&
    (typeof metric.timestamp === 'string' || typeof metric.timestamp === 'number')
  );
}

export function isWebVitalMetric(obj: unknown): obj is WebVitalMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const vital = obj as Partial<WebVitalMetric>;
  return (
    typeof vital.name === 'string' &&
    typeof vital.value === 'number' &&
    typeof vital.category === 'string' &&
    typeof vital.timestamp === 'number'
  );
}
