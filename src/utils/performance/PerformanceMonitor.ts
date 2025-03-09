/**
 * Performance monitoring utility for tracking render times and performance metrics
 */

import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export a singleton instance for consistent monitoring
const performanceMonitor = new PerformanceMonitor();

// Add additional methods to the singleton instance for better reporting
performanceMonitor.reportSlowRender = function(componentName: string, duration: number): void {
  if (!componentName || typeof duration !== 'number') return;
  
  // Only report if we're in development or if explicitly configured to report in production
  const shouldReportInProduction = false; // Default to false for production
  if (process.env.NODE_ENV === 'production' && !shouldReportInProduction) {
    return;
  }
  
  // Log the slow render for local debugging
  console.warn(`[Performance] Slow render in ${componentName}: ${duration.toFixed(2)}ms`);
  
  // Store in memory for later analysis
  this.recordMetric('slowRender', {
    componentName,
    duration,
    timestamp: Date.now()
  });
};

// Export the extended singleton
export { performanceMonitor };
export default performanceMonitor;
