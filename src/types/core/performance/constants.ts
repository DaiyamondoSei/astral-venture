
import { DeviceCapability, PerformanceMode, RenderFrequency } from '@/utils/performance/core/types';

/**
 * Runtime constants for device capability
 * These provide concrete values that can be used in runtime operations
 */
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

/**
 * Runtime constants for performance mode
 */
export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode
};

/**
 * Runtime constants for render frequency
 */
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
};

/**
 * Runtime constants for quality level
 */
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

/**
 * Performance boundaries configuration for different device capabilities
 */
export const PerformanceBoundaries = {
  FPS: {
    LOW: 24,
    MEDIUM: 30,
    HIGH: 60
  },
  MEMORY: {
    LOW: 300,
    MEDIUM: 500,
    HIGH: 1000
  },
  RENDER_TIME: {
    LOW: 50,
    MEDIUM: 25,
    HIGH: 16
  }
};

/**
 * GlassmorphicVariant type for UI components
 */
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'medium' | 'cosmic' | 'purple';

/**
 * Runtime constants for GlassmorphicVariant
 */
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

/**
 * Cube size type for Metatron's Cube
 */
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Cube theme type for Metatron's Cube
 */
export type CubeTheme = 'default' | 'light' | 'dark' | 'cosmic' | 'chakra' | 'etheric';

/**
 * Glow intensity type for visual components
 */
export type GlowIntensity = 'high' | 'medium' | 'low' | 'none';

/**
 * Quality level type for performance settings
 */
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';
