
import { ComponentMetrics, PerformanceMetric, MetricType } from '@/utils/performance/core/metrics';

// Re-export the types from core/metrics to make them available in a consistent location
export type { ComponentMetrics, PerformanceMetric, MetricType };

// Define additional types needed for performance monitoring
export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'quality' | 'balanced' | 'performance' | 'auto';
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Performance configuration interface
export interface PerformanceConfig {
  // Core settings
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Collector settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  slowRenderThreshold?: number;
  
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
  
  // Additional optional settings
  enableAdaptiveRendering?: boolean;
  trackComponentSize?: boolean;
  enableMemoryMonitoring?: boolean;
  enableDetailedLogging?: boolean;
  metricsEnabled?: boolean;
  resourceOptimizationLevel?: 'none' | 'conservative' | 'aggressive';
  metricsPersistence?: boolean;
}

// Performance monitoring options
export interface PerformanceMonitorOptions {
  enabled?: boolean;
  samplingRate?: number;
  debugMode?: boolean;
  maxTrackedComponents?: number;
  componentName?: string;
}

// Performance data snapshot
export interface PerformanceData {
  fps: number;
  memory: number;
  isThrottled: boolean;
  lastUpdated: number;
  componentMetrics?: Record<string, ComponentMetrics>;
}
