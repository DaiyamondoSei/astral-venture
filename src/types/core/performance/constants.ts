
/**
 * Type definitions for performance-related constants
 * 
 * These types are paired with runtime constants following the Type-Value Pattern
 * to prevent errors where types are used as values.
 */

/**
 * Device capability levels
 * Used to indicate the processing power of the current device
 */
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

/**
 * Performance mode options
 * Controls the balance between quality and performance
 */
export type PerformanceMode = 'battery-saving' | 'balanced' | 'high-performance';

/**
 * Render frequency settings
 * Controls how often components are updated
 */
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive';

/**
 * Quality level settings
 * Controls the visual fidelity of the application
 */
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Glassmorphic UI variants
 * Different style options for glass-like UI elements
 */
export type GlassmorphicVariant = 
  | 'default'
  | 'quantum'
  | 'ethereal' 
  | 'elevated'
  | 'subtle'
  | 'cosmic'
  | 'purple'
  | 'medium';
