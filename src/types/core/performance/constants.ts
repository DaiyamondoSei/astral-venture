
/**
 * Runtime constants for performance types
 * 
 * This module defines constants that correspond to the types in types.ts,
 * following the Type-Value Pattern for TypeScript.
 */

import { 
  DeviceCapability, 
  PerformanceMode, 
  QualityLevel, 
  ResourceOptimizationLevel,
  RenderFrequency,
  RenderSetting,
  AnimationComplexity,
  RenderingEngine,
  GlassmorphicVariant,
  GlowIntensity,
  CubeTheme,
  CubeSize
} from './types';

// Device capability constants
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability,
  CORE: 'core' as DeviceCapability
} as const;

// Performance mode constants
export const PerformanceModes = {
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
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

// Render frequency constants
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  ADAPTIVE: 'adaptive' as RenderFrequency
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
  NONE: 'none' as AnimationComplexity,
  MINIMAL: 'minimal' as AnimationComplexity,
  STANDARD: 'standard' as AnimationComplexity,
  ENHANCED: 'enhanced' as AnimationComplexity
} as const;

// Rendering engine constants
export const RenderingEngines = {
  CANVAS: 'canvas' as RenderingEngine,
  WEBGL: 'webgl' as RenderingEngine,
  SVG: 'svg' as RenderingEngine,
  CSS: 'css' as RenderingEngine,
  HTML: 'html' as RenderingEngine
} as const;

// Glassmorphic variant constants
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

// Glow intensity constants
export const GlowIntensities = {
  NONE: 'none' as GlowIntensity,
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
} as const;

// Cube theme constants
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  CHAKRA: 'chakra' as CubeTheme,
  ENERGY: 'energy' as CubeTheme,
  SPIRITUAL: 'spiritual' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme
} as const;

// Cube size constants
export const CubeSizes = {
  XS: 'xs' as CubeSize,
  SM: 'sm' as CubeSize,
  MD: 'md' as CubeSize,
  LG: 'lg' as CubeSize,
  XL: 'xl' as CubeSize,
  FULL: 'full' as CubeSize
} as const;
