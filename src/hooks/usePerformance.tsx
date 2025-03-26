
import { useContext } from 'react';
import { PerformanceContext } from '@/contexts/PerformanceContext';
import { 
  DeviceCapability, 
  PerformanceMode,
  QualityLevel
} from '@/types/core/performance/types';
import {
  DeviceCapabilities,
  PerformanceModes,
  QualityLevels
} from '@/types/core/performance/constants';

/**
 * Hook to access performance settings and capabilities
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    // Provide sensible defaults if context is missing
    return {
      // Core settings
      config: {
        deviceCapability: DeviceCapabilities.MEDIUM,
        disableAnimations: false,
        disableEffects: false,
        useManualCapability: false,
        enableAdaptiveRendering: true,
        enableProgressiveEnhancement: true,
        resourceOptimizationLevel: 'conservative',
      },
      updateConfig: () => console.warn('PerformanceContext is not available'),
      
      // Derived state
      deviceCapability: DeviceCapabilities.MEDIUM,
      isLowPerformance: false,
      isMediumPerformance: true,
      isHighPerformance: false,
      
      // Feature flags based on configuration
      enableBlur: true,
      enableShadows: true,
      enableComplexAnimations: true,
      
      // Configuration export
      exportConfig: () => ({ 
        type: 'failure',
        error: new Error('PerformanceContext is not available')
      }),
    };
  }
  
  return context;
}

export default usePerformance;
