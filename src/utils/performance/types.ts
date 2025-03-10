
/**
 * Performance monitoring types
 */

// Types of performance metrics
export type MetricType = 'render' | 'interaction' | 'load';

// Component performance metrics
export interface ComponentMetrics {
  // Component identifier
  componentName: string;
  
  // Render timing metrics
  totalRenderTime: number;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenderCount: number;
  maxRenderTime: number;
  minRenderTime: number;
  renderTimes: number[];
  
  // Metadata
  createdAt: number;
  lastUpdated: number;
  metricType?: MetricType;
}

// Web vital metric
export interface WebVitalMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'interaction' | 'loading' | 'visual_stability';
}

// Device capability information
export interface DeviceInfo {
  cpuCores?: number;
  deviceMemory?: number;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  connectionType?: string;
  screenResolution?: string;
  browser?: string;
  os?: string;
}

// Performance mode
export type PerformanceMode = 'low' | 'medium' | 'high' | 'auto';

// Threshold configuration for performance metrics
export interface PerformanceThresholds {
  slowRender: number;
  verySlowRender: number;
  criticalRender: number;
  slowInteraction: number;
  verySlowInteraction: number;
  criticalInteraction: number;
}

// Feature flags for performance-related features
export interface PerformanceFeatures {
  virtualization: boolean;
  lazyLoading: boolean;
  imageOptimization: boolean;
  skeletonLoaders: boolean;
  debouncing: boolean;
  memoization: boolean;
}

// Database performance metric
export interface PerformanceMetric {
  id?: string;
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  max_render_time: number;
  min_render_time: number;
  user_id?: string | null;
  metric_type: string;
  created_at?: string;
  context?: Record<string, any>;
}
