
/**
 * Performance metrics types
 * 
 * This module contains type definitions related to performance measurement
 * following the Type-Value Pattern.
 */

// Import core types from the constants file
import { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency, 
  QualityLevel
} from '@/types/core/performance/constants';

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
  renderTimes?: number[];  // Added to fix references in performance code
  minRenderTime?: number;  // Added to fix references in performance code
  maxRenderTime?: number;  // Added to fix references in performance code
  slowRenderCount?: number; // Added to fix references in performance code
  lastUpdated?: number;    // Added to fix references in performance code
  metricType?: string;     // Added to fix references in performance code
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
  adaptiveQuality?: boolean; // Added to fix missing property
  performanceMetrics?: Record<string, number>; // Added to fix missing property
  simplifiedForLowEnd?: boolean; // Added to fix missing property
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
