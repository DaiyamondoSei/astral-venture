
/**
 * Performance Constants
 * 
 * Constants for the performance monitoring system using the Type-Value pattern
 */

import { 
  DeviceCapability, 
  PerformanceMode,
  RenderFrequency,
  QualityLevel,
  CubeTheme,
  CubeSize,
  GlowIntensity,
  GlassmorphicVariant,
  ResourceOptimizationLevel,
  RenderSetting,
  AnimationComplexity,
  RenderingEngine
} from './types';

// Device capability constants
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability,
  ULTRA: 'ultra' as DeviceCapability
} as const;

// Performance mode constants
export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
} as const;

// Render frequency constants
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
} as const;

// Quality level constants
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
} as const;

// Cube theme constants
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme
} as const;

// Cube size constants
export const CubeSizes = {
  SM: 'sm' as CubeSize,
  MD: 'md' as CubeSize,
  LG: 'lg' as CubeSize,
  XL: 'xl' as CubeSize,
  FULL: 'full' as CubeSize
} as const;

// Glow intensity constants
export const GlowIntensities = {
  NONE: 'none' as GlowIntensity,
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
} as const;

// Glassmorphic variant constants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant,
  MEDIUM: 'medium' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant
} as const;

// Resource optimization levels
export const ResourceOptimizationLevels = {
  NONE: 'none' as ResourceOptimizationLevel,
  CONSERVATIVE: 'conservative' as ResourceOptimizationLevel,
  AGGRESSIVE: 'aggressive' as ResourceOptimizationLevel
} as const;

// Render settings
export const RenderSettings = {
  AUTO: 'auto' as RenderSetting,
  FIXED: 'fixed' as RenderSetting,
  ADAPTIVE: 'adaptive' as RenderSetting
} as const;

// Animation complexity
export const AnimationComplexities = {
  MINIMAL: 'minimal' as AnimationComplexity,
  REDUCED: 'reduced' as AnimationComplexity,
  NORMAL: 'normal' as AnimationComplexity,
  ENHANCED: 'enhanced' as AnimationComplexity
} as const;

// Rendering engines
export const RenderingEngines = {
  CANVAS: 'canvas' as RenderingEngine,
  SVG: 'svg' as RenderingEngine,
  WEBGL: 'webgl' as RenderingEngine,
  AUTO: 'auto' as RenderingEngine
} as const;

// Default performance configuration
export const DEFAULT_PERF_CONFIG: PerfConfig = {
  deviceCapability: DeviceCapabilities.MEDIUM,
  useManualCapability: false,
  disableAnimations: false,
  disableEffects: false,
  
  samplingRate: 5,
  throttleInterval: 500,
  maxTrackedComponents: 50,
  
  enableValidation: true,
  enableRenderTracking: true,
  enablePerformanceTracking: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  intelligentProfiling: true,
  inactiveTabThrottling: true,
  batchUpdates: true,
  
  renderQuality: QualityLevels.MEDIUM,
  resourceOptimizationLevel: ResourceOptimizationLevels.CONSERVATIVE,
  
  metricsPersistence: false
};

// Performance boundaries for different device capabilities
export const PERFORMANCE_BOUNDARIES = {
  fps: {
    low: 30,
    medium: 45,
    high: 60
  },
  memory: {
    low: 50,
    medium: 75,
    high: 100
  },
  renderTime: {
    low: 16,  // ~60fps
    medium: 8, // ~120fps
    high: 4    // ~240fps
  }
};
