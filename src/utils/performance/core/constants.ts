
/**
 * Performance Monitoring Constants
 * 
 * Default values and configuration settings for the performance monitoring system.
 */
import { QualityLevel, PerformanceBoundaries, PerformanceMonitorConfig } from './types';

// Default quality levels
export const DEFAULT_QUALITY_LEVELS: QualityLevel[] = [
  {
    level: 1,
    name: 'Low',
    description: 'Minimal visual effects, optimized for low-end devices',
    particleCount: 50,
    effectsEnabled: false,
    animationComplexity: 1,
    geometryDetail: 1,
    textureResolution: 1
  },
  {
    level: 2,
    name: 'Medium',
    description: 'Balanced visual effects, suitable for most devices',
    particleCount: 200,
    effectsEnabled: true,
    animationComplexity: 2,
    geometryDetail: 2,
    textureResolution: 2
  },
  {
    level: 3,
    name: 'High',
    description: 'Enhanced visual effects with moderate complexity',
    particleCount: 500,
    effectsEnabled: true,
    animationComplexity: 3,
    geometryDetail: 3,
    textureResolution: 3
  },
  {
    level: 4,
    name: 'Ultra',
    description: 'Maximum visual quality with full effects',
    particleCount: 1000,
    effectsEnabled: true,
    animationComplexity: 4,
    geometryDetail: 4,
    textureResolution: 4
  },
  {
    level: 5,
    name: 'Extreme',
    description: 'Exceptional visual quality for high-end devices',
    particleCount: 2000,
    effectsEnabled: true,
    animationComplexity: 5,
    geometryDetail: 5,
    textureResolution: 5
  }
];

// Default performance boundaries
export const DEFAULT_PERFORMANCE_BOUNDARIES: PerformanceBoundaries = {
  lowFPS: 30,
  mediumFPS: 45,
  highFPS: 60,
  criticalMemory: 500 * 1024 * 1024, // 500MB
  highMemory: 350 * 1024 * 1024, // 350MB
  mediumMemory: 200 * 1024 * 1024 // 200MB
};

// Default monitor configuration
export const DEFAULT_MONITOR_CONFIG: PerformanceMonitorConfig = {
  enabled: true,
  metricsEnabled: true,
  slowRenderThreshold: 16, // 60fps threshold
  samplingRate: 0.1, // Sample 10% of metrics by default
  debugMode: false,
  
  // Extended configuration with defaults
  optimizationLevel: 'auto',
  throttleInterval: 1000,
  maxTrackedComponents: 100,
  
  // Feature flags
  enablePerformanceTracking: true,
  enableRenderTracking: true,
  enableValidation: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  // Advanced features
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true
};
