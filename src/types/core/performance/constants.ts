
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
