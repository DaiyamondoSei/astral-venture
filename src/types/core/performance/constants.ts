
/**
 * Core performance constants
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance mode options
export type PerformanceMode = 'quality' | 'balanced' | 'performance' | 'auto';

// Render frequency classification
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Quality level settings
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Glassmorphic variant options
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'medium' | 'cosmic' | 'purple';

// Create runtime constants for types that need to be used as values
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode
};

export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
};

export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant,
  MEDIUM: 'medium' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant
};

// Glow intensity levels
export enum GlowIntensity {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  ULTRA = 4
}

// Cube size options
export enum CubeSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl'
}

// Cube theme options
export enum CubeTheme {
  DEFAULT = 'default',
  COSMIC = 'cosmic',
  ETHEREAL = 'ethereal',
  QUANTUM = 'quantum',
  SACRED = 'sacred',
  ASTRAL = 'astral'
}
