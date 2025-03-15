
/**
 * Runtime constants for performance types
 * 
 * This module provides runtime constants that correspond to the types defined
 * in the constants.ts file, following the Type-Value Pattern.
 */

import { 
  DeviceCapability, 
  PerformanceMode,
  RenderFrequency,
  QualityLevel,
  ResourceOptimizationLevel,
  RenderSetting,
  AnimationComplexity,
  RenderingEngine,
  GlassmorphicVariant,
  GlowIntensity,
  CubeTheme,
  CubeSize
} from './constants';

// Device capability runtime constants
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability,
  CORE: 'core' as DeviceCapability
} as const;

// Performance mode runtime constants
export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
} as const;

// Rendering frequency runtime constants
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
} as const;

// Quality level runtime constants
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
} as const;

// Resource optimization level runtime constants
export const ResourceOptimizationLevels = {
  NONE: 'none' as ResourceOptimizationLevel,
  CONSERVATIVE: 'conservative' as ResourceOptimizationLevel,
  AGGRESSIVE: 'aggressive' as ResourceOptimizationLevel
} as const;

// Render setting runtime constants
export const RenderSettings = {
  AUTO: 'auto' as RenderSetting,
  LOW: 'low' as RenderSetting,
  MEDIUM: 'medium' as RenderSetting,
  HIGH: 'high' as RenderSetting
} as const;

// Animation complexity runtime constants
export const AnimationComplexities = {
  NONE: 'none' as AnimationComplexity,
  MINIMAL: 'minimal' as AnimationComplexity,
  STANDARD: 'standard' as AnimationComplexity,
  ENHANCED: 'enhanced' as AnimationComplexity
} as const;

// Rendering engine runtime constants
export const RenderingEngines = {
  CANVAS: 'canvas' as RenderingEngine,
  WEBGL: 'webgl' as RenderingEngine,
  SVG: 'svg' as RenderingEngine,
  CSS: 'css' as RenderingEngine,
  HTML: 'html' as RenderingEngine
} as const;

// Glassmorphic variant runtime constants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant,
  MEDIUM: 'medium' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant
} as const;

// Glow intensity runtime constants
export const GlowIntensities = {
  NONE: 'none' as GlowIntensity,
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
} as const;

// Cube theme runtime constants
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  CHAKRA: 'chakra' as CubeTheme,
  ENERGY: 'energy' as CubeTheme,
  SPIRITUAL: 'spiritual' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme
} as const;

// Cube size runtime constants
export const CubeSizes = {
  XS: 'xs' as CubeSize,
  SM: 'sm' as CubeSize,
  MD: 'md' as CubeSize,
  LG: 'lg' as CubeSize,
  XL: 'xl' as CubeSize,
  FULL: 'full' as CubeSize
} as const;

// Default PerfConfig
export const DEFAULT_PERF_CONFIG = {
  // Feature toggles
  enablePerformanceTracking: true,
  enableRenderTracking: true,
  enableValidation: false,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  // Optimization strategies
  intelligentProfiling: true,
  inactiveTabThrottling: true,
  batchUpdates: true,
  
  // Performance metrics
  samplingRate: 0.5,
  throttleInterval: 100,
  maxTrackedComponents: 50
};
