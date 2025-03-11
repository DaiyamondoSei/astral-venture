
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
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: string | number;
  category: string;
  type: MetricType;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

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
