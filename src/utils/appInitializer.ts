
import { initAssetPreloading } from './preloadAssets';
import { initPerformanceMonitoring } from './performance/performanceMonitor';
import { getPerformanceCategory } from './performanceUtils';

/**
 * Initialize the application with all performance optimizations
 * This should be called as early as possible in the application lifecycle
 */
export const initializeApp = (): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  // Register performance optimizations in order of importance
  
  // 1. Detect device capabilities and set global state
  const deviceCapability = getPerformanceCategory();
  (window as any).__deviceCapability = deviceCapability;
  
  console.log(`App initialized with device capability: ${deviceCapability}`);
  
  // 2. Preload critical assets based on device capability
  initAssetPreloading();
  
  // 3. Set up performance monitoring
  const cleanupPerformanceMonitoring = initPerformanceMonitoring();
  
  // Return cleanup function
  return () => {
    cleanupPerformanceMonitoring();
  };
};

// Export a function to reinitialize performance optimizations
// This can be useful after significant state changes or when recovering from background
export const reoptimizeApp = (): void => {
  if (typeof window === 'undefined') return;
  
  // Re-detect device capabilities
  const deviceCapability = getPerformanceCategory();
  (window as any).__deviceCapability = deviceCapability;
  
  console.log(`App reoptimized with device capability: ${deviceCapability}`);
};
