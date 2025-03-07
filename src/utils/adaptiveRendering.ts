
import { getPerformanceCategory } from './performanceUtils';

type FeatureConfig = {
  low: number | boolean;
  medium: number | boolean;
  high: number | boolean;
};

/**
 * Adaptive rendering configuration system that automatically 
 * adjusts feature settings based on device capability
 */
export const adaptiveFeatures = {
  // Visual effects
  particles: {
    low: false,
    medium: true,
    high: true
  } as FeatureConfig,
  
  particleDensity: {
    low: 0.2,
    medium: 0.6,
    high: 1.0
  } as FeatureConfig,
  
  blurEffects: {
    low: false,
    medium: true,
    high: true
  } as FeatureConfig,
  
  shadows: {
    low: false,
    medium: true,
    high: true
  } as FeatureConfig,
  
  complexAnimations: {
    low: false,
    medium: true,
    high: true
  } as FeatureConfig,
  
  // Core functionality
  backgroundThreading: {
    low: false,
    medium: true,
    high: true
  } as FeatureConfig,
  
  throttledUpdates: {
    low: true,
    medium: true, 
    high: false
  } as FeatureConfig,
  
  // Asset loading
  imageQuality: {
    low: 'low',
    medium: 'medium',
    high: 'high'
  },
  
  preloadDepth: {
    low: 1,
    medium: 2,
    high: 3
  } as FeatureConfig
};

// Get appropriate setting based on device capability
export function getAdaptiveSetting<T>(featureKey: keyof typeof adaptiveFeatures): T {
  const deviceCapability = getPerformanceCategory();
  const feature = adaptiveFeatures[featureKey];
  
  if (!feature) {
    console.warn(`Feature ${featureKey} not found in adaptive features config`);
    return null as unknown as T;
  }
  
  return feature[deviceCapability] as unknown as T;
}

// Get numeric value with optional scaling factor
export function getScaledValue(
  featureKey: keyof typeof adaptiveFeatures, 
  baseValue: number
): number {
  const scaleFactor = getAdaptiveSetting<number>(featureKey);
  return baseValue * scaleFactor;
}

// Determine if a feature should be enabled
export function isFeatureEnabled(featureKey: keyof typeof adaptiveFeatures): boolean {
  return getAdaptiveSetting<boolean>(featureKey);
}

// Inject performance data attributes into DOM for CSS optimizations
export function setupAdaptiveCSS(): void {
  if (typeof document === 'undefined') return;
  
  const deviceCapability = getPerformanceCategory();
  document.documentElement.dataset.performance = deviceCapability;
  
  // Add specific feature flags as data attributes for CSS use
  Object.entries(adaptiveFeatures).forEach(([key, config]) => {
    const value = config[deviceCapability];
    if (typeof value === 'boolean') {
      document.documentElement.dataset[`feature${key.charAt(0).toUpperCase() + key.slice(1)}`] = 
        value ? 'enabled' : 'disabled';
    }
  });
}

// Automatically configure adaptive rendering on startup
export function initAdaptiveRendering(): void {
  setupAdaptiveCSS();
  
  // Log configuration in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Adaptive rendering initialized:', {
      deviceCapability: getPerformanceCategory(),
      particles: isFeatureEnabled('particles'),
      animations: isFeatureEnabled('complexAnimations'),
      threading: isFeatureEnabled('backgroundThreading')
    });
  }
}
