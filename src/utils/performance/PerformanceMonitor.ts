import { PerformanceMonitor, performanceMonitor, IComponentMetrics } from './PerformanceMonitor';
import type { ComponentMetrics } from '@/services/ai/types';

// Re-export the singleton instance, class and types
export { performanceMonitor, PerformanceMonitor, IComponentMetrics };
export type { ComponentMetrics };

export default performanceMonitor;
