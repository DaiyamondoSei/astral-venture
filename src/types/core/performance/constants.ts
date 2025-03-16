
/**
 * Performance-related constants following the Type-Value Pattern
 */
import { 
  MetricType, 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency, 
  QualityLevel 
} from './types';

// Runtime values for MetricType
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
};

// Runtime values for DeviceCapability
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Runtime values for PerformanceMode
export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
};

// Runtime values for RenderFrequency
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
};

// Runtime values for QualityLevel
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

// Default quality levels for different device capabilities
export const DEFAULT_QUALITY_LEVELS = {
  [DeviceCapabilities.LOW]: QualityLevels.LOW,
  [DeviceCapabilities.MEDIUM]: QualityLevels.MEDIUM,
  [DeviceCapabilities.HIGH]: QualityLevels.HIGH
};
