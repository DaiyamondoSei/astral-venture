
// Import shared types from main application
// These are duplicated here because Edge Functions can't import from src/ directory

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network' | 'resource' | 'javascript' | 'css' | 'animation' | 'metric' | 'summary' | 'performance' | 'webVital';

/**
 * Web vital metrics
 */
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

/**
 * Web vital metric structure
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Performance metric record for database storage
 */
export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  category: string;
  timestamp: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  device_info?: Record<string, any>;
  metadata?: Record<string, any>;
  environment?: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
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
  deviceInfo?: {
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
  };
}

/**
 * Response from performance tracking edge function
 */
export interface TrackPerformanceResponse {
  success: boolean;
  metricsProcessed: number;
  timestamp: string;
  errors?: Array<{metricIndex: number, message: string}>;
  recommendations?: string[];
}
