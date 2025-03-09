
// Import directly from the PerformanceMonitor file
import { PerformanceMonitor, performanceMonitor } from './PerformanceMonitor';

// Export the singleton
export { performanceMonitor };
export { PerformanceMonitor };
export type { ComponentMetrics } from '@/services/ai/types';

export default performanceMonitor;
