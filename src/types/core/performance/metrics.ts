
/**
 * Performance Metrics Types
 * 
 * This module defines standardized types for performance metrics
 * used throughout the application.
 * 
 * @category Performance
 * @version 1.0.0
 */

import { Timestamp } from '../base/primitives';

/**
 * Basic Classification Types
 */

/**
 * Device capability classification
 */
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * Performance mode settings
 */
export enum PerformanceMode {
  AUTO = 'auto',       // Automatically determine based on device capabilities
  LOW = 'low',         // Low-end mode with minimal effects
  MEDIUM = 'medium',   // Balanced performance and visual effects
  HIGH = 'high'        // Full visual effects, assumes powerful device
}

/**
 * Render frequency classification
 */
export enum RenderFrequency {
  LOW = 'low',         // 30fps or lower
  MEDIUM = 'medium',   // 30-45fps
  HIGH = 'high',       // 45-60fps
  VARIABLE = 'variable', // Adaptive based on device
  NORMAL = 'normal',   // Expected render frequency
  FREQUENT = 'frequent', // More frequent than expected
  EXCESSIVE = 'excessive' // Too frequent, potential performance issue
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
 * Metric Types
 */

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
 * Web vital categories
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
 * Core Metric Interfaces
 */

/**
 * Web vital metric structure
 */
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: Timestamp | number;
  rating?: WebVitalRating;
  delta?: number;
  id?: string;
}

/**
 * Performance metric structure
 */
export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  timestamp: Timestamp | number | string;
  category: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: WebVitalRating;
  id?: string;
}

/**
 * Component metrics structure
 */
export interface ComponentMetrics {
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
  slowRenderCount?: number;
  renderTimes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  lastUpdated?: number;
  metricType?: string;
  id?: string;
}

/**
 * Device information structure
 */
export interface DeviceInfo {
  userAgent?: string;
  deviceCategory?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  memory?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
}

/**
 * Performance report payload structure
 */
export interface PerformanceReportPayload {
  metrics: PerformanceMetric[];
  webVitals?: WebVitalMetric[];
  sessionId?: string;
  userId?: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'desktop';
  deviceInfo?: DeviceInfo;
}

/**
 * Type Guards
 */

/**
 * Type guard for MetricType
 */
export function isValidMetricType(type: unknown): type is MetricType {
  return typeof type === 'string' && Object.values(MetricType).includes(type as MetricType);
}

/**
 * Type guard for WebVitalName
 */
export function isValidWebVitalName(name: unknown): name is WebVitalName {
  return typeof name === 'string' && Object.values(WebVitalName).includes(name as WebVitalName);
}

/**
 * Type guard for WebVitalCategory
 */
export function isValidWebVitalCategory(category: unknown): category is WebVitalCategory {
  return typeof category === 'string' && Object.values(WebVitalCategory).includes(category as WebVitalCategory);
}

/**
 * Type guard for PerformanceMetric
 */
export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  return typeof obj === 'object' && 
    obj !== null && 
    'metric_name' in obj && 
    'value' in obj && 
    'category' in obj && 
    'type' in obj && 
    'timestamp' in obj;
}

/**
 * Type guard for WebVitalMetric
 */
export function isWebVitalMetric(obj: unknown): obj is WebVitalMetric {
  return typeof obj === 'object' && 
    obj !== null && 
    'name' in obj && 
    'value' in obj && 
    'category' in obj && 
    'timestamp' in obj;
}

/**
 * Type guard for ComponentMetrics
 */
export function isComponentMetrics(obj: unknown): obj is ComponentMetrics {
  return typeof obj === 'object' && 
    obj !== null && 
    'componentName' in obj && 
    'renderCount' in obj && 
    'totalRenderTime' in obj && 
    'averageRenderTime' in obj && 
    'lastRenderTime' in obj;
}
