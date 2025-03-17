
/**
 * Performance Core Constants
 * 
 * This module provides runtime constants for performance types following the Type-Value pattern.
 */

// Device capability constants
export const DeviceCapabilities = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const,
  CORE: 'core' as const
} as const;

// Performance mode constants
export const PerformanceModes = {
  AUTO: 'auto' as const,
  BALANCED: 'balanced' as const,
  QUALITY: 'quality' as const,
  PERFORMANCE: 'performance' as const,
  BATTERY_SAVER: 'battery-saver' as const,
  ULTRA: 'ultra' as const
} as const;

// Render frequency constants
export const RenderFrequencies = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ADAPTIVE: 'adaptive' as const,
  ULTRA: 'ultra' as const
} as const;

// Quality level constants
export const QualityLevels = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const
} as const;

// Resource optimization level constants
export const ResourceOptimizationLevels = {
  NONE: 'none' as const,
  CONSERVATIVE: 'conservative' as const,
  AGGRESSIVE: 'aggressive' as const
} as const;

// Render settings constants
export const RenderSettings = {
  SIMPLE: 'simple' as const,
  STANDARD: 'standard' as const,
  ENHANCED: 'enhanced' as const,
  ULTRA: 'ultra' as const
} as const;

// Animation complexity constants
export const AnimationComplexities = {
  MINIMAL: 'minimal' as const,
  STANDARD: 'standard' as const,
  COMPLEX: 'complex' as const,
  ULTRA: 'ultra' as const
} as const;

// Rendering engine constants
export const RenderingEngines = {
  CANVAS: 'canvas' as const,
  SVG: 'svg' as const,
  WEBGL: 'webgl' as const,
  THREE_JS: 'three.js' as const,
  CSS: 'css' as const
} as const;

// Glassmorphic variant constants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as const,
  QUANTUM: 'quantum' as const,
  ETHEREAL: 'ethereal' as const,
  ELEVATED: 'elevated' as const,
  COSMIC: 'cosmic' as const
} as const;

// Glow intensity constants
export const GlowIntensities = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const
} as const;

// Cube theme constants
export const CubeThemes = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
  QUANTUM: 'quantum' as const,
  ETHEREAL: 'ethereal' as const,
  COSMIC: 'cosmic' as const
} as const;

// Cube size constants
export const CubeSizes = {
  SMALL: 'small' as const,
  MEDIUM: 'medium' as const,
  LARGE: 'large' as const
} as const;

// Performance config constants
export const PerfConfig = {
  DEFAULT_SAMPLING_RATE: 1000,
  DEFAULT_THROTTLE_INTERVAL: 300,
  DEFAULT_MAX_TRACKED_COMPONENTS: 50,
  DEFAULT_THRESHOLD_RENDER_TIME: 16
};
