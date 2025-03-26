
/**
 * Performance Types
 * 
 * Core type definitions for the performance monitoring system
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high';

// Performance optimization modes
export type PerformanceMode = 'balanced' | 'performance' | 'quality';

// Quality level settings
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization level
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Rendering engine options
export type RenderingEngine = 'canvas' | 'svg' | 'webgl' | 'auto';

// Animation complexity levels
export type AnimationComplexity = 'minimal' | 'reduced' | 'standard' | 'enhanced';

// Render settings
export type RenderSetting = 'auto' | 'low' | 'medium' | 'high';

// Glassmorphic variant
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal';

// Render frequency options
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Glow intensity levels
export type GlowIntensity = 'low' | 'medium' | 'high';

// Cube theme options
export type CubeTheme = 'default' | 'quantum' | 'chakra' | 'cosmic';

// Cube size options
export type CubeSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';

// Performance configuration interface
export interface PerfConfig {
  // Core settings
  deviceCapability: DeviceCapability;
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Feature flags
  enableAdaptiveRendering: boolean;
  enableProgressiveEnhancement: boolean;
  
  // Resource settings
  resourceOptimizationLevel: ResourceOptimizationLevel;
}

// Performance metrics for components
export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  reRenderCount: number;
}

// Web vital metric
export interface WebVitalMetric {
  name: string;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

// Generic performance metric
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: number;
  category: string;
  type: MetricType;
}

// Device information
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
}

// Performance monitoring options
export interface PerformanceMonitorOptions {
  enabled?: boolean;
  debug?: boolean;
  trackComponents?: boolean;
  trackWebVitals?: boolean;
  trackFPS?: boolean;
  trackMemory?: boolean;
  sampleInterval?: number;
}

// Web vital category
export type WebVitalCategory = 'loading' | 'interaction' | 'visual_stability';

// Web vital name
export type WebVitalName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';

// Metric type
export type MetricType = 'render' | 'interaction' | 'network' | 'resource' | 'memory' | 'custom';

// Adaptive settings for performance optimization
export interface AdaptiveSettings {
  qualityLevel: QualityLevel;
  particleCount: number;
  disableBlur: boolean;
  disableShadows: boolean;
  simplifiedGeometry: boolean;
  useSimplifiedEffects: boolean;
  maxAnimatedElements: number;
  maxRenderedElements: number;
}
