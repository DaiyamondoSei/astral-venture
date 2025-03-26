
/**
 * Performance Metrics
 * 
 * Types for performance metrics collection and processing
 */

import { 
  WebVitalName,
  WebVitalCategory,
  MetricType,
  ComponentMetrics,
  WebVitalMetric,
  PerformanceMetric
} from './types';

// Metric collection options
export interface MetricsCollectionOptions {
  enabled: boolean;
  samplingRate: number;
  maxItems: number;
  throttleInterval: number;
  persistData: boolean;
}

// Performance data collected by monitoring
export interface PerformanceData {
  metrics: PerformanceMetric[];
  webVitals: Record<WebVitalName, number>;
  components: Record<string, ComponentMetrics>;
  fps: number[];
  memory: number[];
  pageLoads: number[];
  interactions: Record<string, { count: number; avgTime: number }>;
  timestamp: number;
}

// Web vital report from web-vitals library
export interface WebVitalReport {
  name: string;
  id: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
}

// Performance monitor options
export interface PerformanceMonitorOptions {
  enabled?: boolean;
  debug?: boolean;
  trackComponents?: boolean;
  trackWebVitals?: boolean;
  trackFPS?: boolean;
  trackMemory?: boolean;
  sampleInterval?: number;
}

// Component metric with timestamp
export interface TimestampedComponentMetric extends ComponentMetrics {
  timestamp: number;
}

// Performance metrics service interface
export interface MetricsCollector {
  trackComponentMetric: (
    componentName: string, 
    renderTime: number, 
    type?: 'render' | 'interaction' | 'load'
  ) => void;
  
  addWebVital: (
    name: string, 
    value: number, 
    category: WebVitalCategory
  ) => void;
  
  getAllMetrics: () => Record<string, ComponentMetrics>;
  
  getWebVitals: () => Record<string, number>;
  
  getSlowestComponents: (limit?: number) => ComponentMetrics[];
  
  getMostReRenderedComponents: (limit?: number) => ComponentMetrics[];
  
  reportNow: () => Promise<{success: boolean; error?: string}>;
  
  reset: () => void;
}

// Performance monitoring hook result
export interface PerformanceMonitorHookResult {
  startTiming: () => void;
  endTiming: (metricName?: string) => void;
  trackInteraction: (interactionName: string) => () => void;
  measureDomSize: (element: HTMLElement) => void;
  getPerformanceData: () => PerformanceData;
  ref: React.MutableRefObject<HTMLElement | null>;
}

// Performance tracking options
export interface PerformanceTrackingOptions {
  trackRender?: boolean;
  trackInteractions?: boolean;
  trackDomSize?: boolean;
}
