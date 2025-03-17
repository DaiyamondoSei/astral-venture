
/**
 * Performance Constants
 * 
 * This module provides runtime constants for performance configuration.
 * These are paired with the types in types.ts following the Type-Value pattern.
 */

// Device capability levels
export const DeviceCapabilities = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CORE: 'core' as const
};

// Performance optimization modes
export const PerformanceModes = {
  BALANCED: 'balanced' as const,
  PERFORMANCE: 'performance' as const,
  QUALITY: 'quality' as const
};

// Visual quality levels
export const QualityLevels = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const
};

// Resource optimization levels
export const ResourceOptimizationLevels = {
  NONE: 'none' as const,
  CONSERVATIVE: 'conservative' as const,
  AGGRESSIVE: 'aggressive' as const
};

// Render frequency levels
export const RenderFrequencies = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ADAPTIVE: 'adaptive' as const
};

// Render setting levels
export const RenderSettings = {
  AUTO: 'auto' as const,
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const
};

// Animation complexity levels
export const AnimationComplexities = {
  NONE: 'none' as const,
  MINIMAL: 'minimal' as const,
  STANDARD: 'standard' as const,
  ENHANCED: 'enhanced' as const
};

// Rendering engine types
export const RenderingEngines = {
  CANVAS: 'canvas' as const,
  WEBGL: 'webgl' as const,
  SVG: 'svg' as const,
  CSS: 'css' as const,
  HTML: 'html' as const
};

// Glassmorphic variant types
export const GlassmorphicVariants = {
  DEFAULT: 'default' as const,
  SUBTLE: 'subtle' as const,
  MEDIUM: 'medium' as const,
  ELEVATED: 'elevated' as const,
  ETHEREAL: 'ethereal' as const,
  COSMIC: 'cosmic' as const,
  PURPLE: 'purple' as const,
  QUANTUM: 'quantum' as const
};

// Glow intensity levels
export const GlowIntensities = {
  NONE: 'none' as const,
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const
};

// Cube theme types
export const CubeThemes = {
  DEFAULT: 'default' as const,
  COSMIC: 'cosmic' as const,
  ETHEREAL: 'ethereal' as const,
  CHAKRA: 'chakra' as const,
  ENERGY: 'energy' as const,
  SPIRITUAL: 'spiritual' as const,
  QUANTUM: 'quantum' as const
};

// Cube size options
export const CubeSizes = {
  XS: 'xs' as const,
  SM: 'sm' as const,
  MD: 'md' as const,
  LG: 'lg' as const,
  XL: 'xl' as const,
  FULL: 'full' as const
};

// Default performance configurations for different device capabilities
export const DEFAULT_PERF_CONFIGS = {
  low: {
    deviceCapability: DeviceCapabilities.LOW,
    useManualCapability: false,
    disableAnimations: true,
    disableEffects: true,
    disableBlur: true,
    disableShadows: true,
    samplingRate: 2000,
    throttleInterval: 1000,
    maxTrackedComponents: 10,
    resourceOptimizationLevel: ResourceOptimizationLevels.AGGRESSIVE,
    metricsPersistence: false,
    enablePerformanceTracking: false,
    enableRenderTracking: false,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    intelligentProfiling: false,
    inactiveTabThrottling: true,
    batchUpdates: true,
    slowRenderThreshold: 16
  },
  medium: {
    deviceCapability: DeviceCapabilities.MEDIUM,
    useManualCapability: false,
    disableAnimations: false,
    disableEffects: false,
    disableBlur: false,
    disableShadows: false,
    samplingRate: 1000,
    throttleInterval: 500,
    maxTrackedComponents: 25,
    resourceOptimizationLevel: ResourceOptimizationLevels.CONSERVATIVE,
    metricsPersistence: true,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: false,
    enablePropTracking: false,
    enableDebugLogging: false,
    intelligentProfiling: true,
    inactiveTabThrottling: true,
    batchUpdates: true,
    slowRenderThreshold: 8
  },
  high: {
    deviceCapability: DeviceCapabilities.HIGH,
    useManualCapability: false,
    disableAnimations: false,
    disableEffects: false,
    disableBlur: false,
    disableShadows: false,
    samplingRate: 500,
    throttleInterval: 100,
    maxTrackedComponents: 50,
    resourceOptimizationLevel: ResourceOptimizationLevels.NONE,
    metricsPersistence: true,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    intelligentProfiling: true,
    inactiveTabThrottling: false,
    batchUpdates: true,
    slowRenderThreshold: 5
  }
};

// Default quality levels for different device capabilities
export const DEFAULT_QUALITY_LEVELS = {
  low: QualityLevels.LOW,
  medium: QualityLevels.MEDIUM,
  high: QualityLevels.HIGH
};

// Performance boundaries for monitoring
export const DEFAULT_PERFORMANCE_BOUNDARIES = {
  lowFpsThreshold: 30,
  mediumFpsThreshold: 45,
  highFpsThreshold: 55,
  excessiveRenderTimeMs: 16,
  highMemoryUsageMb: 100
};

// Default monitor configuration
export const DEFAULT_MONITOR_CONFIG = {
  samplingInterval: 1000,
  metricsBufferSize: 100,
  autoStart: true,
  trackComponents: true,
  trackInteractions: true,
  trackWebVitals: true,
  logWarnings: true,
  captureElementMetrics: true,
  adaptiveMode: true,
  throttleUpdates: true
};
