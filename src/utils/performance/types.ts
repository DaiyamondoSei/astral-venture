
/**
 * Shared type definitions for the performance monitoring system.
 * 
 * This centralizes all performance-related types to ensure consistency
 * across the application.
 */

/**
 * Options for performance tracking
 */
export interface PerformanceTrackingOptions {
  /**
   * Whether to automatically start monitoring when the component mounts
   */
  autoStart?: boolean;
  
  /**
   * Whether to log slow renders to the console
   */
  logSlowRenders?: boolean;
  
  /**
   * Threshold in milliseconds for what constitutes a "slow" render
   * Default: 16ms (roughly one frame at 60fps)
   */
  slowRenderThreshold?: number;
  
  /**
   * Additional metadata to include with performance records
   */
  metadata?: Record<string, unknown>;
}

/**
 * Structure of a component performance metric
 */
export interface ComponentMetric {
  /**
   * Time taken to render in milliseconds
   */
  renderTime: number;
  
  /**
   * Timestamp when this measurement was taken
   */
  timestamp: number;
  
  /**
   * Category of the performance event
   */
  type: 'render' | 'interaction' | 'load';
  
  /**
   * Additional context about this measurement
   */
  metadata?: Record<string, unknown>;
}

/**
 * Collection of metrics for a specific component
 */
export interface ComponentMetrics {
  /**
   * Name of the component
   */
  componentName: string;
  
  /**
   * List of render time measurements
   */
  metrics: ComponentMetric[];
  
  /**
   * Average render time (computed)
   */
  averageRenderTime: number;
  
  /**
   * Total number of renders
   */
  renderCount: number;
  
  /**
   * Number of renders that exceeded the slow threshold
   */
  slowRenderCount: number;
  
  /**
   * Last render timestamp
   */
  lastRenderTimestamp: number;
}

/**
 * Database-compatible performance metric format
 */
export interface PerformanceMetric {
  component_name: string;
  average_render_time: number;
  total_renders: number;
  slow_renders: number;
  last_render: string;
  created_at?: string;
}
