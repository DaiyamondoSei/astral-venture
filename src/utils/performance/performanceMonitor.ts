
// Import directly from the PerformanceMonitor file
import { PerformanceMonitor, performanceMonitor, IComponentMetrics } from './PerformanceMonitor';

// Export the singleton, class and types
export { performanceMonitor, PerformanceMonitor, IComponentMetrics };
export type { ComponentMetrics } from '@/services/ai/types';

export default performanceMonitor;
