
/**
 * Adaptive Performance Optimization
 * 
 * System for automatically adjusting rendering quality and features
 * based on device capability and performance metrics.
 */
import { detectDeviceCapability } from '../../hooks/usePerfConfig';
import { perfMetricsCollector } from './perfMetricsCollector';

// Feature configuration based on performance level
export interface AdaptiveFeatureConfig {
  enableParticles: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableAnimations: boolean;
  enableHighResImages: boolean;
  enableVirtualization: boolean;
  maxElementsPerPage: number;
  prefetchLinks: boolean;
  enableOffscreenRendering: boolean;
  useLightweightComponents: boolean;
}

// Performance level configurations
const performanceConfigs: Record<'low' | 'medium' | 'high', AdaptiveFeatureConfig> = {
  low: {
    enableParticles: false,
    enableBlur: false,
    enableShadows: false,
    enableAnimations: false,
    enableHighResImages: false,
    enableVirtualization: true,
    maxElementsPerPage: 500,
    prefetchLinks: false,
    enableOffscreenRendering: true,
    useLightweightComponents: true
  },
  medium: {
    enableParticles: true,
    enableBlur: false,
    enableShadows: true,
    enableAnimations: true,
    enableHighResImages: false,
    enableVirtualization: true,
    maxElementsPerPage: 1000,
    prefetchLinks: true,
    enableOffscreenRendering: true,
    useLightweightComponents: false
  },
  high: {
    enableParticles: true,
    enableBlur: true,
    enableShadows: true,
    enableAnimations: true,
    enableHighResImages: true,
    enableVirtualization: false,
    maxElementsPerPage: 2000,
    prefetchLinks: true,
    enableOffscreenRendering: false,
    useLightweightComponents: false
  }
};

// Cache performance config to avoid repeated calculations
let cachedConfig: AdaptiveFeatureConfig | null = null;
let cachedPerformanceLevel: 'low' | 'medium' | 'high' | null = null;
let configCacheTimestamp = 0;
const CONFIG_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Performance budget tracking
interface PerformanceBudget {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  interactionTime: number;
}

const budgetThresholds: Record<'low' | 'medium' | 'high', PerformanceBudget> = {
  low: { fps: 30, memoryUsage: 50, renderTime: 33, interactionTime: 100 },
  medium: { fps: 45, memoryUsage: 70, renderTime: 22, interactionTime: 50 },
  high: { fps: 60, memoryUsage: 90, renderTime: 16, interactionTime: 30 }
};

// Monitor object for tracking performance metrics
const performanceMonitor = {
  lastFpsTimestamp: 0,
  frameCount: 0,
  currentFps: 60,
  averageRenderTime: 16,
  averageInteractionTime: 50,
  memoryUsage: 0,
  performanceBudget: budgetThresholds.medium,
  
  // Update FPS counter
  updateFps() {
    const now = performance.now();
    this.frameCount++;
    
    // Calculate FPS every second
    if (now - this.lastFpsTimestamp >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTimestamp = now;
      
      // Track in metrics collector
      perfMetricsCollector.addMetric({
        metric_name: 'fps',
        value: this.currentFps,
        type: 'performance',
        category: 'rendering'
      });
    }
  },
  
  // Update memory usage if available
  updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      if (memory) {
        const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        this.memoryUsage = usedRatio * 100; // Convert to percentage
        
        // Track in metrics collector
        perfMetricsCollector.addMetric({
          metric_name: 'memoryUsage',
          value: this.memoryUsage,
          type: 'performance',
          category: 'memory'
        });
      }
    }
  },
  
  // Check if performance is within budget
  isWithinBudget(): boolean {
    const { fps, memoryUsage, renderTime, interactionTime } = this.performanceBudget;
    
    return (
      this.currentFps >= fps &&
      this.memoryUsage <= memoryUsage &&
      this.averageRenderTime <= renderTime &&
      this.averageInteractionTime <= interactionTime
    );
  },
  
  // Start monitoring (call once at app startup)
  startMonitoring() {
    // Setup RAF for FPS tracking
    const trackFrame = () => {
      this.updateFps();
      requestAnimationFrame(trackFrame);
    };
    
    requestAnimationFrame(trackFrame);
    
    // Setup memory usage tracking
    setInterval(() => this.updateMemoryUsage(), 10000);
    
    // Set budget based on detected capability
    const capability = detectDeviceCapability();
    this.performanceBudget = budgetThresholds[capability];
  }
};

