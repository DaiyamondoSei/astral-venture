
/**
 * Performance Monitoring System - Central Export
 * 
 * This file provides a unified entry point for all performance monitoring utilities,
 * resolving case-sensitivity issues and providing a consistent import pattern.
 * 
 * USAGE:
 * import { performanceMonitor, type ComponentMetrics } from '@/utils/performance';
 */

import { performanceMonitor, PerformanceMonitor } from './PerformanceMonitor';
import type { 
  ComponentMetrics, 
  PerformanceTrackingOptions,
  RenderEventType,
  DeviceInfo 
} from '@/types/performance';

// Re-export the main monitor instance
export { performanceMonitor, PerformanceMonitor };

// Re-export all types
export type { 
  ComponentMetrics, 
  PerformanceTrackingOptions,
  RenderEventType,
  DeviceInfo 
};

export default performanceMonitor;
