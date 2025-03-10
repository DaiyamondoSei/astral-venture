
/**
 * Performance Monitoring Module
 * 
 * This module provides a centralized export point for all performance monitoring 
 * utilities to prevent case sensitivity issues and ensure consistent imports.
 */

// Re-export the performanceMonitor singleton instance
export { default as performanceMonitor } from './performanceMonitor';

// Re-export component metrics types
export type { 
  ComponentMetrics,
  ComponentMetric,
  PerformanceMetric,
  PerformanceTrackingOptions
} from './types';

// Re-export other performance utilities
export { default as RenderAnalyzer } from './RenderAnalyzer';
export { withPerformanceTracking } from './withPerformanceTracking';
