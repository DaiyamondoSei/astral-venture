
import { useState, useEffect, useRef } from 'react';
import { useVisibilityObserver } from './useVisibilityObserver';
import { getAdaptiveSetting, isFeatureEnabled } from '@/utils/adaptiveRendering';

interface AdaptiveRenderingOptions {
  // Whether to skip rendering entirely when not visible
  skipWhenInvisible?: boolean;
  // How much to throttle updates when not visible (ms)
  invisibleThrottleMs?: number;
  // Quality reduction when not visible (0-1)
  invisibleQualityFactor?: number;
  // Whether to pause animations when not visible
  pauseWhenInvisible?: boolean;
  // Whether to reduce detail when not visible
  reduceDetailWhenInvisible?: boolean;
  // Root margin for visibility detection
  rootMargin?: string;
}

interface AdaptiveRenderingResult {
  // Ref to attach to the element
  containerRef: (node: Element | null) => void;
  // Whether the element is currently visible
  isVisible: boolean;
  // Whether the element has ever been visible
  wasEverVisible: boolean;
  // Whether animations should be paused
  shouldPauseAnimations: boolean;
  // Factor to adjust quality (0-1)
  qualityFactor: number;
  // Whether rendering should be skipped entirely
  shouldSkipRender: boolean;
  // For performance-sensitive features
  shouldEnableFeature: (featureKey: string) => boolean;
}

/**
 * Hook for adapting rendering based on element visibility and device capability
 */
export function useAdaptiveRendering(options: AdaptiveRenderingOptions = {}): AdaptiveRenderingResult {
  const {
    skipWhenInvisible = false,
    invisibleThrottleMs = 500,
    invisibleQualityFactor = 0.5,
    pauseWhenInvisible = true,
    reduceDetailWhenInvisible = true,
    rootMargin = '100px'
  } = options;
  
  // Track last visibility change time for throttling
  const lastVisibilityChangeTime = useRef<number>(0);
  const [throttledIsVisible, setThrottledIsVisible] = useState<boolean>(false);
  
  // Use visibility observer to detect when element is in viewport
  const { setRef, isVisible, wasEverVisible } = useVisibilityObserver({
    rootMargin,
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Apply throttling to visibility changes to prevent rapid toggling
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastChange = now - lastVisibilityChangeTime.current;
    
    if (isVisible) {
      // Immediately update when becoming visible
      setThrottledIsVisible(true);
      lastVisibilityChangeTime.current = now;
    } else if (timeSinceLastChange > invisibleThrottleMs) {
      // Apply throttling when becoming invisible
      setThrottledIsVisible(false);
      lastVisibilityChangeTime.current = now;
    }
  }, [isVisible, invisibleThrottleMs]);
  
  // Calculate quality factor based on visibility
  const qualityFactor = throttledIsVisible 
    ? 1.0 
    : (reduceDetailWhenInvisible ? invisibleQualityFactor : 1.0);
  
  // Determine if animations should be paused
  const shouldPauseAnimations = pauseWhenInvisible && !throttledIsVisible && wasEverVisible;
  
  // Determine if rendering should be skipped entirely
  const shouldSkipRender = skipWhenInvisible && !throttledIsVisible && wasEverVisible;
  
  // Function to check if a specific feature should be enabled
  const shouldEnableFeature = (featureKey: string): boolean => {
    if (!throttledIsVisible && wasEverVisible) {
      // When not visible, disable optional features
      return false;
    }
    
    // Check against global feature flags (if it exists in that config)
    if (featureKey in (window as any).__featureFlags) {
      return (window as any).__featureFlags[featureKey];
    }
    
    // For keys that are in our adaptive rendering system
    if (featureKey in window && typeof isFeatureEnabled === 'function') {
      return isFeatureEnabled(featureKey as any);
    }
    
    return true; // Default to enabled
  };
  
  return {
    containerRef: setRef,
    isVisible: throttledIsVisible,
    wasEverVisible,
    shouldPauseAnimations,
    qualityFactor,
    shouldSkipRender,
    shouldEnableFeature
  };
}
