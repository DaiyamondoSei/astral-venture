
/**
 * Performance system constants
 * Following the Type-Value Pattern for type safety
 */
import { 
  DeviceCapability, 
  PerformanceMode, 
  QualityLevel, 
  RenderFrequency,
  ResourceOptimizationLevel,
  GlassmorphicVariant,
  RenderingEngine,
  GlowIntensity,
  CubeTheme,
  CubeSize
} from './types';

// Device capability constants
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability,
  CORE: 'core' as DeviceCapability
};

// Performance mode constants
export const PerformanceModes = {
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
};

// Quality level constants
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

// Render frequency constants
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  ADAPTIVE: 'adaptive' as RenderFrequency
};

// Resource optimization level constants
export const ResourceOptimizationLevels = {
  NONE: 'none' as ResourceOptimizationLevel,
  CONSERVATIVE: 'conservative' as ResourceOptimizationLevel,
  AGGRESSIVE: 'aggressive' as ResourceOptimizationLevel
};

// Glassmorphic variant constants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant
};

// Rendering engine constants
export const RenderingEngines = {
  CANVAS: 'canvas' as RenderingEngine,
  SVG: 'svg' as RenderingEngine,
  WEBGL: 'webgl' as RenderingEngine
};

// Glow intensity constants
export const GlowIntensities = {
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
};

// Cube theme constants
export const CubeThemes = {
  COSMIC: 'cosmic' as CubeTheme,
  ENERGETIC: 'energetic' as CubeTheme,
  ETHERIC: 'etheric' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme
};

// Cube size constants
export const CubeSizes = {
  SMALL: 'small' as CubeSize,
  MEDIUM: 'medium' as CubeSize,
  LARGE: 'large' as CubeSize
};
