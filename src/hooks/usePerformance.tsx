
import { useContext } from 'react';
import { PerformanceContext } from '@/contexts/PerformanceContext';
import { 
  DeviceCapability, 
  PerformanceMode,
  QualityLevel
} from '@/types/core/performance';

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
        deviceCapability: 'medium' as DeviceCapability,
        disableAnimations: false,
        disableEffects: false
      },
      updateConfig: () => console.warn('PerformanceContext is not available'),
      
      // Derived state
      deviceCapability: 'medium' as DeviceCapability,
      isLowPerformance: false,
      
      // Feature flags based on configuration
      enableBlur: true,
      enableShadows: true,
      enableComplexAnimations: true,
      
      // Configuration export
      exportConfig: () => ({ success: false, error: 'PerformanceContext is not available' }),
    };
  }
  
  return context;
}

export default usePerformance;
