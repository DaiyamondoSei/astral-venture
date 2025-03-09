
// Re-export from the properly cased file to maintain backward compatibility
export * from './PerformanceMonitor';

// Re-export the singleton instance
export { performanceMonitor } from './PerformanceMonitor';
export default performanceMonitor;
