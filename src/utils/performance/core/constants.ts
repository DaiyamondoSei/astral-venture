
/**
 * Core Performance Runtime Constants
 * 
 * This module provides both TypeScript types and their corresponding JavaScript 
 * runtime constants for performance monitoring and configuration.
 */

import { QualityLevel, PerformanceBoundaries, PerformanceMonitorConfig } from './types';

// Device capability type and runtime constants
export type DeviceCapability = 'low' | 'medium' | 'high';

export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Performance mode type and runtime constants
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
} as const;

// Render frequency type and runtime constants
export type RenderFrequency = 'low' | 'medium' | 'high';

export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency
} as const;

// Quality level type and runtime constants
export type CubeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const CubeSizes = {
  XS: 'xs' as CubeSize,
  SM: 'sm' as CubeSize,
  MD: 'md' as CubeSize,
  LG: 'lg' as CubeSize,
  XL: 'xl' as CubeSize
} as const;

// Cube theme type and runtime constants
export type CubeTheme = 'default' | 'energy' | 'spiritual' | 'ethereal' | 'quantum';

export const CubeThemes = {
  DEFAULT: 'default' as CubeTheme,
  ENERGY: 'energy' as CubeTheme,
  SPIRITUAL: 'spiritual' as CubeTheme,
  ETHEREAL: 'ethereal' as CubeTheme,
  QUANTUM: 'quantum' as CubeTheme
} as const;

// Type guards for runtime validation
export function isValidDeviceCapability(value: unknown): value is DeviceCapability {
  return typeof value === 'string' && 
    Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}

export function isValidPerformanceMode(value: unknown): value is PerformanceMode {
  return typeof value === 'string' && 
    Object.values(PerformanceModes).includes(value as PerformanceMode);
}

export function isValidRenderFrequency(value: unknown): value is RenderFrequency {
  return typeof value === 'string' && 
    Object.values(RenderFrequencies).includes(value as RenderFrequency);
}

export function isValidCubeSize(value: unknown): value is CubeSize {
  return typeof value === 'string' && 
    Object.values(CubeSizes).includes(value as CubeSize);
}

export function isValidCubeTheme(value: unknown): value is CubeTheme {
  return typeof value === 'string' && 
    Object.values(CubeThemes).includes(value as CubeTheme);
}

// Performance boundaries
export const DEFAULT_PERFORMANCE_BOUNDARIES: PerformanceBoundaries = {
  lowFpsThreshold: 30,
  mediumFpsThreshold: 50,
  highFpsThreshold: 58,
  excessiveRenderTimeMs: 16,
  highMemoryUsageMb: 200
};

// Default monitor configuration
export const DEFAULT_MONITOR_CONFIG: PerformanceMonitorConfig = {
  samplingInterval: 1000,
  metricsBufferSize: 100,
  autoStart: true,
  trackComponents: true,
  trackInteractions: true,
  trackWebVitals: true,
  logWarnings: true,
  captureElementMetrics: false,
  adaptiveMode: true,
  throttleUpdates: true
};

/**
 * Maps device capability to quality level
 */
export function getQualityLevelForCapability(capability: DeviceCapability): QualityLevel {
  switch (capability) {
    case DeviceCapabilities.HIGH:
      return 'high';
    case DeviceCapabilities.MEDIUM:
      return 'medium';
    case DeviceCapabilities.LOW:
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Maps performance mode to settings configuration
 */
export function getSettingsForPerformanceMode(mode: PerformanceMode) {
  switch (mode) {
    case PerformanceModes.QUALITY:
      return {
        disableBlur: false,
        disableShadows: false,
        particleCount: 1.0,
        maxAnimationsPerFrame: 10
      };
    case PerformanceModes.BALANCED:
      return {
        disableBlur: false,
        disableShadows: true,
        particleCount: 0.7,
        maxAnimationsPerFrame: 6
      };
    case PerformanceModes.PERFORMANCE:
      return {
        disableBlur: true,
        disableShadows: true,
        particleCount: 0.4,
        maxAnimationsPerFrame: 3
      };
    default:
      return {
        disableBlur: false,
        disableShadows: false,
        particleCount: 0.7,
        maxAnimationsPerFrame: 6
      };
  }
}
