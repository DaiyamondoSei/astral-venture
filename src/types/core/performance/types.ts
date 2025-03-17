
/**
 * Core Performance Types
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high' | 'core';

// Performance optimization modes
export type PerformanceMode = 'balanced' | 'performance' | 'quality';

// Visual quality levels
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

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
}

// Performance metric interface
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: number;
  category: string;
  type: string;
  metadata?: Record<string, unknown>;
}

// WebVital metric interface
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

// WebVital specific types
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
