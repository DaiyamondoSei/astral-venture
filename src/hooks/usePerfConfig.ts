
/**
 * Hook for accessing and updating performance configuration
 */
import { useContext, useState, useEffect, useMemo } from 'react';
import PerformanceContext from '../contexts/PerformanceContext';
import { Result, success, failure } from '../utils/result/Result';
import { asyncResultify } from '../utils/result/AsyncResult';

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
  intelligentResourceLoadingn: boolean;
}

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
  intelligentResourceLoadingn: false
};

/**
 * Detect device capability
 */
function detectDeviceCapability(): 'low' | 'medium' | 'high' {
  // Client-side detection
  if (typeof window === 'undefined') {
    return 'medium';
  }
  
  // Check for stored preference
  const storedCapability = localStorage.getItem('deviceCapability') as 'low' | 'medium' | 'high' | null;
  if (storedCapability && ['low', 'medium', 'high'].includes(storedCapability)) {
    return storedCapability;
  }
  
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Device memory API (Chrome)
  const memory = (navigator as any).deviceMemory || 4;
  
  // CPU cores
  const cores = navigator.hardwareConcurrency || 4;
  
  // Determine capability
  if (isMobile && (memory < 4 || cores <= 4)) {
    return 'low';
  } else if (memory >= 8 && cores >= 8) {
    return 'high';
  } else {
    return 'medium';
  }
}

/**
 * Hook for accessing and updating performance configuration
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
  
  // Calculate derived properties
  const isLowPerformance = useMemo(() => mergedConfig.deviceCapability === 'low', [mergedConfig.deviceCapability]);
  const isMediumPerformance = useMemo(() => mergedConfig.deviceCapability === 'medium', [mergedConfig.deviceCapability]);
  const isHighPerformance = useMemo(() => mergedConfig.deviceCapability === 'high', [mergedConfig.deviceCapability]);
  
  // Determine if simplified UI should be used
  const shouldUseSimplifiedUI = useMemo(() => {
    return isLowPerformance || 
           (mergedConfig.enableAdaptiveRendering && !isHighPerformance);
  }, [isLowPerformance, isHighPerformance, mergedConfig.enableAdaptiveRendering]);
  
  // Check if we're in a context
  if (!context) {
    // Create a mini context for standalone usage
    const [config, setConfig] = useState<PerfConfig>(mergedConfig);
    
    const updateConfig = (updates: Partial<PerfConfig>) => {
      setConfig(prevConfig => ({
        ...prevConfig,
        ...updates
      }));
    };
    
    return {
      config,
      updateConfig,
      deviceCapability: config.deviceCapability || detectedCapability,
      isLowPerformance,
      isMediumPerformance,
      isHighPerformance,
      shouldUseSimplifiedUI
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
    shouldUseSimplifiedUI
  };
}
