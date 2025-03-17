
/**
 * Performance Types
 * 
 * This module re-exports all performance-related types used throughout the application.
 * It serves as a central point for importing performance types.
 */

// Import and re-export types from other modules
import { 
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  ComponentMetrics,
  PerformanceMetric,
  WebVitalMetric,
  DeviceInfo,
  PerformanceSettings,
  WebVitalCategory,
  WebVitalRating,
  PerformanceMonitorConfig,
  AdaptiveSettings
} from '@/utils/performance/types';

// Re-export types
export type {
  DeviceCapability,
  PerformanceMode,
  RenderFrequency,
  ComponentMetrics,
  PerformanceMetric,
  WebVitalMetric,
  DeviceInfo,
  PerformanceSettings,
  WebVitalCategory,
  WebVitalRating,
  PerformanceMonitorConfig,
  AdaptiveSettings
};

