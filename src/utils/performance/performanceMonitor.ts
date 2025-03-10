
// Import directly from the PerformanceMonitor file
import { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';

// Export the singleton and class
export { performanceMonitor, PerformanceMonitor };
export type { ComponentMetrics } from '@/services/ai/types';

export default performanceMonitor;
