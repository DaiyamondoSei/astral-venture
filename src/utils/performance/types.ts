
/**
 * Core Performance Types
 * 
 * This module provides centralized type definitions for the performance monitoring system.
 */

// Device capability classification
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance mode settings
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// Render frequency classification
export type RenderFrequency = 'low' | 'medium' | 'high';

// Quality level settings
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Types of metrics to track
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network' | 'resource' | 'javascript' | 'css' | 'animation' | 'metric' | 'summary' | 'performance' | 'webVital';

// Web vital metrics
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

// Web vital metric structure
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// Performance metric structure
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

// Performance settings based on device capability
export interface PerformanceSettings {
  targetFPS: number;
  qualityLevel: QualityLevel;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  particleCount: number;
  maxAnimationsPerFrame: number;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  debugMode?: boolean;
  reportingEndpoint?: string;
  
  // Advanced configuration
  optimizationLevel?: 'auto' | 'low' | 'medium' | 'high';
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  
  // Advanced features
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
}

// Adaptive rendering settings
export interface AdaptiveSettings {
  qualityLevel: QualityLevel;
  targetFPS: number;
  particleCount: number;
  maxAnimationsPerFrame: number;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
}

// Performance boundaries for different capability levels
export interface PerformanceBoundaries {
  lowFPS: number;
  mediumFPS: number;
  highFPS: number;
  criticalMemory: number;
  highMemory: number;
  mediumMemory: number;
}

// Performance metric validation interface
export interface MetricValidation {
  validateMetric: (metric: PerformanceMetric) => boolean;
  validateWebVital: (vital: WebVitalMetric) => boolean;
  isValidMetricType: (type: string) => type is MetricType;
  isValidWebVitalName: (name: string) => name is WebVitalName;
  isValidWebVitalCategory: (category: string) => category is WebVitalCategory;
}
