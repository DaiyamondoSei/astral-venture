
/**
 * Performance Monitoring Type Definitions
 */

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 'render' | 'interaction' | 'load';

/**
 * Component performance metrics
 */
export interface ComponentMetrics {
  /** Name of the component being measured */
  componentName: string;
  
  /** Total render time across all renders */
  totalRenderTime: number;
  
  /** Number of times the component has rendered */
  renderCount: number;
  
  /** Average render time */
  averageRenderTime: number;
  
  /** Most recent render time */
  lastRenderTime: number;
  
  /** Number of slow renders (over threshold) */
  slowRenderCount: number;
  
  /** Maximum render time */
  maxRenderTime: number;
  
  /** Minimum render time */
  minRenderTime: number;
  
  /** Recent render times for trend analysis */
  renderTimes: number[];
  
  /** When the metrics started being collected */
  createdAt: number;
  
  /** When metrics were last updated */
  lastUpdated: number;
  
  /** Type of metric being tracked */
  metricType: MetricType;
}

/**
 * Core Web Vitals metric
 */
export interface WebVitalMetric {
  /** Name of the metric (FCP, LCP, CLS, etc.) */
  name: string;
  
  /** Value of the metric */
  value: number;
  
  /** When the metric was recorded */
  timestamp: number;
  
  /** Category of the metric */
  category: 'interaction' | 'loading' | 'visual_stability';
}

/**
 * General performance metric
 */
export interface PerformanceMetric {
  /** A unique identifier for the metric */
  id?: string;
  
  /** Name of the component or feature being measured */
  component_name: string;
  
  /** Average render time in milliseconds */
  average_render_time: number;
  
  /** Total number of renders captured */
  total_renders: number;
  
  /** Number of slow renders (exceeding threshold) */
  slow_renders: number;
  
  /** When the metric was created */
  created_at: string;
  
  /** When the metric was last updated */
  updated_at?: string;
  
  /** User id if applicable */
  user_id?: string;
  
  /** Type of the metric */
  metric_type: string;
  
  /** JSON data with additional metrics */
  metric_data?: Record<string, any>;
  
  /** Device info */
  device_info?: {
    userAgent: string;
    deviceCategory: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  };
}

/**
 * Device information for performance context
 */
export interface DeviceInfo {
  /** User agent string from browser */
  userAgent: string;
  
  /** Device category based on user agent */
  deviceCategory: 'mobile' | 'tablet' | 'desktop' | 'unknown';
}

/**
 * Performance report payload
 */
export interface PerformanceReportPayload {
  /** Component metrics */
  componentMetrics: ComponentMetrics[];
  
  /** Web Vitals metrics */
  webVitals: WebVitalMetric[];
  
  /** Information about the device */
  deviceInfo: DeviceInfo;
  
  /** When the report was generated */
  timestamp: string;
  
  /** User id if available */
  userId?: string;
  
  /** Session id if available */
  sessionId?: string;
}
