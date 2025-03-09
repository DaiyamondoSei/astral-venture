
import { PerformanceMonitor } from './PerformanceMonitor';

// Create and export a singleton instance for consistent monitoring
export const performanceMonitor = new PerformanceMonitor();

// Add additional methods to the singleton instance for better reporting
performanceMonitor.reportSlowRender = function(componentName: string, duration: number) {
  if (!componentName || typeof duration !== 'number') return;
  
  // Only report if we're in development or if explicitly configured to report in production
  if (process.env.NODE_ENV === 'production' && !performanceMonitor.shouldReportInProduction) {
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
  
  // Could be extended to send to analytics or monitoring service
  // if that functionality is needed in the future
};

// Export the extended singleton
export default performanceMonitor;
