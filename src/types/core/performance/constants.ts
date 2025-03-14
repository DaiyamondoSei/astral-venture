
/**
 * Performance capability constants with both type and runtime value support
 */

// Device capability for performance
export type DeviceCapability = 'low' | 'medium' | 'high';

// Runtime values to use when referring to DeviceCapability
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Performance mode type and values
export type PerformanceMode = 'auto' | DeviceCapability;

// Runtime values for PerformanceMode
export const PerformanceModes = {
  AUTO: 'auto' as 'auto',
  LOW: DeviceCapabilities.LOW,
  MEDIUM: DeviceCapabilities.MEDIUM,
  HIGH: DeviceCapabilities.HIGH
};

// Render frequency type and values
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Runtime values for RenderFrequency
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
};

// Quality level type and values
export type QualityLevel = 'low' | 'medium' | 'high';

// Runtime values for QualityLevel
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel
};

// Glassmorphic variant type and values
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'medium' | 'cosmic' | 'purple';

// Runtime values for GlassmorphicVariant
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

// Cube theme type and values
export type CubeTheme = 'default' | 'ethereal' | 'cosmic' | 'minimal';

// Runtime values for CubeTheme
export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  COSMIC: 'cosmic' as CubeTheme,
  MINIMAL: 'minimal' as CubeTheme
};

// Cube size type and values
export type CubeSize = 'small' | 'medium' | 'large' | 'full';

// Runtime values for CubeSize
export const CubeSizes = {
  SMALL: 'small' as CubeSize,
  MEDIUM: 'medium' as CubeSize,
  LARGE: 'large' as CubeSize,
  FULL: 'full' as CubeSize
};

// Glow intensity type and values
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

// Runtime values for GlowIntensity
export const GlowIntensities = {
  NONE: 'none' as GlowIntensity,
  LOW: 'low' as GlowIntensity,
  MEDIUM: 'medium' as GlowIntensity,
  HIGH: 'high' as GlowIntensity
};
