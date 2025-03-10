
/**
 * Performance Monitoring Type Definitions
 * 
 * Centralized type definitions for the performance monitoring system.
 */

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network' | 'resource' | 'javascript' | 'css' | 'animation';

/**
 * Categories for web vitals
 */
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

/**
 * Web vital names with their proper types
 */
export type WebVitalName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';

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
  renderDurations?: number[];
  renderSizes?: number[];
  memoryUsage?: number;
}

/**
 * Web vital metric data
 */
export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  timestamp: number;
  category: WebVitalCategory;
  navigationType?: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
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
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    saveData?: boolean;
  };
  memory?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
  hardwareConcurrency?: number;
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
  bundle_version?: string;
  environment?: string;
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
    topSlowestComponents?: Array<{name: string, time: number}>;
  };
  resources: {
    totalSize: number;
    loadTime: number;
    count: number;
    byType?: Record<string, {size: number, count: number}>;
  };
  device: DeviceInfo;
  timestamp: string;
  sessionId?: string;
}

/**
 * Resource timing metric
 */
export interface ResourceTimingMetric {
  name: string;
  initiatorType: string;
  startTime: number;
  duration: number;
  transferSize?: number;
  decodedBodySize?: number;
  encodedBodySize?: number;
}

/**
 * Interaction timing metric
 */
export interface InteractionTimingMetric {
  eventType: string;
  targetComponent?: string;
  startTime: number;
  duration: number;
  interactionId?: string;
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
  environmentName?: string;
  metricBlacklist?: string[];
  maxStorageDays?: number;
  anonymizeUserData?: boolean;
  highPriorityMetrics?: WebVitalName[];
}

/**
 * Request payload for performance tracking edge function
 */
export interface TrackPerformancePayload {
  metrics: PerformanceMetric[];
  sessionId?: string;
  userId?: string;
  batchId?: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'desktop';
  appVersion?: string;
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
