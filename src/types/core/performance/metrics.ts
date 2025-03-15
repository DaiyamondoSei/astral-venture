
/**
 * Performance metrics types
 * 
 * This module provides type definitions for performance metrics
 * including component metrics, web vitals, and custom performance metrics.
 */

// Basic metric types
export type MetricType = 'performance' | 'interaction' | 'memory' | 'network' | 'custom';

// Web Vitals names
export type WebVitalName = 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';

// Web Vitals categories
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Performance metric base interface
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp?: number;
  type: MetricType;
  category?: string;
  metadata?: Record<string, any>;
}

// Web Vitals metric interface
export interface WebVitalMetric extends PerformanceMetric {
  metric_name: WebVitalName;
  category: WebVitalCategory;
}

// Component metrics interface
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime?: number;
  minRenderTime?: number;
  slowRenderCount?: number;
  lastRenderTime?: number;
  totalRenderTime?: number;
  renderTimes?: number[];
  interactionMetrics?: Record<string, number>;
}

// Type guards
export function isValidMetricType(type: string): type is MetricType {
  return ['performance', 'interaction', 'memory', 'network', 'custom'].includes(type);
}

export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['FCP', 'LCP', 'CLS', 'FID', 'TTFB', 'INP'].includes(name);
}

export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return ['loading', 'interaction', 'visual_stability'].includes(category);
}

export function isPerformanceMetric(metric: any): metric is PerformanceMetric {
  return (
    typeof metric === 'object' &&
    typeof metric.metric_name === 'string' &&
    typeof metric.value === 'number' &&
    isValidMetricType(metric.type)
  );
}

export function isWebVitalMetric(metric: any): metric is WebVitalMetric {
  return (
    isPerformanceMetric(metric) &&
    isValidWebVitalName(metric.metric_name) &&
    isValidWebVitalCategory(metric.category)
  );
}

export function isComponentMetrics(metrics: any): metrics is ComponentMetrics {
  return (
    typeof metrics === 'object' &&
    typeof metrics.componentName === 'string' &&
    typeof metrics.renderCount === 'number' &&
    typeof metrics.averageRenderTime === 'number'
  );
}

// ID generation for metrics
export function ensureMetricId(metric: PerformanceMetric): string {
  return `${metric.type}-${metric.metric_name}-${metric.timestamp || Date.now()}`;
}
