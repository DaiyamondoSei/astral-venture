
/**
 * Performance Constants
 * 
 * Runtime constants for the performance system following the Type-Value Pattern
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
  CubeSize,
  PerfConfig
} from './types';

// Device capability constants
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Performance mode constants
export const PerformanceModes = {
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
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

// Resource optimization level constants
export const ResourceOptimizationLevels = {
  NONE: 'none' as ResourceOptimizationLevel,
  CONSERVATIVE: 'conservative' as ResourceOptimizationLevel,
  AGGRESSIVE: 'aggressive' as ResourceOptimizationLevel
} as const;

// Render setting constants
export const RenderSettings = {
  AUTO: 'auto' as RenderSetting,
  LOW: 'low' as RenderSetting,
  MEDIUM: 'medium' as RenderSetting,
  HIGH: 'high' as RenderSetting
} as const;

// Animation complexity constants
export const AnimationComplexities = {
  MINIMAL: 'minimal' as AnimationComplexity,
  REDUCED: 'reduced' as AnimationComplexity,
  STANDARD: 'standard' as AnimationComplexity,
  ENHANCED: 'enhanced' as AnimationComplexity
} as const;

// Rendering engine constants
export const RenderingEngines = {
  CANVAS: 'canvas' as RenderingEngine,
  SVG: 'svg' as RenderingEngine,
  WEBGL: 'webgl' as RenderingEngine,
  AUTO: 'auto' as RenderingEngine
} as const;

// Glassmorphic variant constants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant
} as const;

// Glow intensity constants
export const GlowIntensities = {
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
} as const;

// Cube theme constants
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme,
  CHAKRA: 'chakra' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme
} as const;

// Cube size constants
export const CubeSizes = {
  TINY: 'tiny' as CubeSize,
  SMALL: 'small' as CubeSize,
  MEDIUM: 'medium' as CubeSize,
  LARGE: 'large' as CubeSize,
  XLARGE: 'xlarge' as CubeSize
} as const;

// Default performance configuration
export const DEFAULT_PERF_CONFIG: PerfConfig = {
  deviceCapability: DeviceCapabilities.MEDIUM,
  useManualCapability: false,
  disableAnimations: false,
  disableEffects: false,
  
  enableAdaptiveRendering: true,
  enableProgressiveEnhancement: true,
  
  resourceOptimizationLevel: ResourceOptimizationLevels.CONSERVATIVE
};
