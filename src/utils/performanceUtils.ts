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
  DeviceInfo 
} from '../types/core/performance/MetricTypes';

// Re-export types for backwards compatibility
export { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency 
};

// Export types needed by existing code
export type { 
  DeviceInfo, 
  PerformanceMetric, 
  WebVitalMetric 
};

export interface PerformanceReportPayload {
  metrics: PerformanceMetric[];
  webVitals?: WebVitalMetric[];
  sessionId?: string;
  userId?: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'desktop';
  deviceInfo?: DeviceInfo;
}

export interface PerformanceConfig {
  enabled: boolean;
  targetFPS: number;
  qualityLevel: string;
  monitoringEnabled: boolean;
  optimizationEnabled: boolean;
}

export interface PerformanceContextState {
  deviceCapability: DeviceCapability;
  performanceMode: PerformanceMode;
  webGL2Support: boolean;
  gpuCapability: number;
  config: PerformanceConfig;
}

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
    (navigator?.deviceMemory && navigator.deviceMemory < 4) ||
    (navigator?.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

  if (isLowEndDevice) {
    return DeviceCapability.LOW;
  }

  // Check for high-end indicators
  const isHighEndDevice = 
    (navigator?.hardwareConcurrency && navigator.hardwareConcurrency >= 8) ||
    (navigator?.deviceMemory && navigator.deviceMemory >= 8) ||
    matchMedia('(min-resolution: 2dppx)').matches;

  if (isHighEndDevice) {
    return DeviceCapability.HIGH;
  }

  // Check for ultra-high-end
  const isUltraDevice =
    (navigator?.hardwareConcurrency && navigator.hardwareConcurrency >= 12) ||
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
 * Throttles a function to limit execution frequency
 * @param func The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
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

// Re-export types from core modules for centralized access
export type { DeviceInfo, PerformanceReportPayload } from './performance/types';
export type { PerformanceConfig, PerformanceContextState, } from './performance/types';
