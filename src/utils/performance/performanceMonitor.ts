
/**
 * Performance monitoring utility for tracking render times and performance metrics
 */

import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export a singleton instance for consistent monitoring
const performanceMonitor = new PerformanceMonitor();

// Export the singleton
export { performanceMonitor };
export default performanceMonitor;
