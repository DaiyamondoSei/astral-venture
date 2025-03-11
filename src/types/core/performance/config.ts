
/**
 * Performance Configuration Types
 * 
 * This module defines configuration types for the performance monitoring and
 * optimization system.
 * 
 * @category Performance
 * @version 1.0.0
 */

import { QualityLevel } from './metrics';

/**
 * Performance settings based on device capability
 */
export interface PerformanceSettings {
  targetFPS: number;
  qualityLevel: QualityLevel;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  particleCount: number;
  maxAnimationsPerFrame: number;
  optimizationEnabled?: boolean;
  adaptiveQuality?: boolean;
  simplifiedForLowEnd?: boolean;
  id?: string;
}

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  slowRenderThreshold: number;
  samplingRate: number;
  debugMode?: boolean;
  reportingEndpoint?: string;
  logSlowRenders?: boolean;
  
  // Advanced configuration
  optimizationLevel?: 'auto' | 'low' | 'medium' | 'high';
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enablePerformanceTracking?: boolean;
  enableRenderTracking?: boolean;
  enableValidation?: boolean;
  enablePropTracking?: boolean;
  enableDebugLogging?: boolean;
  enableAdaptiveRendering?: boolean;
  enableDetailedLogging?: boolean;
  enableMemoryMonitoring?: boolean;
  trackComponentSize?: boolean;
  
  // Advanced features
  intelligentProfiling?: boolean;
  inactiveTabThrottling?: boolean;
  batchUpdates?: boolean;
  id?: string;
}

/**
 * Adaptive rendering settings
 */
export interface AdaptiveSettings {
  qualityLevel: QualityLevel;
  targetFPS: number;
  particleCount: number;
  maxAnimationsPerFrame: number;
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  virtualization?: boolean;
  id?: string;
}

/**
 * Performance boundaries for different capability levels
 */
export interface PerformanceBoundaries {
  lowFPS: number;
  mediumFPS: number;
  highFPS: number;
  criticalMemory: number;
  highMemory: number;
  mediumMemory: number;
  id?: string;
}

/**
 * Performance tracking options for hooks and components
 */
export interface PerformanceTrackingOptions {
  enabled?: boolean;
  componentName?: string;
  trackProps?: boolean;
  trackRenders?: boolean;
  trackEffects?: boolean;
  trackMounts?: boolean;
  debugMode?: boolean;
  samplingRate?: number;
  slowRenderThreshold?: number;
  logSlowRenders?: boolean;
  reportMetrics?: boolean;
  id?: string;
}

/**
 * Combined performance configuration
 */
export interface PerfConfig {
  deviceCapability: string;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  slowRenderThreshold: number;
  metricsEnabled: boolean;
  optimizationLevel: 'none' | 'conservative' | 'aggressive';
  debugLogging: boolean;
  resourceOptimizationLevel: string;
  metricsReportingRate: number;
  enableValidation: boolean;
  metricsPersistence: boolean;
}

/**
 * Performance visualization system config
 */
export interface VisualizationSystem {
  performanceSettings: PerformanceSettings;
  renderingEngine: 'canvas' | 'webgl' | 'svg' | 'dom';
  animations: {
    enabled: boolean;
    complexity: 'low' | 'medium' | 'high';
    frameRate: number;
  };
  visualStates: {
    active: boolean;
    transitioning: boolean;
    lastUpdated: number;
    transitionProgress?: number;
  };
  effects: {
    primary: {
      enabled: boolean;
      intensity: number;
    };
    secondary: {
      enabled: boolean;
      intensity: number;
    };
    background: {
      enabled: boolean;
      intensity: number;
    };
    particles: {
      count: number;
      size: number;
      speed: number;
      enabled?: boolean;
    };
    glow: {
      enabled: boolean;
      radius: number;
      intensity: number;
    };
  };
}
