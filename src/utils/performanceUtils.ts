
import { DeviceCapability } from '@/contexts/PerformanceContext';

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
