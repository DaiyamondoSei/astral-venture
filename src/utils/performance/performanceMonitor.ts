
/**
 * Re-export from PerformanceMonitor to provide consistent imports
 * This helps avoid case sensitivity issues across different operating systems
 */

import { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';
import type { ComponentMetrics } from '@/types/performance';

// Re-export the singleton instance, class and types
export { performanceMonitor, PerformanceMonitor };
export type { ComponentMetrics };

export default performanceMonitor;
