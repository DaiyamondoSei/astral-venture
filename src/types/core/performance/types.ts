
/**
 * Performance Types
 * 
 * Core type definitions for the performance monitoring system
 */

// Device capability levels
export type DeviceCapability = 'low' | 'medium' | 'high' | 'ultra';

// Performance modes for adaptive rendering
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// Render frequency settings
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// Cube rendering visual themes
export type CubeTheme = 'default' | 'quantum' | 'ethereal' | 'cosmic';

// Cube size options
export type CubeSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Glow effect intensity
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

// Glassmorphic container variants
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'cosmic' | 'purple' | 'medium' | 'subtle';

// Rendering engines
export type RenderingEngine = 'canvas' | 'svg' | 'webgl' | 'auto';

// Quality levels
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

// Resource optimization levels
export type ResourceOptimizationLevel = 'none' | 'conservative' | 'aggressive';

// Animation complexity
export type AnimationComplexity = 'minimal' | 'reduced' | 'normal' | 'enhanced';

// Render settings
export type RenderSetting = 'auto' | 'fixed' | 'adaptive';

// Device information
export interface DeviceInfo {
  userAgent: string;
  deviceCategory: 'mobile' | 'tablet' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
}

// Performance metrics interface for components
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
  name: WebVitalName;
  value: number;
  category: WebVitalCategory;
  timestamp: number;
}

// General performance metric
export interface PerformanceMetric {
  metric_name: string;
  value: number;
  timestamp: number;
  category: string;
  type: MetricType;
}

// Performance config
export interface PerfConfig {
  // Device capabilities
  deviceCapability: DeviceCapability;
  
  // User preferences
  useManualCapability: boolean;
  disableAnimations: boolean;
  disableEffects: boolean;
  
  // Metrics collection settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enableValidation: boolean;
  enableRenderTracking: boolean;
  enablePerformanceTracking: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Optimization settings
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  
  // Rendering settings
  renderQuality: QualityLevel;
  resourceOptimizationLevel: ResourceOptimizationLevel;
  
  // Storage
  metricsPersistence: boolean;
}

// Metatron's cube node
export interface MetatronsNode {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
  pulsating?: boolean;
  glowing?: boolean;
  color?: string;
  secondaryColor?: string;
  size?: number;
}

// Metatron's cube connection
export interface MetatronsConnection {
  id: string;
  source: string;
  target: string;
  active?: boolean;
  color?: string;
}

// Core performance context type
export interface PerformanceContextType {
  // Core settings
  config: PerfConfig;
  updateConfig: (updates: Partial<PerfConfig>) => void;
  
  // Derived state
  deviceCapability: DeviceCapability;
  isLowPerformance: boolean;
  
  // Feature flags based on configuration
  enableBlur: boolean;
  enableShadows: boolean;
  enableComplexAnimations: boolean;
  
  // Metrics and monitoring
  setManualPerformanceMode?: (mode: PerformanceMode) => void;
  trackEvent?: (name: string, value?: number) => void;
  
  // Configuration export
  exportConfig: () => { success: boolean; data?: PerfConfig; error?: string };
  
  // Performance settings used for rendering decisions
  features: {
    qualityLevel: QualityLevel;
    webVitals: Record<string, number>;
  };
}
