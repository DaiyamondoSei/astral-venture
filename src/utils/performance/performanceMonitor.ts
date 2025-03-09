
// Export the class directly
export * from './PerformanceMonitor';

// Create and export a singleton instance
import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export the singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
