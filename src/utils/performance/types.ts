
/**
 * Performance Monitoring System Types
 * 
 * Comprehensive type definitions for the performance monitoring infrastructure.
 */

// Types of metrics to track
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network' | 'resource' | 'javascript' | 'css' | 'animation' | 'metric' | 'summary' | 'performance' | 'webVital';

// Web vital metrics
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

// Component metrics structure
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  firstRenderTime?: number;
  memoryUsage?: number;
  renderSizes?: number[];
  domSize?: {
    width: number;
    height: number;
    elements?: number;
  };
  // Additional properties
  slowRenderCount?: number;
  renderTimes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  lastUpdated?: number;
  metricType?: string;
}

// Web vital metric structure
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  attribution?: {
    element?: string;
    largestShiftTarget?: string;
    largestShiftTime?: number;
    loadState?: string;
    navigationEntry?: string;
    eventEntry?: string;
  };
}

// General performance metric
export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  timestamp: string | number;
  category: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// Device information for metrics reporting
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  viewport?: {
    width: number;
    height: number;
  };
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

// Performance report payload
export interface PerformanceReportPayload {
  timestamp: string;
  session?: string;
  metrics: PerformanceMetric[];
  device?: DeviceInfo;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  debugMode: boolean;
  reportingEndpoint?: string;
  
  // Advanced configuration
  optimizationLevel: 'auto' | 'low' | 'medium' | 'high';
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Advanced features
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
}
