
/**
 * Performance utility functions and types
 * 
 * This module provides performance-related utilities, type definitions, and helpers
 * for measuring, analyzing, and optimizing application performance.
 */

import { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency,
  PerformanceMetric,
  WebVitalMetric,
  DeviceInfo,
  PerformanceReportPayload,
  PerformanceMonitorConfig,
  QualityLevel
} from '../types/core/performance/metrics';

// Re-export types from core modules for centralized access
export { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency,
  QualityLevel,
  MetricType,
  WebVitalName,
  WebVitalCategory,
  WebVitalRating 
} from '../types/core/performance/metrics';

// Export interfaces for external use
export type { 
  PerformanceMetric,
  WebVitalMetric,
  DeviceInfo,
  ComponentMetrics,
  PerformanceReportPayload,
  PerformanceMonitorConfig,
  PerformanceSettings,
  AdaptiveSettings,
  PerformanceBoundaries,
  PerformanceTrackingOptions,
  PerfConfig
} from '../types/core/performance/config';

/**
 * Determines the device capability based on various factors
 * @returns The detected device capability level
 */
export function detectDeviceCapability(): DeviceCapability {
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return DeviceCapability.MEDIUM; // Default for SSR
  }

  // Check for low-end device indicators
  const isLowEndDevice = 
    !window.requestAnimationFrame ||
    /Mobile|Android/.test(navigator.userAgent) ||
    (navigator.deviceMemory && navigator.deviceMemory < 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  if (isLowEndDevice) {
    return DeviceCapability.LOW;
  }

  // Check for high-end indicators
  const isHighEndDevice = 
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) ||
    (navigator.deviceMemory && navigator.deviceMemory >= 8) ||
    matchMedia('(min-resolution: 2dppx)').matches;

  if (isHighEndDevice) {
    return DeviceCapability.HIGH;
  }

  // Check for ultra-high-end
  const isUltraDevice =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 12) ||
    (window.innerWidth >= 2560 && window.innerHeight >= 1440);

  if (isUltraDevice) {
    return DeviceCapability.ULTRA;
  }

  // Default to medium
  return DeviceCapability.MEDIUM;
}

/**
 * Checks if WebGL2 is supported by the browser
 * @returns Boolean indicating WebGL2 support
 */
export function hasWebGL2Support(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Estimates GPU capabilities based on various browser features
 * @returns Score from 0-100 indicating GPU capability
 */
export function estimateGPUCapability(): number {
  let score = 50; // Default medium score
  
  // Check WebGL support level
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || 
               canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 20; // Very low score if no WebGL
    }
    
    // WebGL2 is better than WebGL1
    if (canvas.getContext('webgl2')) {
      score += 20;
    }
    
    // Check for high precision support
    const highPrecision = gl.getShaderPrecisionFormat?.(
      gl.FRAGMENT_SHADER, 
      gl.HIGH_FLOAT
    );
    
    if (highPrecision && highPrecision.precision > 0) {
      score += 15;
    }
    
    // Check max texture size as indicator of GPU memory
    const maxTextureSize = gl.getParameter?.(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 16384) {
      score += 15;
    } else if (maxTextureSize >= 8192) {
      score += 10;
    } else if (maxTextureSize >= 4096) {
      score += 5;
    }
    
    // Check max render buffer size
    const maxRenderBufferSize = gl.getParameter?.(gl.MAX_RENDERBUFFER_SIZE);
    if (maxRenderBufferSize >= 16384) {
      score += 10;
    }
    
  } catch (e) {
    console.warn('GPU capability estimation failed:', e);
    return 30; // Conservative estimate on error
  }
  
  // Cap the score at 100
  return Math.min(100, score);
}

/**
 * Get appropriate particle count based on device capability
 * @param deviceCapability The detected device capability
 * @returns Number of particles to render
 */
export function getParticleCount(deviceCapability: DeviceCapability): number {
  switch (deviceCapability) {
    case DeviceCapability.LOW:
      return 25;
    case DeviceCapability.MEDIUM:
      return 50;
    case DeviceCapability.HIGH:
      return 100;
    case DeviceCapability.ULTRA:
      return 200;
    default:
      return 50;
  }
}

/**
 * Determine if a feature should be enabled based on device capability
 * @param feature The feature to check
 * @param deviceCapability The detected device capability
 * @returns Boolean indicating if feature should be enabled
 */
export function shouldEnableFeature(
  feature: 'blur' | 'shadows' | 'particles' | 'animations' | 'effects',
  deviceCapability: DeviceCapability
): boolean {
  switch (feature) {
    case 'blur':
    case 'shadows':
      return deviceCapability !== DeviceCapability.LOW;
    case 'particles':
      return deviceCapability !== DeviceCapability.LOW;
    case 'animations':
      return true; // Always enable basic animations
    case 'effects':
      return deviceCapability !== DeviceCapability.LOW;
    default:
      return true;
  }
}

/**
 * Get appropriate geometry detail level based on device capability
 * @param deviceCapability The detected device capability
 * @returns Detail level from 1 (low) to 4 (ultra)
 */
export function getGeometryDetail(deviceCapability: DeviceCapability): number {
  switch (deviceCapability) {
    case DeviceCapability.LOW:
      return 1;
    case DeviceCapability.MEDIUM:
      return 2;
    case DeviceCapability.HIGH:
      return 3;
    case DeviceCapability.ULTRA:
      return 4;
    default:
      return 2;
  }
}

/**
 * Get performance category based on component metrics
 * @param renderTime The render time in ms
 * @param renderCount The number of renders
 * @returns Performance category classification
 */
export function getPerformanceCategory(renderTime: number, renderCount: number): string {
  if (renderTime > 100 || renderCount > 20) {
    return 'critical';
  } else if (renderTime > 50 || renderCount > 10) {
    return 'warning';
  } else {
    return 'good';
  }
}

/**
 * Throttles a function based on performance settings
 * @param func The function to throttle
 * @param deviceCapability The device capability
 * @returns Throttled function
 */
export function throttleForPerformance<T extends (...args: any[]) => any>(
  func: T,
  deviceCapability: DeviceCapability
): (...args: Parameters<T>) => void {
  const throttleTime = deviceCapability === DeviceCapability.LOW ? 100 : 
                      deviceCapability === DeviceCapability.MEDIUM ? 50 : 16;
  
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    const remaining = throttleTime - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * Create a function that throttles based on FPS target
 * @param func The function to throttle
 * @param targetFPS The target frames per second
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  targetFPS = 60
): (...args: Parameters<T>) => void {
  const limit = 1000 / targetFPS;
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };
}
