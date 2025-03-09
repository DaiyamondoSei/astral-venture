
/**
 * Optimized adaptive rendering utilities
 * 
 * This module provides functionality to adjust rendering quality and performance
 * based on device capabilities and current application state.
 */

import { PerfConfig } from '@/contexts/PerfConfigContext';

// Flag to track if adaptive rendering is initialized
let isInitialized = false;

// Default thresholds for device capability detection
const cpuThresholds = {
  low: 2,    // 2 cores or fewer
  medium: 4, // 3-4 cores
  high: 8    // 8+ cores
};

// Memory thresholds in MB (if available)
const memoryThresholds = {
  low: 2048,    // 2GB or less
  medium: 4096, // 4GB
  high: 8192    // 8GB+
};

/**
 * Device capability detection using available browser APIs
 */
export function detectDeviceCapability(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium';
  
  // Check for mobile devices first
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile/i.test(navigator.userAgent);
  
  // CPU cores
  const cpuCores = navigator.hardwareConcurrency || 4;
  
  // Memory (if available)
  let memory: number | undefined;
  if ('deviceMemory' in navigator) {
    memory = (navigator as any).deviceMemory * 1024;
  }
  
  // Battery status (if available)
  let isBatteryLow = false;
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      isBatteryLow = battery.level < 0.2 && !battery.charging;
    }).catch(() => {
      // Ignore errors with battery API
    });
  }
  
  // Check performance timing API for navigation timing
  let navigationTime = 0;
  if (performance && performance.timing) {
    navigationTime = 
      performance.timing.domContentLoadedEventEnd - 
      performance.timing.navigationStart;
  }
  
  // Determine capability level based on all factors
  if (
    isMobile || 
    (cpuCores <= cpuThresholds.low) || 
    (memory && memory <= memoryThresholds.low) ||
    isBatteryLow ||
    navigationTime > 2000 // Slow initial page load
  ) {
    return 'low';
  } else if (
    (cpuCores >= cpuThresholds.high) && 
    (memory === undefined || memory >= memoryThresholds.high) &&
    navigationTime < 1000 // Fast initial page load
  ) {
    return 'high';
  } else {
    return 'medium';
  }
}

/**
 * Create initial performance configuration based on device capability
 */
export function createInitialPerfConfig(): PerfConfig {
  const deviceCapability = detectDeviceCapability();
  
  return {
    enableVirtualization: true,
    enableLazyLoading: true,
    deviceCapability: deviceCapability
  };
}

/**
 * Initialize adaptive rendering system
 */
export function initAdaptiveRendering(): void {
  if (isInitialized) return;
  
  // Feature detection and capability-based adjustments
  const deviceCapability = detectDeviceCapability();
  
  // Apply body classes for CSS-based optimizations
  if (typeof document !== 'undefined') {
    document.body.classList.add(`device-${deviceCapability}`);
    
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
  }
  
  // Set up resize observer for adaptive layout changes
  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(throttle(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update layout classes based on viewport dimensions
      document.body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
      
      if (width < 640) document.body.classList.add('viewport-xs');
      else if (width < 768) document.body.classList.add('viewport-sm');
      else if (width < 1024) document.body.classList.add('viewport-md');
      else if (width < 1280) document.body.classList.add('viewport-lg');
      else document.body.classList.add('viewport-xl');
      
      // Add tall/wide viewport indicators
      document.body.classList.remove('viewport-tall', 'viewport-wide');
      if (height > width) document.body.classList.add('viewport-tall');
      else document.body.classList.add('viewport-wide');
    }, 200));
    
    resizeObserver.observe(document.body);
  }
  
  console.log('Adaptive rendering initialized with capability:', deviceCapability);
  
  isInitialized = true;
}

/**
 * Helper function to throttle function calls
 */
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...funcArgs: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

/**
 * Adjust element count based on device capability
 */
export function adaptElementCount(baseCount: number, deviceCapability: 'low' | 'medium' | 'high'): number {
  const factors: Record<'low' | 'medium' | 'high', number> = {
    low: 0.3,
    medium: 0.7,
    high: 1.0
  };
  
  return Math.max(3, Math.floor(baseCount * factors[deviceCapability]));
}

export default {
  init: initAdaptiveRendering,
  detectDeviceCapability,
  createInitialPerfConfig,
  adaptElementCount
};
