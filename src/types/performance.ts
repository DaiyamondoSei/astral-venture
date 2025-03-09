
export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
}

export interface ComponentMetric {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  slowRenderCount: number;
  lastRenderTime: number;
  firstRenderTime: number;
}

export interface ComponentMetrics {
  components: Record<string, ComponentMetric>;
  totalComponents: number;
  slowestComponent: string;
  fastestComponent: string;
  averageTime: number;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

export interface PerformanceReport {
  componentMetrics: ComponentMetrics;
  webVitals: Record<string, WebVitalMetric>;
  resourceMetrics: any[];
  timestamp: string;
}

export type GlassmorphicVariant = 'default' | 'ethereal' | 'quantum' | 'cosmic';

export type CubeSize = 'small' | 'medium' | 'large' | 'full';
