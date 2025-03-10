
/**
 * Re-export from PerformanceMonitor to provide consistent imports
 * This helps avoid case sensitivity issues across different operating systems
 */

import { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';
import type { IComponentMetrics } from './PerformanceMonitor';
import type { ComponentMetrics } from '@/services/ai/types';

// Re-export the singleton instance, class and types
export { performanceMonitor, PerformanceMonitor };
export type { IComponentMetrics, ComponentMetrics };

// Type assertion to ensure compatibility between interfaces
const _typeCheck: ComponentMetrics = {} as IComponentMetrics;
const _reverseCheck: IComponentMetrics = {} as ComponentMetrics;

export default performanceMonitor;
