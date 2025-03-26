
/**
 * Performance-related constant values
 * 
 * Following the type-value pattern, this file contains runtime constants
 * that correspond to the types defined in the performance types.
 */

// Device capability levels
export const DeviceCapabilities = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const
} as const;

export type DeviceCapability = typeof DeviceCapabilities[keyof typeof DeviceCapabilities];

// Performance modes
export const PerformanceModes = {
  QUALITY: 'quality' as const,
  BALANCED: 'balanced' as const,
  PERFORMANCE: 'performance' as const
} as const;

export type PerformanceMode = typeof PerformanceModes[keyof typeof PerformanceModes];

// Render frequencies
export const RenderFrequencies = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  EXCESSIVE: 'excessive' as const
} as const;

export type RenderFrequency = typeof RenderFrequencies[keyof typeof RenderFrequencies];

// Quality levels
export const QualityLevels = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const
} as const;

export type QualityLevel = typeof QualityLevels[keyof typeof QualityLevels];

// Glassmorphic variants
export const GlassmorphicVariants = {
  DEFAULT: 'default' as const,
  QUANTUM: 'quantum' as const,
  ETHEREAL: 'ethereal' as const,
  ELEVATED: 'elevated' as const,
  COSMIC: 'cosmic' as const
} as const;

export type GlassmorphicVariant = typeof GlassmorphicVariants[keyof typeof GlassmorphicVariants];

// Glow intensity levels
export const GlowIntensities = {
  NONE: 'none' as const,
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const
} as const;

export type GlowIntensity = typeof GlowIntensities[keyof typeof GlowIntensities];

// Cube themes
export const CubeThemes = {
  DEFAULT: 'default' as const,
  COSMIC: 'cosmic' as const,
  ETHEREAL: 'ethereal' as const,
  SACRED: 'sacred' as const
} as const;

export type CubeTheme = typeof CubeThemes[keyof typeof CubeThemes];

// Cube sizes
export const CubeSizes = {
  SM: 'sm' as const,
  MD: 'md' as const,
  LG: 'lg' as const,
  XL: 'xl' as const,
  FULL: 'full' as const
} as const;

export type CubeSize = typeof CubeSizes[keyof typeof CubeSizes];
