
/**
 * Performance Metrics Types
 * 
 * This module provides types for performance metrics and monitoring.
 */

import { MetricType, WebVitalCategory, WebVitalName } from './types';

// Component render metrics
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  timeToFirstRender?: number;
  reRenderCount?: number;
  lastUpdate: number;
}

// Performance summary metrics
export interface PerformanceSummary {
  averageFPS: number;
  memoryUsage: number;
  cpuUsage?: number;
  totalComponentsRendered: number;
  averageRenderTime: number;
  slowRenders: number;
  timestamp: number;
  windowSize: { width: number; height: number };
}

// Device information for metrics context
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
  connection?: {
    type?: string;
    speed?: number;
  };
}

// Type guards for metrics
export function isValidMetricType(type: string): type is MetricType {
  return ['render', 'interaction', 'load', 'memory', 'network', 'resource', 
          'javascript', 'css', 'animation', 'metric', 'summary', 
          'performance', 'webVital'].includes(type);
}

export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['CLS', 'FCP', 'LCP', 'TTFB', 'FID', 'INP'].includes(name);
}

export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return ['loading', 'interaction', 'visual_stability'].includes(category);
}

export function isComponentMetrics(metrics: unknown): metrics is ComponentMetrics {
  if (!metrics || typeof metrics !== 'object') return false;
  
  const m = metrics as Partial<ComponentMetrics>;
  return (
    typeof m.componentName === 'string' &&
    typeof m.renderCount === 'number' &&
    typeof m.averageRenderTime === 'number'
  );
}

// Helper function to create an ID for metrics
export function ensureMetricId(metric: { metric_name: string; timestamp?: number }): string {
  return `${metric.metric_name}-${metric.timestamp || Date.now()}`;
}
