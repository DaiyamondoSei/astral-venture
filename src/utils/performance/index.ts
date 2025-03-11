
/**
 * Performance Monitoring and Optimization System
 * 
 * Entry point for the performance monitoring and optimization system.
 */

// Export core types
export * from './core/types';
export * from './core/constants';
export * from './core/utils';

// Export collectors
export { metricsCollector } from './collectors/MetricsCollector';

// Export default instance
import { metricsCollector } from './collectors/MetricsCollector';
export default metricsCollector;
