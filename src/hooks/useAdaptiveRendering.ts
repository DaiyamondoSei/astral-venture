
/**
 * Hook for adaptive rendering based on device performance capabilities
 */

import { useState, useEffect, useCallback } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';
import performanceOptimizer, { AdaptiveSettings, OptimizationDecision } from '../utils/performance/PerformanceOptimizer';

interface AdaptiveRenderingOptions {
  featureKey: keyof AdaptiveSettings;
  featureId?: string;
  defaultEnabled?: boolean;
  allowOverride?: boolean;
}

/**
 * Hook for determining whether a feature should be enabled based on performance
 */
export function useAdaptiveRendering(options: AdaptiveRenderingOptions): {
  isEnabled: boolean;
  reason: string;
  settings: AdaptiveSettings;
  override: (enabled: boolean) => void;
} {
  const {
    featureKey,
    featureId,
    defaultEnabled = true,
    allowOverride = true
  } = options;
  
  const { shouldUseSimplifiedUI, deviceCapability } = usePerformance();
  const [decision, setDecision] = useState<OptimizationDecision>({ 
    useFeature: defaultEnabled, 
    reason: 'Initial state'
  });
  const [overrideEnabled, setOverrideEnabled] = useState<boolean | null>(null);
  
  // Get the settings directly from the optimizer
  const settings = performanceOptimizer.getAdaptiveSettings();
  
  // Effect to determine if the feature should be enabled
  useEffect(() => {
    if (!shouldUseSimplifiedUI && defaultEnabled) {
      setDecision({ 
        useFeature: true, 
        reason: 'Adaptive rendering is disabled'
      });
      return;
    }
    
    const optimizerDecision = performanceOptimizer.shouldEnableFeature(featureKey, featureId);
    setDecision(optimizerDecision);
  }, [shouldUseSimplifiedUI, featureKey, featureId, defaultEnabled, deviceCapability]);
  
  // Function to override the decision
  const override = useCallback((enabled: boolean) => {
    if (allowOverride) {
      setOverrideEnabled(enabled);
    }
  }, [allowOverride]);
  
  // The actual enabled state, considering the override
  const isEnabled = overrideEnabled !== null ? overrideEnabled : decision.useFeature;
  
  return {
    isEnabled,
    reason: overrideEnabled !== null 
      ? `Manual override: feature ${overrideEnabled ? 'enabled' : 'disabled'}`
      : decision.reason,
    settings,
    override
  };
}

export default useAdaptiveRendering;
