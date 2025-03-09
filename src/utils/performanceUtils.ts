
/**
 * Performance utilities for optimizing application rendering
 * Provides device capability detection and optimization helpers
 */

// Device capability types for performance categorization
export type DeviceCapability = 'low' | 'medium' | 'high';

// Check if the device likely has limited capabilities
const checkIsLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check for indicators of low-end devices
  const memory = (navigator as any).deviceMemory || 4; // Default to medium if not available
  const cores = navigator.hardwareConcurrency || 4;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices with limited capabilities
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isOlderDevice = /android 4|android 5|msie|trident/i.test(userAgent);
  
  // Determine if this is likely a low-end device
  return (memory < 2 || cores < 4 || isOlderDevice) && isMobile;
};

/**
 * Determines the performance category of the current device
 * Can be used to adjust visual effects and animations
 */
export const getPerformanceCategory = (): DeviceCapability => {
  // For SSR compatibility
  if (typeof window === 'undefined') return 'medium';
  
  // Check user preference if set
  const userPreference = localStorage.getItem('performanceMode');
  if (userPreference) {
    if (userPreference === 'low' || userPreference === 'medium' || userPreference === 'high') {
      return userPreference;
    }
  }
  
  // Auto-detect
  const isLowEndDevice = checkIsLowEndDevice();
  
  if (isLowEndDevice) return 'low';
  
  return window.innerWidth < 768 ? 'medium' : 'high';
};

/**
 * Starts performance monitoring for the application
 * Can be called after initial render to avoid blocking critical content
 */
export const monitorPerformance = () => {
  if (typeof window === 'undefined') return;
  
  // Only monitor performance in development
  if (process.env.NODE_ENV !== 'development') return;
  
  // Throttle data collection to reduce overhead
  const throttleDuration = 5000; // 5 seconds
  let lastReported = 0;
  
  // Setup performance observer
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const now = Date.now();
        if (now - lastReported < throttleDuration) return;
        
        lastReported = now;
        const entries = list.getEntries();
        
        if (entries.length > 0) {
          console.log('[Performance] Monitoring entries:', entries.length);
        }
      });
      
      // Start observing various performance metrics
      observer.observe({ entryTypes: ['longtask', 'paint', 'layout-shift'] });
      
      console.log('[Performance] Monitoring started');
    } catch (e) {
      console.error('[Performance] Error setting up performance monitoring:', e);
    }
  }
};

// Collection of performance optimization utilities
export const performanceUtils = {
  getPerformanceCategory,
  monitorPerformance,
  isLowEndDevice: checkIsLowEndDevice,
  throttle: (fn: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      return fn(...args);
    };
  },
  
  // Helper for conditionally rendering high-performance components
  shouldRenderHighPerformance: () => getPerformanceCategory() === 'high',
  
  // Helper for conditionally rendering medium-performance components
  shouldRenderMediumPerformance: () => {
    const category = getPerformanceCategory();
    return category === 'high' || category === 'medium';
  }
};

export default performanceUtils;
