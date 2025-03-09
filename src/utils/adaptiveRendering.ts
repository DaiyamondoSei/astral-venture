
/**
 * Adaptive Rendering System
 * 
 * This module provides utilities for adapting the rendering behavior
 * based on device performance and user preferences.
 */

import { getPerformanceCategory } from './performanceUtils';

// Configuration for different performance levels
const PERFORMANCE_CONFIGS = {
  high: {
    enableAnimations: true,
    enableParticles: true,
    enableGlow: true,
    particleCount: 100,
    animationFrameRate: 60,
    renderDistance: 'far',
    effectDetail: 'high',
  },
  medium: {
    enableAnimations: true,
    enableParticles: true,
    enableGlow: true,
    particleCount: 60,
    animationFrameRate: 45,
    renderDistance: 'medium',
    effectDetail: 'medium',
  },
  low: {
    enableAnimations: true,
    enableParticles: false,
    enableGlow: false,
    particleCount: 30,
    animationFrameRate: 30,
    renderDistance: 'near',
    effectDetail: 'low',
  },
  minimal: {
    enableAnimations: false,
    enableParticles: false,
    enableGlow: false,
    particleCount: 0,
    animationFrameRate: 24,
    renderDistance: 'near',
    effectDetail: 'minimal',
  },
};

// Global performance level - defaulting to medium
let performanceLevel = 'medium';

// Feature overrides for specific scenarios
const featureOverrides: Record<string, boolean> = {};

/**
 * Initialize the adaptive rendering system
 */
export const initAdaptiveRendering = () => {
  // Determine initial performance level based on device capabilities
  performanceLevel = detectDevicePerformance();
  console.log(`Adaptive rendering initialized with performance level: ${performanceLevel}`);
  
  // Add event listener for visibility changes to adapt rendering when tab is inactive
  document.addEventListener('visibilitychange', adjustForVisibility);
  
  // Set up performance monitoring
  setupPerformanceMonitoring();
};

/**
 * Detect device performance level
 */
const detectDevicePerformance = (): string => {
  // Simple detection based on user agent and device memory
  const memory = (navigator as any).deviceMemory || 4;
  const isHighEnd = memory >= 6;
  const isLowEnd = memory <= 2;
  
  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isHighEnd && !isMobile) {
    return 'high';
  } else if (isLowEnd || isMobile) {
    return 'low';
  } else {
    return 'medium';
  }
};

/**
 * Adjust rendering when visibility changes
 */
const adjustForVisibility = () => {
  if (document.hidden) {
    // Tab is inactive, reduce rendering quality
    setFeatureOverride('enableAnimations', false);
    setFeatureOverride('enableParticles', false);
  } else {
    // Tab is active again, restore default settings
    clearFeatureOverride('enableAnimations');
    clearFeatureOverride('enableParticles');
  }
};

/**
 * Set up ongoing performance monitoring
 */
const setupPerformanceMonitoring = () => {
  // Check FPS periodically and adjust settings if needed
  let lastTime = performance.now();
  let frames = 0;
  
  const checkPerformance = () => {
    frames++;
    const currentTime = performance.now();
    
    if (currentTime > lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime));
      lastTime = currentTime;
      frames = 0;
      
      // Adjust performance level based on FPS
      if (fps < 30 && performanceLevel !== 'minimal') {
        performanceLevel = 'minimal';
        console.log('Performance dropped, reducing quality to minimal');
      } else if (fps < 45 && performanceLevel !== 'low' && performanceLevel !== 'minimal') {
        performanceLevel = 'low';
        console.log('Performance dropped, reducing quality to low');
      } else if (fps > 55 && performanceLevel === 'minimal') {
        performanceLevel = 'low';
        console.log('Performance improved, increasing quality to low');
      } else if (fps > 55 && performanceLevel === 'low') {
        performanceLevel = 'medium';
        console.log('Performance improved, increasing quality to medium');
      }
    }
    
    requestAnimationFrame(checkPerformance);
  };
  
  requestAnimationFrame(checkPerformance);
};

/**
 * Get the current performance level
 */
export const getPerformanceLevel = (): string => {
  return performanceLevel;
};

/**
 * Get a specific setting for the current performance level
 */
export const getAdaptiveSetting = <T>(settingName: string): T => {
  const config = PERFORMANCE_CONFIGS[performanceLevel as keyof typeof PERFORMANCE_CONFIGS];
  
  // Check if there's an override for this feature
  if (featureOverrides.hasOwnProperty(settingName)) {
    return featureOverrides[settingName] as unknown as T;
  }
  
  // Return the setting from the current performance level
  return config[settingName as keyof typeof config] as unknown as T;
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (featureName: string): boolean => {
  return getAdaptiveSetting<boolean>(featureName);
};

/**
 * Override a specific feature setting
 */
export const setFeatureOverride = (featureName: string, value: boolean): void => {
  featureOverrides[featureName] = value;
};

/**
 * Clear a feature override and return to using the performance level setting
 */
export const clearFeatureOverride = (featureName: string): void => {
  delete featureOverrides[featureName];
};

/**
 * Set performance level manually
 */
export const setPerformanceLevel = (level: 'high' | 'medium' | 'low' | 'minimal'): void => {
  if (PERFORMANCE_CONFIGS.hasOwnProperty(level)) {
    performanceLevel = level;
    console.log(`Performance level manually set to: ${level}`);
  }
};
