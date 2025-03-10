/**
 * Shared type definitions for performance monitoring
 * Used across frontend and backend systems
 */

/**
 * Component performance metrics interface
 */
export interface ComponentMetrics {
  /** Component name */
  componentName: string;
  /** Number of times the component has rendered */
  renderCount: number;
  /** Total time spent rendering the component (ms) */
  totalRenderTime: number;
  /** Average render time (ms) */
  averageRenderTime: number;
  /** Time taken for the last render (ms) */
  lastRenderTime: number;
  /** Number of renders that exceeded threshold */
  slowRenderCount: number;
  /** Time taken for first render (ms) */
  firstRenderTime?: number;
}

/**
 * Performance tracking options with strict typing
 */
export interface PerformanceTrackingOptions {
  autoStart?: boolean;
  slowRenderThreshold?: number;
  logSlowRenders?: boolean;
  enableDebugLogging?: boolean;
  reportMetrics?: boolean;
}

/**
 * Web vital categories with strict typing
 */
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

/**
 * Web vital event with required fields
 */
export interface WebVitalEvent {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

/**
 * Component render event types
 */
export type RenderEventType = 'mount' | 'update' | 'unmount' | 'interaction';

/**
 * Component render metrics with strict typing
 */
export interface RenderMetrics {
  componentName: string;
  renderTime: number;
  eventType: RenderEventType;
  timestamp: number;
}

/**
 * Performance event types
 */
export type PerformanceEventType = RenderEventType | 'web-vital' | 'error';

/**
 * Web vital metric types
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'visual_stability';
  timestamp: number;
}

/**
 * Device information for performance context
 */
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'low' | 'medium' | 'high';
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
