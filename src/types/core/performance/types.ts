
/**
 * Performance system type definitions
 * Following the Type-Value Pattern for type safety
 */

// Device capability levels
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end' | 'core';

// Performance optimization modes
export type PerformanceMode = 'balanced' | 'performance' | 'quality';

// Visual quality levels
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Render frequency settings
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive';

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Glassmorphic variants
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'cosmic';

// Rendering engine options
export type RenderingEngine = 'canvas' | 'svg' | 'webgl';

// Glow intensity levels
export type GlowIntensity = 'low' | 'medium' | 'high';

// Cube theme variants
export type CubeTheme = 'cosmic' | 'energetic' | 'etheric' | 'quantum';

// Cube size options
export type CubeSize = 'small' | 'medium' | 'large';

// Performance configuration interface
export interface PerfConfig {
  // Capability settings
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  
  // Visual settings
  disableAnimations: boolean;
  disableEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  
  // Performance settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enablePerformanceTracking: boolean;
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Advanced settings
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  resourceOptimizationLevel: ResourceOptimizationLevel;
  metricsPersistence: boolean;
}

// Performance metrics interfaces
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  reRenderCount: number;
}

export interface WebVitalMetric {
  metric_name: string;
  category: 'loading' | 'interaction' | 'visual_stability';
  value: number;
  type: 'web-vital';
  timestamp: number;
}

export interface PerformanceMetric {
  metric_name: string;
  category: string;
  value: number;
  type: 'performance' | 'resource' | 'component';
  timestamp?: number;
}

export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
}

// Web vital types
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';
export type MetricType = 'performance' | 'resource' | 'component' | 'web-vital';
