
/**
 * Performance Metrics Types
 * 
 * This module defines type definitions for performance metrics.
 * 
 * @category Performance
 * @version 1.0.0
 */

import { SafeEntity } from '../base/primitives';

/**
 * Device capability classification
 */
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Performance mode settings
 */
export enum PerformanceMode {
  QUALITY = 'quality',
  BALANCED = 'balanced',
  PERFORMANCE = 'performance'
}

/**
 * Render frequency classification
 */
export enum RenderFrequency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Quality level settings
 */
export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * Types of metrics to track
 */
export enum MetricType {
  RENDER = 'render',
  INTERACTION = 'interaction',
  LOAD = 'load',
  MEMORY = 'memory',
  NETWORK = 'network',
  RESOURCE = 'resource',
  JAVASCRIPT = 'javascript',
  CSS = 'css',
  ANIMATION = 'animation',
  METRIC = 'metric',
  SUMMARY = 'summary',
  PERFORMANCE = 'performance',
  WEB_VITAL = 'webVital'
}

/**
 * Web vital metrics
 */
export enum WebVitalName {
  CLS = 'CLS',
  FCP = 'FCP',
  LCP = 'LCP',
  TTFB = 'TTFB',
  FID = 'FID',
  INP = 'INP'
}

/**
 * Web vital category
 */
export enum WebVitalCategory {
  LOADING = 'loading',
  INTERACTION = 'interaction',
  VISUAL_STABILITY = 'visual_stability',
  RESPONSIVENESS = 'responsiveness'
}

/**
 * Web vital rating types
 */
export enum WebVitalRating {
  GOOD = 'good',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  POOR = 'poor'
}

/**
 * Base interface for all metrics
 */
export interface BaseMetric {
  id?: string;
  timestamp: number;
}

/**
 * Web vital metric structure
 */
export interface WebVitalMetric extends BaseMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  rating?: WebVitalRating;
  delta?: number;
}

/**
 * Performance metric structure
 */
export interface PerformanceMetric extends BaseMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  category: string;
  type: MetricType | string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: WebVitalRating;
}

/**
 * Component metrics structure
 */
export interface ComponentMetrics extends BaseMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  firstRenderTime?: number;
  memoryUsage?: number;
  renderSizes?: number[];
  domSize?: {
    width: number;
    height: number;
    elements?: number;
  };
  // Additional properties
  slowRenderCount?: number;
  renderTimes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  lastUpdated?: number;
  metricType?: string;
}

/**
 * Check if a string is a valid MetricType
 */
export function isValidMetricType(type: string): type is MetricType {
  return Object.values(MetricType).includes(type as MetricType);
}

/**
 * Check if a string is a valid WebVitalName
 */
export function isValidWebVitalName(name: string): name is WebVitalName {
  return Object.values(WebVitalName).includes(name as WebVitalName);
}

/**
 * Check if a string is a valid WebVitalCategory
 */
export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return Object.values(WebVitalCategory).includes(category as WebVitalCategory);
}

/**
 * Check if an object is a valid PerformanceMetric
 */
export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const metric = obj as Partial<PerformanceMetric>;
  return (
    typeof metric.metric_name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.category === 'string' &&
    typeof metric.type === 'string' &&
    typeof metric.timestamp === 'number'
  );
}

/**
 * Check if an object is a valid WebVitalMetric
 */
export function isWebVitalMetric(obj: unknown): obj is WebVitalMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const metric = obj as Partial<WebVitalMetric>;
  return (
    typeof metric.name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.category === 'string' &&
    typeof metric.timestamp === 'number'
  );
}

/**
 * Check if an object is a valid ComponentMetrics
 */
export function isComponentMetrics(obj: unknown): obj is ComponentMetrics {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const metrics = obj as Partial<ComponentMetrics>;
  return (
    typeof metrics.componentName === 'string' &&
    typeof metrics.renderCount === 'number' &&
    typeof metrics.totalRenderTime === 'number' &&
    typeof metrics.averageRenderTime === 'number' &&
    typeof metrics.lastRenderTime === 'number'
  );
}

/**
 * Safe helper to ensure a performance metric has an ID
 */
export function ensureMetricId<T extends BaseMetric>(metric: T): SafeEntity<T> {
  if (!metric.id) {
    return {
      ...metric,
      id: `metric-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
  }
  return metric as SafeEntity<T>;
}
