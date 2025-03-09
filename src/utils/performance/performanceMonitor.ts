
// Re-export from the properly cased file to maintain backward compatibility
export * from './PerformanceMonitor';

// Re-export the default export
import { performanceMonitor as actualPerformanceMonitor } from './PerformanceMonitor';
export { actualPerformanceMonitor as performanceMonitor };

export default actualPerformanceMonitor;
