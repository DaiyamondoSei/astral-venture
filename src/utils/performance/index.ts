
/**
 * Performance Monitoring Exports
 * 
 * This file centralizes exports from the performance monitoring system
 * to ensure consistent imports throughout the application.
 */

import performanceMonitor from './performanceMonitor';
import { metricsCollector } from './metricsCollector';
import { metricsReporter } from './metricsReporter';
import type { 
  MetricType, 
  ComponentMetric, 
  ComponentMetrics, 
  WebVitalMetric,
  PerformanceMonitorConfig,
  MetricsSubscriber,
  PerformanceReportPayload
} from './types';

// Re-export types
export type {
  MetricType,
  ComponentMetric,
  ComponentMetrics, 
  WebVitalMetric,
  PerformanceMonitorConfig,
  MetricsSubscriber,
  PerformanceReportPayload
};

// Re-export components
export {
  metricsCollector,
  metricsReporter
};

// Default export for the singleton
export default performanceMonitor;
