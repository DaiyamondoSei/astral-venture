
/**
 * Core Performance Types
 * 
 * This module provides the foundational types for the performance system.
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high' | 'core';

// Performance optimization modes
export type PerformanceMode = 'balanced' | 'performance' | 'quality';

// Visual quality levels
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Render frequency levels
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive';

// Render setting levels
export type RenderSetting = 'auto' | 'low' | 'medium' | 'high';

// Animation complexity levels
export type AnimationComplexity = 'none' | 'minimal' | 'standard' | 'enhanced';

// Rendering engine types
export type RenderingEngine = 'canvas' | 'webgl' | 'svg' | 'css' | 'html';

// Glassmorphic variant types
export type GlassmorphicVariant = 'default' | 'subtle' | 'medium' | 'elevated' | 'ethereal' | 'cosmic' | 'purple' | 'quantum';

// Glow intensity levels
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

// Cube theme types
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'chakra' | 'energy' | 'spiritual' | 'quantum';

// Cube size options
export type CubeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Performance configuration interface
export interface PerfConfig {
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  resourceOptimizationLevel: ResourceOptimizationLevel;
  metricsPersistence: boolean;
  
  // Feature flags
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  
  // Optimization strategies
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
  slowRenderThreshold?: number;
}

// Component metrics interface
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  reRenderCount: number;
  firstRenderTime?: number;
  slowRenderCount?: number;
  memoryUsage?: number;
  renderSizes?: number[];
  domSize?: {
    width: number;
    height: number;
    elements?: number;
  };
}

// Performance metric data structure
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: number;
  category: string;
  type: MetricType;
  metadata?: Record<string, unknown>;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// Metric types
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
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: WebVitalRating;
}

// Web vitals categories
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Web vitals rating
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

// Web vitals names
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';

// Performance boundaries
export interface PerformanceBoundaries {
  lowFpsThreshold: number;
  mediumFpsThreshold: number;
  highFpsThreshold: number;
  excessiveRenderTimeMs: number;
  highMemoryUsageMb: number;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  samplingInterval: number;
  metricsBufferSize: number;
  autoStart: boolean;
  trackComponents: boolean;
  trackInteractions: boolean;
  trackWebVitals: boolean;
  logWarnings: boolean;
  captureElementMetrics: boolean;
  adaptiveMode: boolean;
  throttleUpdates: boolean;
  optimizationLevel?: string;
}
