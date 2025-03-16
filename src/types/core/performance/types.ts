
/**
 * Performance monitoring system types
 * Following the Type-Value Pattern for consistent type definitions
 */

// Device capability type
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance mode type
export type PerformanceMode = 'battery' | 'balanced' | 'performance' | 'auto' | 'quality';

// Render frequency type
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Quality level type
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Metric type for performance tracking
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
  | 'web_vital';

// Web vital categories
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Performance configuration interface
export interface PerformanceConfig {
  // Core settings
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Sampling settings
  samplingRate: number;
  throttleInterval: number;
  
  // Monitoring configuration
  slowRenderThreshold: number;
  maxTrackedComponents: number;
  
  // Optimizations
  enableValidation: boolean;
  batchUpdates: boolean;
  inactiveTabThrottling: boolean;
  intelligentProfiling: boolean;
  resourceOptimizationLevel: 'none' | 'conservative' | 'aggressive';
  
  // Advanced settings
  customThrottleInterval?: number;
  metricsPersistence: boolean;
}

// Performance metric structure
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  type: MetricType;
  timestamp?: number;
  category?: string;
}

// Web vital metric structure
export interface WebVitalMetric {
  metric_name: string;
  category: WebVitalCategory;
  value: number;
  type: 'web_vital';
  timestamp?: number;
}

// Component metrics structure
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime?: number;
  slowRenderCount?: number;
  firstRenderTime?: number;
}

// Device information structure
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  viewport?: {
    width: number;
    height: number;
  };
  screenSize: {
    width: number;
    height: number;
  };
  pixelRatio?: number;
}

// Render event types
export type RenderEventType = 'render' | 'interaction' | 'load';

// Performance tracking options
export interface PerformanceTrackingOptions {
  autoStart?: boolean;
  slowRenderThreshold?: number;
  enableDebugLogging?: boolean;
  trackRenders?: boolean;
  trackReRenders?: boolean;
}

// Performance data structure
export interface PerformanceData {
  metrics: ComponentMetrics[];
  webVitals: WebVitalMetric[];
  deviceInfo: DeviceInfo;
  timestamp: number;
}
