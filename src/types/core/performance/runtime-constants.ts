
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
  GlassmorphicVariant
} from './constants';

/**
 * Runtime values for performance settings quality levels
 */
export const QualityLevels = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  ULTRA: 'ultra' as const
};

/**
 * Runtime values for glassmorphic variants
 */
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  SUBTLE: 'subtle' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant,
  PURPLE: 'purple' as GlassmorphicVariant
};

/**
 * Runtime values for device capabilities
 */
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

/**
 * Runtime values for performance modes
 */
export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
};

/**
 * Runtime values for render frequencies
 */
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency
};
