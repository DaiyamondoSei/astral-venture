
/**
 * Performance Monitoring System - Compatibility Layer
 * 
 * This file re-exports from PerformanceMonitor to maintain backward compatibility
 * and resolve case-sensitivity issues across different operating systems.
 * 
 * @deprecated Import from '@/utils/performance' instead for a more consistent pattern
 */

import { performanceMonitor, PerformanceMonitor } from './PerformanceMonitor';
import type { 
  ComponentMetrics, 
  PerformanceTrackingOptions,
  RenderEventType,
  DeviceInfo 
} from '@/types/performance';

// Re-export the singleton instance, class and types
export { performanceMonitor, PerformanceMonitor };
export type { 
  ComponentMetrics, 
  PerformanceTrackingOptions,
  RenderEventType,
  DeviceInfo 
};

// Add deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[Deprecation Warning] Importing directly from "performanceMonitor.ts" is deprecated. ' +
    'Please import from "@/utils/performance" instead for better consistency.'
  );
}

export default performanceMonitor;
