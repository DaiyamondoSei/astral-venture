
/**
 * Performance Metrics Types
 * 
 * Utility types and functions for performance metrics
 */

import { MetricType, WebVitalCategory, WebVitalName, ComponentMetrics } from './types';
import { MetricTypes, WebVitalCategories, WebVitalNames } from './constants';

/**
 * Check if a value is a valid metric type
 */
export function isValidMetricType(value: unknown): value is MetricType {
  return typeof value === 'string' && 
    Object.values(MetricTypes).includes(value as any);
}

/**
 * Check if a value is a valid web vital name
 */
export function isValidWebVitalName(value: unknown): value is WebVitalName {
  return typeof value === 'string' && 
    Object.values(WebVitalNames).includes(value as any);
}

/**
 * Check if a value is a valid web vital category
 */
export function isValidWebVitalCategory(value: unknown): value is WebVitalCategory {
  return typeof value === 'string' && 
    Object.values(WebVitalCategories).includes(value as any);
}

/**
 * Check if a value is a component metrics object
 */
export function isComponentMetrics(value: unknown): value is ComponentMetrics {
  return typeof value === 'object' && 
    value !== null &&
    'componentName' in value &&
    'renderCount' in value &&
    'totalRenderTime' in value;
}

/**
 * Ensure a metric has a unique ID
 */
export function ensureMetricId(metricName: string, timestamp: number): string {
  return `${metricName}_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
}
