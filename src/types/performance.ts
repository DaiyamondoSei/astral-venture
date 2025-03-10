
export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
  user_id?: string;
  type?: 'render' | 'interaction' | 'navigation' | 'resource' | 'custom';
  metadata?: Record<string, any>;
  id?: string;
}

export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  slowRenders: number;
  lastRenderTime: number;
  totalRenderTime: number;
  firstRenderTime: number;
}

export interface ComponentMetrics {
  [key: string]: ComponentMetric;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface PerformanceConfig {
  monitoringLevel: 'high' | 'medium' | 'low' | 'debug';
  autoOptimize: boolean;
  trackInteractions: boolean;
  reportToServer: boolean;
  debugMode: boolean;
}
