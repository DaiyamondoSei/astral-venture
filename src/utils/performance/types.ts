
/**
 * Core Performance Types
 * 
 * This module provides centralized type definitions for the performance monitoring system.
 */

// Basic Classification Types
// Device capability classification
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance mode settings
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// Render frequency classification
export type RenderFrequency = 'low' | 'medium' | 'high';

// Quality level settings
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Metric Types
// Types of metrics to track
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

// Web vital metrics
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

// Web vital rating types
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

// Core Metric Interfaces
// Web vital metric structure
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: WebVitalRating;
  delta?: number;
  id?: string;
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
  rating?: WebVitalRating;
  id?: string;
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
  id?: string;
}

// Configuration Interfaces
// Performance settings based on device capability
export interface PerformanceSettings {
  targetFPS: number;
  qualityLevel: QualityLevel;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  particleCount: number;
  maxAnimationsPerFrame: number;
  optimizationEnabled?: boolean;
  id?: string;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  debugMode?: boolean;
  reportingEndpoint?: string;
  logSlowRenders?: boolean;
  
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
  id?: string;
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
  id?: string;
}

// Performance boundaries for different capability levels
export interface PerformanceBoundaries {
  lowFPS: number;
  mediumFPS: number;
  highFPS: number;
  criticalMemory: number;
  highMemory: number;
  mediumMemory: number;
  id?: string;
}

// Performance tracking options for hooks and components
export interface PerformanceTrackingOptions {
  enabled?: boolean;
  componentName?: string;
  trackProps?: boolean;
  trackRenders?: boolean;
  trackEffects?: boolean;
  trackMounts?: boolean;
  debugMode?: boolean;
  samplingRate?: number;
  slowRenderThreshold?: number;
  logSlowRenders?: boolean;
  reportMetrics?: boolean;
  id?: string;
}

// Performance metric validation interface
export interface MetricValidation {
  validateMetric: (metric: PerformanceMetric) => boolean;
  validateWebVital: (vital: WebVitalMetric) => boolean;
  isValidMetricType: (type: string) => type is MetricType;
  isValidWebVitalName: (name: string) => name is WebVitalName;
  isValidWebVitalCategory: (category: string) => type is WebVitalCategory;
}

// Type guards for runtime validation
/**
 * Check if a string is a valid MetricType
 */
export function isValidMetricType(type: string): type is MetricType {
  return [
    'render', 'interaction', 'load', 'memory', 'network', 
    'resource', 'javascript', 'css', 'animation', 
    'metric', 'summary', 'performance', 'webVital'
  ].includes(type as MetricType);
}

/**
 * Check if a string is a valid WebVitalName
 */
export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['CLS', 'FCP', 'LCP', 'TTFB', 'FID', 'INP'].includes(name as WebVitalName);
}

/**
 * Check if a string is a valid WebVitalCategory
 */
export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return [
    'loading', 'interaction', 'visual_stability', 'responsiveness'
  ].includes(category as WebVitalCategory);
}

/**
 * Check if an object is a valid PerformanceMetric
 */
export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  return typeof obj === 'object' && 
    obj !== null && 
    'metric_name' in obj && 
    'value' in obj && 
    'category' in obj && 
    'type' in obj && 
    'timestamp' in obj;
}

/**
 * Check if an object is a valid WebVitalMetric
 */
export function isWebVitalMetric(obj: unknown): obj is WebVitalMetric {
  return typeof obj === 'object' && 
    obj !== null && 
    'name' in obj && 
    'value' in obj && 
    'category' in obj && 
    'timestamp' in obj;
}

/**
 * Check if an object is a valid ComponentMetrics
 */
export function isComponentMetrics(obj: unknown): obj is ComponentMetrics {
  return typeof obj === 'object' && 
    obj !== null && 
    'componentName' in obj && 
    'renderCount' in obj && 
    'totalRenderTime' in obj && 
    'averageRenderTime' in obj && 
    'lastRenderTime' in obj;
}

// Export all the types and utilities
export default {
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory,
  isPerformanceMetric,
  isWebVitalMetric,
  isComponentMetrics
};
