
/**
 * Runtime constants for performance-related types
 * 
 * This module provides runtime values corresponding to the types defined in 
 * types/core/performance/constants.ts, following the Type-Value Pattern.
 */

import { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency,
  GlassmorphicVariant,
  QualityLevel
} from './constants';

/**
 * Runtime values for performance settings quality levels
 */
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

/**
 * Runtime values for device capabilities
 */
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability,
  MEDIUM: 'mid-range' as DeviceCapability, // Alias for consistent naming
  LOW: 'low-end' as DeviceCapability,      // Alias for consistent naming
  HIGH: 'high-end' as DeviceCapability     // Alias for consistent naming
};

/**
 * Runtime values for performance modes
 */
export const PerformanceModes = {
  BATTERY_SAVING: 'battery-saving' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  HIGH_PERFORMANCE: 'high-performance' as PerformanceMode,
  // Aliases for backward compatibility
  QUALITY: 'battery-saving' as PerformanceMode,
  PERFORMANCE: 'high-performance' as PerformanceMode
};

/**
 * Runtime values for render frequencies
 */
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  ADAPTIVE: 'adaptive' as RenderFrequency
};

/**
 * Runtime values for glassmorphic variants
 * 
 * Note: These must match the type definition in constants.ts
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
