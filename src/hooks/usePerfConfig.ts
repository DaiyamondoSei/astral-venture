
/**
 * Hook for accessing and updating performance configuration
 * with advanced capability detection and adaptive settings
 */
import { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PerformanceContext from '../contexts/PerformanceContext';
import { Result, success, failure } from '../utils/result/Result';
import { perfMetricsCollector } from '../utils/performance/perfMetricsCollector';

/**
 * Comprehensive performance configuration interface
 */
export interface PerfConfig {
  // Core configuration
  enableMetricsCollection: boolean;
  enablePerformanceTracking: boolean;
  enableAdaptiveRendering: boolean;
  
  // Thresholds and limits
  slowRenderThreshold: number;
  samplingRate: number;
  
  // Device capability
  deviceCapability?: 'low' | 'medium' | 'high';
  
  // Debug settings
  debugMode: boolean;
  
  // Enhanced capabilities
  monitorMemoryUsage: boolean;
  trackComponentSize: boolean;
  optimizeOffscreenRendering: boolean;
  batchStateUpdates: boolean;
  intelligentResourceLoading: boolean;
  
  // Feature flags
  enableRenderTracking: boolean;
  enableValidation: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Advanced features
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  throttleInterval: number;
  maxTrackedComponents: number;
}

/**
 * Default performance configuration
 */
export const DEFAULT_PERF_CONFIG: PerfConfig = {
  enableMetricsCollection: true,
  enablePerformanceTracking: true,
  enableAdaptiveRendering: true,
  slowRenderThreshold: 16, // 60fps threshold
  samplingRate: 0.1, // Sample 10% of metrics
  debugMode: false,
  
  // Enhanced capabilities
  monitorMemoryUsage: false,
  trackComponentSize: true,
  optimizeOffscreenRendering: true,
  batchStateUpdates: true,
  intelligentResourceLoading: false,
  
  // Feature flags
  enableRenderTracking: true,
  enableValidation: true,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  // Advanced features
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  batchUpdates: true,
  throttleInterval: 1000,
  maxTrackedComponents: 100
};

/**
 * Cache for device capability to avoid repeated calculations
 */
let cachedCapability: 'low' | 'medium' | 'high' | null = null;
let capabilityCacheTimestamp = 0;
const CAPABILITY_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Detect device capability based on hardware and environment
 * @returns The detected device capability
 */
export function detectDeviceCapability(): 'low' | 'medium' | 'high' {
  // Use cached capability if still valid
  const now = Date.now();
  if (cachedCapability && (now - capabilityCacheTimestamp) < CAPABILITY_CACHE_DURATION) {
    return cachedCapability;
  }
  
  // Server-side detection fallback
  if (typeof window === 'undefined') {
    return 'medium';
  }
  
  // Check for stored preference
  const storedCapability = localStorage.getItem('deviceCapability') as 'low' | 'medium' | 'high' | null;
  if (storedCapability && ['low', 'medium', 'high'].includes(storedCapability)) {
    cachedCapability = storedCapability;
    capabilityCacheTimestamp = now;
    return storedCapability;
  }
  
  // More efficient mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent);
  
  // Device memory API (Chrome)
  const memory = (navigator as any).deviceMemory || 4;
  
  // CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  
  // Determine capability
  let capability: 'low' | 'medium' | 'high';
  
  if (isMobile && (memory < 4 || cores <= 4)) {
    capability = 'low';
  } else if (memory >= 8 && cores >= 8) {
    capability = 'high';
  } else {
    capability = 'medium';
  }
  
  // Cache capability
  cachedCapability = capability;
  capabilityCacheTimestamp = now;
  
  // Store for future use
  try {
    localStorage.setItem('deviceCapability', capability);
  } catch (e) {
    // Ignore storage errors
  }
  
  return capability;
}

/**
 * Hook for accessing and updating performance configuration
 * with device capability detection and derived properties
 */
export function usePerfConfig() {
  const context = useContext(PerformanceContext);
  
  // Detect device capability if not provided by context
  const detectedCapability = useMemo(() => {
    return detectDeviceCapability();
  }, []);
  
  // Merge context config with detected capability
  const mergedConfig = useMemo(() => {
    if (!context) {
      return {
        ...DEFAULT_PERF_CONFIG,
        deviceCapability: detectedCapability
      };
    }
    
    return {
      ...context.config,
      deviceCapability: context.config.deviceCapability || detectedCapability
    };
  }, [context, detectedCapability]);
  
  // Update metrics collector configuration
  useEffect(() => {
    if (mergedConfig) {
      perfMetricsCollector.setEnabled(mergedConfig.enableMetricsCollection);
      perfMetricsCollector.setSamplingRate(mergedConfig.samplingRate);
    }
  }, [
    mergedConfig.enableMetricsCollection,
    mergedConfig.samplingRate
  ]);
  
  // Calculate derived properties
  const isLowPerformance = useMemo(() => 
    mergedConfig.deviceCapability === 'low', 
    [mergedConfig.deviceCapability]
  );
  
  const isMediumPerformance = useMemo(() => 
    mergedConfig.deviceCapability === 'medium', 
    [mergedConfig.deviceCapability]
  );
  
  const isHighPerformance = useMemo(() => 
    mergedConfig.deviceCapability === 'high', 
    [mergedConfig.deviceCapability]
  );
  
  // Determine if simplified UI should be used
  const shouldUseSimplifiedUI = useMemo(() => {
    return isLowPerformance || 
           (mergedConfig.enableAdaptiveRendering && !isHighPerformance);
  }, [isLowPerformance, isHighPerformance, mergedConfig.enableAdaptiveRendering]);
  
  /**
   * Apply a preset configuration
   */
  const applyPreset = useCallback((presetName: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => {
    if (!context) return;
    
    let updates: Partial<PerfConfig> = {};
    
    switch (presetName) {
      case 'comprehensive':
        updates = {
          enableMetricsCollection: true,
          enablePerformanceTracking: true,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: true,
          enableDebugLogging: true,
          samplingRate: 1.0,
          intelligentProfiling: true,
          debugMode: true
        };
        break;
        
      case 'balanced':
        updates = {
          enableMetricsCollection: true,
          enablePerformanceTracking: true,
          enableRenderTracking: true,
          enableValidation: true,
          enablePropTracking: false,
          enableDebugLogging: false,
          samplingRate: 0.3,
          intelligentProfiling: false,
          debugMode: false
        };
        break;
        
      case 'minimal':
        updates = {
          enableMetricsCollection: true,
          enablePerformanceTracking: true,
          enableRenderTracking: false,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          samplingRate: 0.1,
          intelligentProfiling: false,
          debugMode: false
        };
        break;
        
      case 'disabled':
        updates = {
          enableMetricsCollection: false,
          enablePerformanceTracking: false,
          enableRenderTracking: false,
          enableValidation: false,
          enablePropTracking: false,
          enableDebugLogging: false,
          intelligentProfiling: false,
          debugMode: false
        };
        break;
    }
    
    context.updateConfig(updates);
  }, [context]);
  
  // Standalone mode (no context)
  if (!context) {
    // Create a mini context for standalone usage
    const [config, setConfig] = useState<PerfConfig>(mergedConfig);
    
    const updateConfig = useCallback((updates: Partial<PerfConfig>) => {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...updates
      }));
    }, []);
    
    return {
      config,
      updateConfig,
      deviceCapability: config.deviceCapability || detectedCapability,
      isLowPerformance,
      isMediumPerformance,
      isHighPerformance,
      shouldUseSimplifiedUI,
      applyPreset
    };
  }
  
  // Using with context
  return {
    config: mergedConfig,
    updateConfig: context.updateConfig,
    deviceCapability: mergedConfig.deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    shouldUseSimplifiedUI,
    applyPreset
  };
}
