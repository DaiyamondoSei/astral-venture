
/**
 * Performance constants types
 * 
 * This module provides type definitions for performance-related constants
 * following the Type-Value Pattern.
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high' | 'core';

// Performance modes
export type PerformanceMode = 'battery' | 'balanced' | 'performance' | 'auto' | 'quality';

// Rendering frequency levels
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Visual quality levels
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Render settings
export type RenderSetting = 'auto' | 'low' | 'medium' | 'high';

// Animation complexity
export type AnimationComplexity = 'none' | 'minimal' | 'standard' | 'enhanced';

// Rendering engine types
export type RenderingEngine = 'canvas' | 'webgl' | 'svg' | 'css' | 'html';

// Glassmorphic UI variants
export type GlassmorphicVariant = 'default' | 'subtle' | 'medium' | 'elevated' | 'ethereal' | 'cosmic' | 'purple' | 'quantum';

// Glow intensity levels
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

// Cube theme types (for metatrons cube)
export type CubeTheme = 'default' | 'cosmic' | 'ethereal' | 'chakra' | 'energy' | 'spiritual' | 'quantum';

// Cube size types
export type CubeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Performance config interface for consistent use across components
export interface PerfConfig {
  // Feature toggles
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Optimization strategies
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  
  // Performance metrics
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
}
