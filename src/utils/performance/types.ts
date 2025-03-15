
/**
 * Performance metrics types
 * 
 * This module contains type definitions related to performance measurement
 * following the Type-Value Pattern.
 */

// Import core types from the constants file
import { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency, 
  QualityLevel
} from '@/types/core/performance/constants';

/**
 * Types of performance metrics that can be measured
 */
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

/**
 * Performance metric rating levels
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Device category types
 */
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * Performance metric data structure
 */
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
  rating?: MetricRating;
}

/**
 * Component rendering performance metrics
 */
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

/**
 * Device information for performance context
 */
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: DeviceCategory;
  screenSize: {
    width: number;
    height: number;
  };
  connection?: {
    type?: string;
    speed?: number;
  };
}

/**
 * Performance settings configuration
 */
export interface PerformanceSettings {
  deviceCapability: DeviceCapability;
  performanceMode: PerformanceMode;
  renderFrequency: RenderFrequency;
  qualityLevel: QualityLevel;
  enableMonitoring: boolean;
  adaptiveRendering: boolean;
  batchUpdates: boolean;
  useLowFidelityEffects: boolean;
}
