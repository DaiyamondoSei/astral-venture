
import { useCallback } from 'react';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';
import { usePerfConfig } from '@/hooks/usePerfConfig';
import { DeviceCapability } from '@/types/performance';

/**
 * Hook that provides a simplified interface for working with performance adaptations
 * without directly modifying protected performance components.
 */
export function usePerformanceAdapter() {
  const adaptivePerformance = useAdaptivePerformance();
  const { config, updateConfig } = usePerfConfig();
  
  // Get current device capability
  const getDeviceCapability = useCallback((): DeviceCapability => {
    return adaptivePerformance?.deviceCapability || 'medium';
  }, [adaptivePerformance]);
  
  // Check if the device is considered low performance
  const isLowPerformanceDevice = useCallback((): boolean => {
    return getDeviceCapability() === 'low' || config.disableAnimations;
  }, [getDeviceCapability, config.disableAnimations]);
  
  // Get appropriate quality level based on device capability
  const getQualityLevel = useCallback((): 'low' | 'medium' | 'high' => {
    const capability = getDeviceCapability();
    
    switch (capability) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      default:
        return 'medium';
    }
  }, [getDeviceCapability]);
  
  // Toggle performance features
  const toggleFeature = useCallback((featureName: keyof typeof config, value?: boolean) => {
    if (typeof value === 'boolean') {
      updateConfig({ [featureName]: value });
    } else {
      updateConfig({ [featureName]: !config[featureName] });
    }
  }, [config, updateConfig]);
  
  return {
    getDeviceCapability,
    isLowPerformanceDevice,
    getQualityLevel,
    toggleFeature,
    performanceConfig: config
  };
}
