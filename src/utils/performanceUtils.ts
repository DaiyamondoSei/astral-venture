
// Performance utility enum and helper functions

export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Get the device capability category based on device information
 */
export function getPerformanceCategory(): DeviceCapability {
  // Check for low memory devices
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return DeviceCapability.LOW;
  }
  
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return DeviceCapability.LOW;
  } else if (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) {
    return DeviceCapability.HIGH;
  }
  
  // Default to medium capability
  return DeviceCapability.MEDIUM;
}

/**
 * Check if the device is likely to have low performance
 */
export function isLowPerformanceDevice(): boolean {
  return getPerformanceCategory() === DeviceCapability.LOW;
}

/**
 * Check if the device is likely to have high performance
 */
export function isHighPerformanceDevice(): boolean {
  return getPerformanceCategory() === DeviceCapability.HIGH;
}

/**
 * Set performance mode based on device capability
 */
export function setPerformanceMode(capability: DeviceCapability | 'auto' = 'auto'): DeviceCapability {
  if (capability === 'auto') {
    return getPerformanceCategory();
  }
  return capability;
}

/**
 * Throttle a function call
 */
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Define rendering frequency enum
 */
export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive'
}

/**
 * Calculate render frequency
 */
export function calculateRenderFrequency(renderCount: number, timeWindow: number = 1000): RenderFrequency {
  const rendersPerSecond = (renderCount / timeWindow) * 1000;
  
  if (rendersPerSecond > 5) {
    return RenderFrequency.EXCESSIVE;
  } else if (rendersPerSecond > 2) {
    return RenderFrequency.FREQUENT;
  }
  
  return RenderFrequency.NORMAL;
}
