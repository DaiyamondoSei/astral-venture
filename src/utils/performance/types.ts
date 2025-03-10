
/**
 * Performance Monitoring Type Definitions
 * 
 * Centralized type definitions for the performance monitoring system.
 */

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network';

/**
 * Categories for web vitals
 */
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

/**
 * Component metric data
 */
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
  lastRenderTime: number;
  timestamps?: number[];
}

/**
 * Web vital metric data
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  timestamp: number;
  category: WebVitalCategory;
}

/**
 * Device information for metrics context
 */
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  connection?: {
    type?: string;
    downlink?: number;
    rtt?: number;
  };
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
  type: string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  device_info?: Record<string, any>;
}

/**
 * Performance summary
 */
export interface PerformanceSummary {
  webVitals: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
    ttfb: number;
    inp?: number;
  };
  components: {
    totalComponents: number;
    avgRenderTime: number;
    slowComponents: number;
  };
  resources: {
    totalSize: number;
    loadTime: number;
    count: number;
  };
  device: DeviceInfo;
}

/**
 * Configuration for the performance monitoring system
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  slowRenderThreshold: number;
  reportInterval: number;
  maxMetricsPerReport: number;
  trackResourceMetrics: boolean;
  trackMemoryUsage: boolean;
  trackNetworkRequests: boolean;
  includeDeviceInfo: boolean;
  includeLocationInfo: boolean;
  batchReports: boolean;
  debugMode: boolean;
}
