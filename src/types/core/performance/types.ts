
/**
 * Performance Core Types
 * 
 * This module provides type definitions for performance systems.
 */

// Device capability type (what the device is capable of)
export type DeviceCapability = 'low' | 'medium' | 'high' | 'ultra' | 'core';

// Performance mode type (how the app should perform)
export type PerformanceMode = 'auto' | 'balanced' | 'quality' | 'performance' | 'battery-saver' | 'ultra';

// Render frequency type
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive' | 'ultra';

// Quality level type
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization level type
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Render settings type
export type RenderSetting = 'simple' | 'standard' | 'enhanced' | 'ultra';

// Animation complexity type 
export type AnimationComplexity = 'minimal' | 'standard' | 'complex' | 'ultra';

// Rendering engine type
export type RenderingEngine = 'canvas' | 'svg' | 'webgl' | 'three.js' | 'css';

// Glassmorphic variant type
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'cosmic';

// Glow intensity type
export type GlowIntensity = 'low' | 'medium' | 'high';

// Cube theme type
export type CubeTheme = 'light' | 'dark' | 'quantum' | 'ethereal' | 'cosmic';

// Cube size type
export type CubeSize = 'small' | 'medium' | 'large';

// Web vital category type
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Metric type
export type MetricType = 'render' | 'interaction' | 'load';

// Performance config type
export interface PerfConfig {
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  resourceOptimizationLevel: ResourceOptimizationLevel;
  enableValidation: boolean;
  enableRenderTracking: boolean;
  enablePerformanceTracking: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  metricsPersistence: boolean;
}

// Performance metric type
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: number;
  category: string;
  type: MetricType;
}

// Web vital metric type
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

// Component metrics type
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  reRenderCount: number;
}

// Device info type
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
}

// Performance data type
export interface PerformanceData {
  metrics: Record<string, ComponentMetrics>;
  webVitals: Record<string, number>;
  deviceInfo: DeviceInfo;
  fps: number;
  memoryUsage?: number;
  timestamp: number;
}
