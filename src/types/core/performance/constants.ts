
/**
 * Performance system type definitions
 * Following the Type-Value Pattern
 */
import { 
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  QualityLevel,
  MetricType,
  WebVitalCategory
} from './types';

// Device capability values
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Performance mode values
export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
} as const;

// Render frequency values
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
} as const;

// Quality level values
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
} as const;

// Metric types
export const MetricTypes = {
  RENDER: 'render' as MetricType,
  INTERACTION: 'interaction' as MetricType,
  LOAD: 'load' as MetricType,
  MEMORY: 'memory' as MetricType,
  NETWORK: 'network' as MetricType,
  RESOURCE: 'resource' as MetricType,
  JAVASCRIPT: 'javascript' as MetricType,
  CSS: 'css' as MetricType,
  ANIMATION: 'animation' as MetricType,
  METRIC: 'metric' as MetricType,
  SUMMARY: 'summary' as MetricType,
  PERFORMANCE: 'performance' as MetricType,
  WEB_VITAL: 'web_vital' as MetricType
} as const;

// Web vital categories
export const WebVitalCategories = {
  LOADING: 'loading' as WebVitalCategory,
  INTERACTION: 'interaction' as WebVitalCategory,
  VISUAL_STABILITY: 'visual_stability' as WebVitalCategory
} as const;

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

export const ResourceOptimizationLevels = {
  NONE: 'none' as ResourceOptimizationLevel,
  CONSERVATIVE: 'conservative' as ResourceOptimizationLevel,
  AGGRESSIVE: 'aggressive' as ResourceOptimizationLevel
} as const;

// Performance configuration interface
export interface PerfConfig {
  // Core settings
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Sampling settings
  samplingRate: number;
  throttleInterval: number;
  
  // Monitoring configuration
  slowRenderThreshold: number;
  maxTrackedComponents: number;
  
  // Feature toggles
  enableValidation: boolean;
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Optimizations
  batchUpdates: boolean;
  inactiveTabThrottling: boolean;
  intelligentProfiling: boolean;
  resourceOptimizationLevel: ResourceOptimizationLevel;
  
  // Advanced settings
  customThrottleInterval?: number;
  metricsPersistence: boolean;
}
