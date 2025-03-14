
/**
 * This file contains runtime values that correspond to TypeScript types.
 * These can be used in runtime code where type information is not available.
 */

// DeviceCapability
export type DeviceCapability = 'high-performance' | 'standard-performance' | 'low-performance';

export const DeviceCapabilities = {
  HIGH: 'high-performance' as DeviceCapability,
  STANDARD: 'standard-performance' as DeviceCapability,
  LOW: 'low-performance' as DeviceCapability,
};

// PerformanceMode
export type PerformanceMode = 'high' | 'balanced' | 'low';

export const PerformanceModes = {
  HIGH: 'high' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  LOW: 'low' as PerformanceMode,
};

// RenderFrequency
export type RenderFrequency = 'high' | 'normal' | 'low' | 'excessive';

export const RenderFrequencies = {
  HIGH: 'high' as RenderFrequency,
  NORMAL: 'normal' as RenderFrequency,
  LOW: 'low' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency,
};

// GlassmorphicVariant
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'cosmic' | 'medium' | 'purple';

export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  MEDIUM: 'medium' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant,
};

// Helper function to validate runtime values against their types
export function validateValueAgainstType<T extends string>(
  value: string,
  validValues: readonly T[]
): T {
  if (!validValues.includes(value as T)) {
    throw new Error(`Invalid value: ${value}. Valid values are: ${validValues.join(', ')}`);
  }
  return value as T;
}

// Factory functions for creating type-safe values
export function createDeviceCapability(value: string): DeviceCapability {
  return validateValueAgainstType(value, [
    DeviceCapabilities.HIGH,
    DeviceCapabilities.STANDARD,
    DeviceCapabilities.LOW
  ]);
}

export function createPerformanceMode(value: string): PerformanceMode {
  return validateValueAgainstType(value, [
    PerformanceModes.HIGH,
    PerformanceModes.BALANCED,
    PerformanceModes.LOW
  ]);
}

export function createRenderFrequency(value: string): RenderFrequency {
  return validateValueAgainstType(value, [
    RenderFrequencies.HIGH,
    RenderFrequencies.NORMAL,
    RenderFrequencies.LOW,
    RenderFrequencies.EXCESSIVE
  ]);
}

export function createGlassmorphicVariant(value: string): GlassmorphicVariant {
  return validateValueAgainstType(value, [
    GlassmorphicVariants.DEFAULT,
    GlassmorphicVariants.QUANTUM,
    GlassmorphicVariants.ETHEREAL,
    GlassmorphicVariants.ELEVATED,
    GlassmorphicVariants.SUBTLE,
    GlassmorphicVariants.COSMIC,
    GlassmorphicVariants.MEDIUM,
    GlassmorphicVariants.PURPLE
  ]);
}
