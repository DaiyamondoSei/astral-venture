
/**
 * Performance Metrics Types
 * 
 * This module defines types related to performance metrics and monitoring.
 */

import { DeviceInfo } from './device';

/**
 * Types of metrics that can be tracked
 */
export type MetricType = 
  | 'render' 
  | 'interaction' 
  | 'load' 
  | 'memory' 
  | 'network' 
  | 'resource' 
  | 'javascript' 
  | 'css' 
  | 'animation' 
  | 'metric' 
  | 'summary' 
  | 'performance' 
  | 'webVital';

/**
 * Web vital metrics
 */
export type WebVitalName = 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'FID' | 'INP';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability' | 'responsiveness';

/**
 * Web vital rating types
 */
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Performance render frequency
 */
export enum RenderFrequency {
  LOW = 'low',       // 30fps or less
  MEDIUM = 'medium', // 30-50fps
  HIGH = 'high',     // 50-60fps
  VARIABLE = 'variable' // Inconsistent
}

/**
 * Performance metric record for storage and analysis
 */
export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  category: string;
  timestamp: string | number;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  device_info?: DeviceInfo;
  metadata?: Record<string, any>;
  environment?: string;
  rating?: WebVitalRating;
  id?: string;
}

/**
 * Web vital metric structure
 */
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: WebVitalRating;
  delta?: number;
  id?: string;
}

/**
 * Component render metrics
 */
export interface ComponentRenderMetric {
  componentId: string;
  componentName: string;
  renderCount: number;
  renderTime: number;
  renderDuration: number;
  renderFrequency: RenderFrequency;
  timestamp: number;
  path: string;
  parentComponent?: string;
}

/**
 * Component lifecycle metrics
 */
export interface ComponentLifecycleMetric {
  componentId: string;
  componentName: string;
  lifecycleHook: 'mount' | 'update' | 'unmount';
  duration: number;
  timestamp: number;
}

/**
 * Interaction metrics
 */
export interface InteractionMetric {
  interactionId: string;
  interactionType: string;
  targetElement: string;
  duration: number;
  timestamp: number;
  delay: number;
}

/**
 * Performance data error structure
 */
export interface PerformanceDataError {
  metricIndex: number;
  message: string;
  field?: string;
  code?: string;
}

/**
 * Configuration for performance monitoring
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  reportingEndpoint?: string;
  reportingInterval: number;
  includeDeviceInfo: boolean;
  includeWebVitals: boolean;
  includeComponentMetrics: boolean;
  includeInteractionMetrics: boolean;
  logToConsole: boolean;
  monitorThirdParty: boolean;
  maxMetricsPerBatch: number;
  errorCallback?: (error: Error) => void;
}

/**
 * Type guards for runtime type safety
 */
export function isValidMetricType(type: string): type is MetricType {
  return [
    'render', 'interaction', 'load', 'memory', 'network', 
    'resource', 'javascript', 'css', 'animation', 
    'metric', 'summary', 'performance', 'webVital'
  ].includes(type as MetricType);
}

export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['CLS', 'FCP', 'LCP', 'TTFB', 'FID', 'INP'].includes(name as WebVitalName);
}

export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return [
    'loading', 'interaction', 'visual_stability', 'responsiveness'
  ].includes(category as WebVitalCategory);
}

export function isValidRating(rating: string): rating is WebVitalRating {
  return ['good', 'needs-improvement', 'poor'].includes(rating as WebVitalRating);
}

export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const metric = obj as Partial<PerformanceMetric>;
  return (
    typeof metric.metric_name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.category === 'string' &&
    typeof metric.type === 'string' &&
    (typeof metric.timestamp === 'string' || typeof metric.timestamp === 'number')
  );
}

export function isWebVitalMetric(obj: unknown): obj is WebVitalMetric {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const vital = obj as Partial<WebVitalMetric>;
  return (
    typeof vital.name === 'string' &&
    typeof vital.value === 'number' &&
    typeof vital.category === 'string' &&
    typeof vital.timestamp === 'number'
  );
}
