
/**
 * Performance metrics types
 * 
 * This module contains type definitions related to performance measurement
 * following the Type-Value Pattern.
 */

/**
 * Types of performance metrics that can be measured
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
 * Performance metric rating levels
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Device category types
 */
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * Device capability levels (re-exported from constants)
 */
export type DeviceCapability = 'low' | 'medium' | 'high';

/**
 * Performance mode types (re-exported from constants)
 */
export type PerformanceMode = 'battery' | 'balanced' | 'performance' | 'auto' | 'quality';

/**
 * Render frequency types (re-exported from constants)
 */
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

/**
 * Quality level types (re-exported from constants)
 */
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: string | number;
  category: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: MetricRating;
  component_name?: string; // Added to fix errors
}

/**
 * Component rendering performance metrics
 */
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  firstRenderTime?: number;
  memoryUsage?: number;
  renderSizes?: number[];
  renderTimes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  slowRenderCount?: number;
  lastUpdated?: number;
  metricType?: string;
  reRenderCount?: number; // Added to fix missing property
  domSize?: {
    width: number;
    height: number;
    elements?: number;
  };
}

/**
 * Device information for performance context
 */
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: DeviceCategory;
  screenSize: {
    width: number;
    height: number;
  };
  connection?: {
    type?: string;
    speed?: number;
  };
}

/**
 * Performance settings configuration
 */
export interface PerformanceSettings {
  deviceCapability: DeviceCapability;
  performanceMode: PerformanceMode;
  renderFrequency: RenderFrequency;
  qualityLevel: QualityLevel;
  enableMonitoring: boolean;
  adaptiveRendering: boolean;
  batchUpdates: boolean;
  useLowFidelityEffects: boolean;
  adaptiveQuality?: boolean;
  performanceMetrics?: Record<string, number>;
  simplifiedForLowEnd?: boolean;
}

/**
 * Web vital metric data structure
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: WebVitalRating;
  path?: string;
  metadata?: Record<string, any>;
}

/**
 * Web vital category types
 */
export type WebVitalCategory = 'interaction' | 'loading' | 'visual_stability';

/**
 * Web vital rating levels
 */
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Web vital name types
 */
export type WebVitalName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  samplingRate: number;
  debugMode: boolean;
  throttleInterval?: number;
  saveToLocalStorage?: boolean;
  metricsEnabled?: boolean;
  enablePerformanceTracking?: boolean;
  slowRenderThreshold?: number;
  reportingEndpoint?: string;
}

/**
 * Adaptive settings configuration
 */
export interface AdaptiveSettings {
  adaptiveQuality: boolean;
  adaptiveEffects: boolean;
  adaptiveRendering: boolean;
  adaptiveAnimations: boolean;
  qualityControl: 'auto' | 'manual';
  virtualization?: boolean; // Added to fix missing property
}

/**
 * Performance report payload
 */
export interface PerformanceReportPayload {
  metrics: PerformanceMetric[];
  webVitals: WebVitalMetric[];
  device: DeviceInfo;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}
