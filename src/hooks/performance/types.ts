
/**
 * Metrics collected during performance tracking
 */
export interface PerformanceMetrics {
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  slowRenders: number;
  componentName: string;
  interactions: Record<string, {
    count: number;
    totalTime: number;
    averageTime: number;
  }>;
  markers: Record<string, number[]>;
}

/**
 * Configuration options for performance tracking
 */
export interface PerformanceTrackingOptions {
  componentName: string;
  trackInteractions?: boolean;
  slowThreshold?: number; // in milliseconds
  warnOnSlowRenders?: boolean;
  enabled?: boolean; // to easily disable in production
  autoStart?: boolean; // automatically start tracking on hook init
  logSlowRenders?: boolean; // log slow renders to console
}

/**
 * Return value of the usePerformanceTracking hook
 */
export interface PerformanceTrackingResult {
  metrics: PerformanceMetrics;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  resetMetrics: () => void;
  startInteractionTiming: (interactionName: string) => (metadata?: Record<string, unknown>) => void;
  addMarker: (markerName: string, value?: number) => void;
  performanceHistory: any[];
  captureSnapshot: () => void;
}

/**
 * Tracking state maintained in refs
 */
export interface TrackingState {
  metrics: PerformanceMetrics;
  isTracking: boolean;
  lastRenderTimestamp: number;
  interactionTimers: Record<string, number>;
  performanceHistory: any[];
}
