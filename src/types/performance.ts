
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
 * Performance event types
 */
export type PerformanceEventType = 'render' | 'update' | 'mount' | 'unmount' | 'interaction';

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
