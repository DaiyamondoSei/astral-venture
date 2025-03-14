
import { DeviceCapability, PerformanceMode, RenderFrequency, QualityLevel } from '@/utils/performance/core/types';

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