/**
 * Get the adaptive feature configuration based on device capability
 * and current performance metrics
 */
export function getAdaptiveConfig(
  overrides: Partial<AdaptiveFeatureConfig> = {}
): AdaptiveFeatureConfig {
  const now = Date.now();
  
  // Check if we have a cached config and it's still valid
  if (
    cachedConfig && 
    cachedPerformanceLevel && 
    now - configCacheTimestamp < CONFIG_CACHE_DURATION
  ) {
    // Apply any overrides to cached config
    if (Object.keys(overrides).length > 0) {
      return {
        ...cachedConfig,
        ...overrides
      };
    }
    
    return cachedConfig;
  }
  
  // Detect device capability
  const capability = detectDeviceCapability();
  let config = performanceConfigs[capability];
  
  // Check if we need to downgrade based on performance metrics
  if (capability !== 'low' && !performanceMonitor.isWithinBudget()) {
    // Downgrade one level
    const downgradedLevel = capability === 'high' ? 'medium' : 'low';
    config = performanceConfigs[downgradedLevel];
    
    // Track this downgrade
    perfMetricsCollector.addMetric({
      metric_name: 'performanceLevelDowngrade',
      value: 1,
      type: 'performance',
      category: 'adaptation',
      metadata: {
        from: capability,
        to: downgradedLevel,
        fps: performanceMonitor.currentFps,
        memoryUsage: performanceMonitor.memoryUsage,
        renderTime: performanceMonitor.averageRenderTime,
        interactionTime: performanceMonitor.averageInteractionTime
      }
    });
    
    // Store the downgraded level
    cachedPerformanceLevel = downgradedLevel;
  } else {
    // Store the original level
    cachedPerformanceLevel = capability;
  }
  
  // Apply overrides
  const finalConfig = {
    ...config,
    ...overrides
  };
  
  // Cache the result
  cachedConfig = finalConfig;
  configCacheTimestamp = now;
  
  return finalConfig;
}

/**
 * Start adaptive performance monitoring
 */
export function initAdaptivePerformance(): void {
  performanceMonitor.startMonitoring();
}

/**
 * Update adaptive performance metrics with recent data
 */
export function updatePerformanceMetrics(
  renderTime: number,
  interactionTime?: number
): void {
  // Update average render time with exponential moving average
  performanceMonitor.averageRenderTime = 
    performanceMonitor.averageRenderTime * 0.9 + renderTime * 0.1;
  
  // Update interaction time if provided
  if (typeof interactionTime === 'number') {
    performanceMonitor.averageInteractionTime =
      performanceMonitor.averageInteractionTime * 0.9 + interactionTime * 0.1;
  }
}

/**
 * Check if a feature should be enabled based on current performance level
 */
export function shouldEnableFeature(
  featureName: keyof AdaptiveFeatureConfig,
  manualOverride?: boolean
): boolean {
  // Honor manual override if provided
  if (typeof manualOverride === 'boolean') {
    return manualOverride;
  }
  
  // Get current adaptive config
  const config = getAdaptiveConfig();
  
  // Return feature state
  return config[featureName];
}

/**
 * Create throttled function based on performance level
 */
export function createAdaptiveThrottle<T extends (...args: any[]) => any>(
  fn: T,
  baseThresholdMs: number = 100
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  // Adjust threshold based on performance level
  const capability = cachedPerformanceLevel || detectDeviceCapability();
  const adjustedThreshold = 
    capability === 'low' ? baseThresholdMs * 2 :
    capability === 'medium' ? baseThresholdMs * 1.5 :
    baseThresholdMs;
  
  let lastCall = 0;
  let lastResult: ReturnType<T>;
  
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    
    if (now - lastCall >= adjustedThreshold) {
      lastResult = fn(...args);
      lastCall = now;
      return lastResult;
    }
    
    return lastResult;
  };
}

export default {
  getAdaptiveConfig,
  initAdaptivePerformance,
  updatePerformanceMetrics,
  shouldEnableFeature,
  createAdaptiveThrottle
};
