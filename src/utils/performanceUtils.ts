
/**
 * Performance Utilities
 * 
 * This module provides utilities for managing performance optimizations
 * based on device capabilities and current performance metrics.
 */

// Device capability detection
export type DevicePerformanceCategory = 'low' | 'medium' | 'high';
export type AnimationQualityLevel = 'minimal' | 'reduced' | 'standard' | 'enhanced';

export interface DeviceCapabilities {
  // Core device information
  cpuCores: number;
  memoryInMB: number | null;
  devicePixelRatio: number;
  touchEnabled: boolean;
  
  // Browser/platform capabilities
  webGL: boolean;
  webGL2: boolean;
  hardwareAcceleration: boolean;
  
  // Connection information
  connectionType: string | null;
  effectiveConnectionType: string | null;
  
  // Performance metrics
  performanceGrade: DevicePerformanceCategory;
}

/**
 * Detect device capabilities for performance optimization
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Default/fallback values
  const defaults: DeviceCapabilities = {
    cpuCores: 2,
    memoryInMB: null,
    devicePixelRatio: 1,
    touchEnabled: false,
    webGL: false,
    webGL2: false,
    hardwareAcceleration: false,
    connectionType: null,
    effectiveConnectionType: null,
    performanceGrade: 'medium'
  };
  
  // Only run detection in browser environment
  if (typeof window === 'undefined') {
    return defaults;
  }
  
  try {
    // CPU cores detection
    const cpuCores = navigator.hardwareConcurrency || defaults.cpuCores;
    
    // Device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Touch capability
    const touchEnabled = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0;
    
    // WebGL support
    let webGL = false;
    let webGL2 = false;
    try {
      const canvas = document.createElement('canvas');
      webGL = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      webGL2 = !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      // WebGL not supported
    }
    
    // Memory detection (not available in all browsers)
    let memoryInMB = null;
    if ((navigator as any).deviceMemory) {
      memoryInMB = (navigator as any).deviceMemory * 1024;
    }
    
    // Network information
    let connectionType = null;
    let effectiveConnectionType = null;
    if ((navigator as any).connection) {
      connectionType = (navigator as any).connection.type;
      effectiveConnectionType = (navigator as any).connection.effectiveType;
    }
    
    // Hardware acceleration - check if transform3d is supported (basic check)
    const hardwareAcceleration = (() => {
      const el = document.createElement('div');
      el.style.cssText = 'transform: translate3d(0, 0, 0)';
      return el.style.length > 0;
    })();
    
    // Performance categorization
    let performanceGrade: DevicePerformanceCategory = 'medium';
    if (
      (cpuCores >= 6 && devicePixelRatio >= 2 && webGL2) ||
      (cpuCores >= 4 && memoryInMB && memoryInMB >= 4096 && webGL2)
    ) {
      performanceGrade = 'high';
    } else if (
      (cpuCores <= 2) ||
      (memoryInMB && memoryInMB < 2048) ||
      (!webGL) ||
      (effectiveConnectionType === '2g') ||
      (effectiveConnectionType === 'slow-2g')
    ) {
      performanceGrade = 'low';
    }
    
    return {
      cpuCores,
      memoryInMB,
      devicePixelRatio,
      touchEnabled,
      webGL,
      webGL2,
      hardwareAcceleration,
      connectionType,
      effectiveConnectionType,
      performanceGrade
    };
  } catch (error) {
    console.warn('Error detecting device capabilities:', error);
    return defaults;
  }
}

/**
 * Get a performance category (low, medium, high) based on device capabilities
 */
export function getPerformanceCategory(): DevicePerformanceCategory {
  const capabilities = detectDeviceCapabilities();
  return capabilities.performanceGrade;
}

/**
 * Calculates optimal element count for visualizations based on device performance
 */
export function getOptimalElementCount(
  baseCount: number, 
  componentComplexity: 'low' | 'medium' | 'high' = 'medium'
): number {
  const performanceCategory = getPerformanceCategory();
  
  // Complexity multipliers
  const complexityFactors = {
    low: 0.7,
    medium: 1,
    high: 1.3
  };
  
  // Performance scaling factors
  const performanceScalingFactors = {
    low: 0.5,
    medium: 0.8,
    high: 1
  };
  
  // Apply scaling based on performance category and component complexity
  const scaledCount = Math.floor(
    baseCount * 
    performanceScalingFactors[performanceCategory] * 
    complexityFactors[componentComplexity]
  );
  
  // Ensure minimum and maximum values
  return Math.max(
    Math.floor(baseCount * 0.3), // Minimum 30% of base count
    Math.min(scaledCount, baseCount) // Cap at base count
  );
}

/**
 * Get animation quality level based on device capabilities
 */
export function getAnimationQualityLevel(): AnimationQualityLevel {
  const performanceCategory = getPerformanceCategory();
  
  switch (performanceCategory) {
    case 'low':
      return 'minimal';
    case 'medium':
      return 'reduced';
    case 'high':
      return 'standard';
    default:
      return 'reduced';
  }
}
