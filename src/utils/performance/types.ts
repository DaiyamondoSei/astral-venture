
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
  // Additional properties for backward compatibility and extended tracking
  slowRenderCount?: number;
  renderTimes?: number[];
  minRenderTime?: number;
  maxRenderTime?: number;
  lastUpdated?: number;
  metricType?: string;
}

// Web vital metric structure
export interface WebVitalMetric {
  name: WebVitalName | string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// General performance metric
export interface PerformanceMetric {
  componentName?: string;
  component_name?: string; // For backward compatibility
  metricName: string;
  metric_name?: string; // For backward compatibility
  value: number;
  timestamp: number;
  category: string;
  type: string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
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
  trackInteraction?: (interactionName: string, duration: number) => void;
  getMetrics: () => ComponentMetrics | null;
  recordSize: (domNode: HTMLElement | null) => void;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  reportingEndpoint?: string;
  debugMode: boolean;
  
  // Extended config properties for adaptive performance
  optimizationLevel?: 'high' | 'medium' | 'low' | 'auto';
  throttleInterval?: number;
  maxTrackedComponents?: number;
  
  // Feature flags
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  
  // Advanced features
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
}

// Device information for metrics reporting
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  viewport?: {
    width: number;
    height: number;
  };
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  memory?: {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  };
}

// Performance report payload
export interface PerformanceReportPayload {
  timestamp: number;
  session?: string;
  metrics: PerformanceMetric[];
  device?: DeviceInfo;
}

// Subscriber for metrics updates
export type MetricsSubscriber = (metrics: Map<string, ComponentMetrics>) => void;

// Web vitals for backward compatibility
export interface WebVitals {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  inp?: number;
}

// Adaptive optimization settings
export interface AdaptiveSettings {
  virtualization: boolean;
  lazyLoading: boolean;
  imageOptimization: boolean;
  enableParticles?: boolean;
  enableComplexAnimations?: boolean;
  enableBlur?: boolean;
  enableShadows?: boolean;
  enableWebWorkers?: boolean;
  enableHighResImages?: boolean;
}

// Component metric interface (for legacy support)
export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenderCount: number;
  lastUpdated: number;
}

// Performance monitor methods
export interface IPerformanceMonitor {
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  setConfig: (config: Partial<PerformanceMonitorConfig>) => void;
  getConfig: () => PerformanceMonitorConfig;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  addComponentMetric: (componentName: string, renderTime: number, type?: MetricType) => void;
  addWebVital: (name: WebVitalName | string, value: number, category: WebVitalCategory) => void;
  getAllMetrics: () => Map<string, ComponentMetrics>;
  getMetric: (componentName: string) => ComponentMetrics | undefined;
  clearMetrics: () => void;
  subscribe: (callback: MetricsSubscriber) => () => void;
  reportNow: () => Promise<boolean>;
  getWebVitals: () => WebVitals;
  getDeviceInfo: () => DeviceInfo;
  getAdaptiveSettings: () => AdaptiveSettings;
  setAdaptiveSettings: (settings: Partial<AdaptiveSettings>) => void;
  detectDeviceCapability: () => 'low' | 'medium' | 'high';
  recordRender: (componentName: string, renderTime: number) => void;
}
