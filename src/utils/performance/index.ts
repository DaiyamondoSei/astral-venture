
/**
 * Performance Monitoring System
 * 
 * Centralized exports for performance monitoring
 */

// Export the main performance monitor
export { performanceMonitor } from './performanceMonitor';
export { default as performanceMonitor } from './performanceMonitor';

// Export types
export * from './types';

// Export utility functions
export { default as withPerformanceTracking } from './withPerformanceTracking';
export { default as RenderAnalyzer } from './RenderAnalyzer';
export { default as metricsReporter } from './metricsReporter';

// Re-export for backward compatibility
export { performanceMonitor as PerformanceMonitor } from './performanceMonitor';
