
// Re-export from the properly cased file to maintain backward compatibility
export * from './PerformanceMonitor';

// Create and export the singleton instance
import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export the singleton instance
const performanceMonitor = new PerformanceMonitor();
export { performanceMonitor };
export default performanceMonitor;
