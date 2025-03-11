
/**
 * Performance Monitoring Types
 * 
 * Type definitions for the performance monitoring system.
 */

// Types of metrics to track
export type MetricType = 'render' | 'load' | 'interaction';

// Web vital metrics
export type WebVitalName = 'fcp' | 'lcp' | 'cls' | 'fid' | 'ttfb' | 'inp';
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Component metrics structure
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  memoryUsage: number;
  renderSizes: number[];
}

// Web vital metric structure
export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

// General performance metric
export interface PerformanceMetric {
  componentName?: string;
  metricName: string;
  value: number;
  timestamp: number;
  category: string;
  type: string;
}

// Performance tracking options for hooks
export interface PerformanceTrackingOptions {
  componentName: string;
  metricType?: MetricType;
  autoStart?: boolean;
  slowThreshold?: number;
  logSlowRenders?: boolean;
  trackInteractions?: boolean;
  trackSize?: boolean;
  trackMemory?: boolean;
}

// Performance tracking result for hooks
export interface PerformanceTrackingResult {
  startTiming: () => void;
  endTiming: () => void;
  startInteractionTiming: (interactionName: string) => () => void;
  getMetrics: () => ComponentMetrics | null;
  recordSize: (domNode: HTMLElement | null) => void;
}
