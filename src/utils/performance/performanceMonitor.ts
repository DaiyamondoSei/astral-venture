
// Export from the properly cased file
export * from './PerformanceMonitor';

// Create and export a singleton instance
import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export the singleton instance
const performanceMonitor = new PerformanceMonitor();
export { performanceMonitor };
export default performanceMonitor;
