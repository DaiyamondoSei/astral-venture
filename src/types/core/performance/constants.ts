
/**
 * Performance-related type definitions
 */

/**
 * Device capability classification
 */
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

/**
 * Performance mode options
 */
export type PerformanceMode = 'battery-saving' | 'balanced' | 'high-performance';

/**
 * Render frequency options
 */
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive';

/**
 * Glassmorphic variant options
 * 
 * Note: When adding new variants, be sure to update GlassmorphicVariants in runtime-constants.ts as well
 */
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'cosmic' | 'purple' | 'medium';

/**
 * Runtime constants for DeviceCapability
 * This pattern resolves the common TypeScript error:
 * "X only refers to a type, but is being used as a value here"
 */
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
};

/**
 * Runtime constants for PerformanceMode
 */
export const PerformanceModes = {
  BATTERY_SAVING: 'battery-saving' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  HIGH_PERFORMANCE: 'high-performance' as PerformanceMode
};

/**
 * Runtime constants for RenderFrequency
 */
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  ADAPTIVE: 'adaptive' as RenderFrequency
};

/**
 * Runtime constants for GlassmorphicVariant
 */
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant,
  MEDIUM: 'medium' as GlassmorphicVariant
};
