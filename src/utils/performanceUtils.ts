
/**
 * Performance Utilities
 * 
 * Core utilities for performance monitoring and optimization
 */

/**
 * Device capability classification
 */
export type DeviceCapability = 'low' | 'medium' | 'high';

/**
 * Performance mode settings
 */
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

/**
 * Render frequency classification
 */
export type RenderFrequency = 'low' | 'medium' | 'high';

/**
 * Quality level settings
 */
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Get performance category based on device capability
 */
export function getPerformanceCategory(capability: DeviceCapability): string {
  switch (capability) {
    case 'low':
      return 'low-performance';
    case 'medium':
      return 'standard-performance';
    case 'high':
      return 'high-performance';
    default:
      return 'standard-performance';
  }
}

/**
 * Determine if the current environment is development or production
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Determine if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return localStorage.getItem('debugMode') === 'true';
}

/**
 * Log performance metrics in development mode
 */
export function logPerformanceMetric(
  componentName: string,
  metricName: string,
  value: number
): void {
  if (isDevelopment() || isDebugMode()) {
    console.log(
      `%c[Performance] ${componentName} - ${metricName}: ${value.toFixed(2)}ms`,
      'color: #8a2be2;'
    );
  }
}

/**
 * Compare performance metrics against thresholds
 */
export function evaluatePerformance(
  metricName: string,
  value: number
): 'good' | 'warning' | 'poor' {
  const thresholds = {
    renderTime: { good: 10, warning: 30 },
    loadTime: { good: 300, warning: 1000 },
    fps: { good: 55, warning: 30 }
  };
  
  const metric = thresholds[metricName as keyof typeof thresholds];
  
  if (!metric) return 'good';
  
  if (value <= metric.good) return 'good';
  if (value <= metric.warning) return 'warning';
  return 'poor';
}

/**
 * Create a debounced function to avoid excessive performance tracking
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Create a throttled function to limit performance tracking
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Detect device capability based on hardware and browser features
 */
export function detectDeviceCapability(): DeviceCapability {
  // Check for hardware concurrency
  const cores = navigator.hardwareConcurrency || 0;
  
  // Check for device memory
  const memory = (navigator as any).deviceMemory || 0;
  
  // Check for mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Low-end device check
  if (
    (cores <= 2) || 
    (memory > 0 && memory <= 2) || 
    (isMobile && (cores <= 4 || memory <= 4))
  ) {
    return 'low';
  }
  
  // High-end device check
  if (
    (cores >= 8) || 
    (memory >= 8) || 
    (!isMobile && cores >= 6)
  ) {
    return 'high';
  }
  
  // Default to medium capability
  return 'medium';
}

/**
 * Calculate the appropriate number of particles based on device capability
 */
export function getParticleCount(baseCount: number, deviceCapability: DeviceCapability): number {
  const multipliers = {
    low: 0.3,
    medium: 0.7,
    high: 1.0
  };
  
  return Math.round(baseCount * multipliers[deviceCapability]);
}

/**
 * Determine if a performance-heavy feature should be enabled
 */
export function shouldEnableFeature(
  featureName: string,
  deviceCapability: DeviceCapability
): boolean {
  // Features that should be disabled on low-end devices
  const heavyFeatures = ['blur', 'shadows', 'particles', 'animations'];
  
  // Features that should be disabled on medium devices
  const mediumFeatures = ['complex-particles', 'high-quality-blur'];
  
  if (deviceCapability === 'low' && heavyFeatures.includes(featureName)) {
    return false;
  }
  
  if (deviceCapability === 'medium' && mediumFeatures.includes(featureName)) {
    return false;
  }
  
  return true;
}

/**
 * Get appropriate geometry detail level based on device capability
 */
export function getGeometryDetail(deviceCapability: DeviceCapability): number {
  const detailLevels = {
    low: 1,
    medium: 2,
    high: 3
  };
  
  return detailLevels[deviceCapability];
}

/**
 * Track performance for performance-sensitive operations
 */
export function monitorPerformance<T extends (...args: any[]) => any>(
  func: T,
  operationName: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    logPerformanceMetric(operationName, 'executionTime', end - start);
    
    return result;
  };
}

/**
 * Throttle function execution based on device performance
 */
export function throttleForPerformance<T extends (...args: any[]) => any>(
  func: T,
  deviceCapability: DeviceCapability
): (...args: Parameters<T>) => ReturnType<T> {
  const throttleTimes = {
    low: 150,
    medium: 80,
    high: 30
  };
  
  const throttleTime = throttleTimes[deviceCapability];
  let lastExecution = 0;
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const now = performance.now();
    if (now - lastExecution < throttleTime) {
      // @ts-ignore - This is a simplification to allow the throttle function to work
      return undefined;
    }
    
    lastExecution = now;
    return func(...args);
  };
}
