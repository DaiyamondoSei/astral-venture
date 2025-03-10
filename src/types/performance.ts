
/**
 * Performance monitoring types
 */

// Performance monitoring level
export type PerformanceMonitoringLevel = 'high' | 'medium' | 'low' | 'debug';

// Component metric
export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  minRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  slowRenders: number;
  timestamp: number;
}

// Collection of component metrics
export interface ComponentMetrics {
  [componentName: string]: ComponentMetric;
}

// Performance mark for measuring specific operations
export interface PerformanceMark {
  name: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

// Web vital metric data
export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

// Component render timing data
export interface ComponentRenderTiming {
  componentName: string;
  renderTime: number;
  renderType: 'initial' | 'update' | 'effect';
  timestamp: number;
}

// Session data for performance tracking
export interface PerformanceSession {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  startTime: number;
}

// Device information for context
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  viewport?: {
    width: number;
    height: number;
  };
  screenSize?: {
    width: number;
    height: number;
  };
  pixelRatio?: number;
}

// Performance metric for database
export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  created_at: string;
}

// Monitoring status
export interface MonitoringStatus {
  isActive: boolean;
  lastReportTime: number;
  metricsCollected: number;
  sessionsTracked: number;
}

// Config state for performance monitoring
export interface PerformanceConfigState {
  monitoringLevel: PerformanceMonitoringLevel;
  autoOptimize: boolean;
  trackInteractions: boolean;
  reportToServer: boolean;
  debugMode: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  deviceCapability: 'high' | 'medium' | 'low';
  manualPerformanceMode: 'auto' | 'high' | 'balanced' | 'low';
  features: {
    animations: boolean;
    particleEffects: boolean;
    backgroundEffects: boolean;
    highQualityRendering: boolean;
  };
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  webVitals: Record<string, number>;
}
