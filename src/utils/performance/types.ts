
/**
 * Performance Monitoring Types
 * 
 * This module defines the types used by the performance monitoring system.
 */

export type MetricType = 'render' | 'load' | 'interaction';

export interface ComponentMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
  type: MetricType;
}

export interface ComponentMetrics {
  totalRenders: number;
  slowRenders: number;
  totalRenderTime: number;
  firstRenderTime: number | null;
  lastRenderTime: number;
  metrics: ComponentMetric[];
}

export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'interaction' | 'loading' | 'visual_stability';
  timestamp: number;
}

export interface PerformanceMonitorConfig {
  batchSize: number;
  slowThreshold: number;
  enabled: boolean;
}

export interface MetricsSubscriber {
  (metrics: Map<string, ComponentMetrics>): void;
}

export interface PerformanceReportPayload {
  metrics: Array<{
    component_name: string;
    average_render_time: number;
    total_renders: number;
    slow_renders: number;
    first_render_time: number | null;
    client_timestamp: string;
  }>;
  web_vitals?: Array<{
    name: string;
    value: number;
    category: 'interaction' | 'loading' | 'visual_stability';
    client_timestamp: string;
  }>;
}
