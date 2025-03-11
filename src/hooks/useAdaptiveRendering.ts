
/**
 * Hook for adaptive rendering based on device capability
 */
import { useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';

export interface AdaptiveRenderingOptions {
  // Visual features
  enableParticles?: boolean;
  enableAnimations?: boolean;
  enableBlur?: boolean;
  enableShadows?: boolean;
  
  // Content loading
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  
  // Rendering optimizations
  enableVirtualization?: boolean;
  enableThrottling?: boolean;
  
  // Custom thresholds
  lowPerformanceAdjustment?: number; // 0-1, how much to reduce complexity
  mediumPerformanceAdjustment?: number; // 0-1, how much to reduce complexity
}

export interface AdaptiveRenderingResult {
  // Feature flags
  shouldEnableParticles: boolean;
  shouldEnableAnimations: boolean;
  shouldEnableBlur: boolean;
  shouldEnableShadows: boolean;
  shouldEnableLazyLoading: boolean;
  shouldEnableImageOptimization: boolean;
  shouldEnableVirtualization: boolean;
  shouldEnableThrottling: boolean;
  
  // Adjustments
  complexityMultiplier: number; // 0-1, affects visual complexity
  qualityMultiplier: number; // 0-1, affects visual quality
  
  // Convenience properties
  isSimplifiedUI: boolean;
  deviceCapability: 'low' | 'medium' | 'high';
}

export function useAdaptiveRendering(options: AdaptiveRenderingOptions = {}): AdaptiveRenderingResult {
  const { 
    config,
    deviceCapability, 
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance
  } = usePerfConfig();
  
  // Destructure options with defaults
  const {
    enableParticles = true,
    enableAnimations = true,
    enableBlur = true,
    enableShadows = true,
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableVirtualization = true,
    enableThrottling = true,
    lowPerformanceAdjustment = 0.3, // Reduce complexity by 70%
    mediumPerformanceAdjustment = 0.7 // Reduce complexity by 30%
  } = options;
  
  // Whether adaptive rendering is enabled in the config
  const adaptiveRenderingEnabled = config.enableAdaptiveRendering;
  
  // Calculate adaptive rendering settings based on device capability
  return useMemo(() => {
    // Base values assuming high performance device
    let shouldEnableParticles = enableParticles;
    let shouldEnableAnimations = enableAnimations;
    let shouldEnableBlur = enableBlur;
    let shouldEnableShadows = enableShadows;
    let shouldEnableLazyLoading = enableLazyLoading;
    let shouldEnableImageOptimization = enableImageOptimization;
    let shouldEnableVirtualization = enableVirtualization;
    let shouldEnableThrottling = enableThrottling;
    let complexityMultiplier = 1.0;
    let qualityMultiplier = 1.0;
    
    // Apply adjustments if adaptive rendering is enabled
    if (adaptiveRenderingEnabled) {
      if (isLowPerformance) {
        // Low performance devices get significant reductions
        shouldEnableParticles = false;
        shouldEnableAnimations = false;
        shouldEnableBlur = false;
        shouldEnableShadows = false;
        shouldEnableLazyLoading = true;
        shouldEnableImageOptimization = true;
        shouldEnableVirtualization = true;
        shouldEnableThrottling = true;
        complexityMultiplier = lowPerformanceAdjustment;
        qualityMultiplier = lowPerformanceAdjustment;
      } else if (isMediumPerformance) {
        // Medium performance devices get moderate reductions
        shouldEnableParticles = enableParticles && false; // Disable particles by default
        shouldEnableAnimations = enableAnimations && true; // Keep basic animations
        shouldEnableBlur = enableBlur && false; // Disable blur effects
        shouldEnableShadows = enableShadows && true; // Keep simple shadows
        shouldEnableLazyLoading = true;
        shouldEnableImageOptimization = true;
        shouldEnableVirtualization = true;
        shouldEnableThrottling = true;
        complexityMultiplier = mediumPerformanceAdjustment;
        qualityMultiplier = mediumPerformanceAdjustment;
      }
    }
    
    return {
      shouldEnableParticles,
      shouldEnableAnimations,
      shouldEnableBlur,
      shouldEnableShadows,
      shouldEnableLazyLoading,
      shouldEnableImageOptimization,
      shouldEnableVirtualization,
      shouldEnableThrottling,
      complexityMultiplier,
      qualityMultiplier,
      isSimplifiedUI: isLowPerformance || (isMediumPerformance && adaptiveRenderingEnabled),
      deviceCapability
    };
  }, [
    adaptiveRenderingEnabled,
    deviceCapability,
    isLowPerformance,
    isMediumPerformance,
    isHighPerformance,
    enableParticles,
    enableAnimations,
    enableBlur,
    enableShadows,
    enableLazyLoading,
    enableImageOptimization,
    enableVirtualization,
    enableThrottling,
    lowPerformanceAdjustment,
    mediumPerformanceAdjustment
  ]);
}
