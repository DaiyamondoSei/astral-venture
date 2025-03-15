
/**
 * Performance constants
 * 
 * This module provides runtime values for performance-related types
 * following the Type-Value Pattern.
 */

import { 
  MetricType, 
  MetricRating, 
  DeviceCategory,
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  QualityLevel
} from './types';

/**
 * Runtime values for metric types
 */
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
  WEB_VITAL: 'webVital' as MetricType
};

/**
 * Runtime values for metric ratings
 */
export const MetricRatings = {
  GOOD: 'good' as MetricRating,
  NEEDS_IMPROVEMENT: 'needs-improvement' as MetricRating,
  POOR: 'poor' as MetricRating
};

/**
 * Runtime values for device categories
 */
export const DeviceCategories = {
  MOBILE: 'mobile' as DeviceCategory,
  TABLET: 'tablet' as DeviceCategory,
  DESKTOP: 'desktop' as DeviceCategory
};

/**
 * Runtime values for device capabilities
 */
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

/**
 * Runtime values for performance modes
 */
export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
};

/**
 * Runtime values for render frequencies
 */
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
};

/**
 * Runtime values for quality levels
 */
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

/**
 * Thresholds for render time performance categorization
 */
export const RenderTimeThresholds = {
  GOOD: 16, // Under 16ms (60fps)
  WARNING: 33, // Under 33ms (30fps)
  // Anything above WARNING is considered poor
};

/**
 * Batch update thresholds for adaptive performance
 */
export const BatchUpdateThresholds = {
  LOW_END: 500, // 500ms for low-end devices
  MID_RANGE: 250, // 250ms for mid-range devices
  HIGH_END: 100 // 100ms for high-end devices
};

/**
 * Memory usage thresholds in MB
 */
export const MemoryThresholds = {
  WARNING: 150, // 150MB
  CRITICAL: 300 // 300MB
};
