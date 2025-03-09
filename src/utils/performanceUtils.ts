
/**
 * Performance utility functions and device capability detection
 */

export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RenderFrequency {
  NORMAL = 'normal',
  FREQUENT = 'frequent',
  EXCESSIVE = 'excessive'
}

/**
 * Detect device capability based on hardware and browser features
 */
export function getPerformanceCategory(): DeviceCapability {
  if (typeof window === 'undefined') return DeviceCapability.MEDIUM;
  
  // Check if we already have a stored value
  if ((window as any).__deviceCapability) {
    return (window as any).__deviceCapability;
  }
  
  // Check for known mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check for hardware concurrency (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 0;
  
  // Device memory is not supported in all browsers
  const memory = (navigator as any).deviceMemory !== undefined ? (navigator as any).deviceMemory : 4;
  
  // Use user agent for additional signals
  const isOldBrowser = /MSIE|Trident/.test(navigator.userAgent);
  
  // Determine category based on hardware capabilities
  if (isOldBrowser || (isMobile && (cpuCores <= 2 || memory <= 2))) {
    return DeviceCapability.LOW;
  } else if ((isMobile && cpuCores <= 4) || (!isMobile && cpuCores <= 2)) {
    return DeviceCapability.MEDIUM;
  } else {
    return DeviceCapability.HIGH;
  }
}

/**
 * Start monitoring performance
 */
export function monitorPerformance(): void {
  import('./performance/PerformanceMonitor').then(({ performanceMonitor }) => {
    performanceMonitor.startMonitoring();
  });
}

/**
 * Create a performance throttled function
 */
export function throttleForPerformance<T extends (...args: any[]) => any>(
  fn: T, 
  deviceCapability: DeviceCapability, 
  options: { low?: number; medium?: number; high?: number } = {}
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const { low = 500, medium = 250, high = 100 } = options;
  
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let throttleTime: number;
  
  // Set throttle time based on device capability
  switch (deviceCapability) {
    case DeviceCapability.LOW:
      throttleTime = low;
      break;
    case DeviceCapability.MEDIUM:
      throttleTime = medium;
      break;
    case DeviceCapability.HIGH:
      throttleTime = high;
      break;
    default:
      throttleTime = medium;
  }
  
  return function(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    if (now - lastCall < throttleTime) {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Schedule the function call
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, throttleTime - (now - lastCall));
      
      return undefined;
    }
    
    lastCall = now;
    return fn(...args);
  };
}

// Add throttle function for backward compatibility
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    fn(...args);
  };
}
