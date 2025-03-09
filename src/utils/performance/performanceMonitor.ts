
// Re-export from the properly cased file to maintain backward compatibility
export * from './PerformanceMonitor';

// Re-export the singleton instance
import { performanceMonitor } from './PerformanceMonitor';
export { performanceMonitor };
export default performanceMonitor;
