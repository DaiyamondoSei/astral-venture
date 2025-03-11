
// Core performance types
export type MetricType = 'render' | 'interaction' | 'load' | 'memory' | 'network' | 'resource' | 'javascript' | 'css' | 'animation' | 'metric';

export interface PerformanceMetric {
  component_name?: string;
  metric_name: string;
  value: number;
  timestamp: string | number;
  category: string;
  type: MetricType;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  renderSizes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  lastUpdated?: number;
}

export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
}

export interface AdaptiveSettings {
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  targetFPS: number;
  particleCount: number;
  maxAnimationsPerFrame: number;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
}
