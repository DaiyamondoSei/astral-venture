
import { useMemo } from 'react';
import { usePerfConfig } from './usePerfConfig';
import { 
  getAdaptiveSetting, 
  isFeatureEnabled 
} from '@/utils/adaptiveRendering';

// Generic hook for adaptive rendering decisions
export const useAdaptiveRendering = () => {
  const { config } = usePerfConfig();
  const { deviceCapability } = config;
  
  const adaptiveSettings = useMemo(() => ({
    // Returns the appropriate value based on device capability
    getValue: <T,>(lowValue: T, mediumValue: T, highValue: T): T => {
      return getAdaptiveSetting(lowValue, mediumValue, highValue, deviceCapability);
    },
    
    // Checks if a feature should be enabled
    isEnabled: (featureName: string): boolean => {
      return isFeatureEnabled(featureName, deviceCapability);
    },
    
    // Get animation settings appropriate for device capability
    getAnimationSettings: (settingName: 'duration' | 'staggerDelay' | 'particleCount') => {
      const settings = {
        duration: {
          low: 0.2,
          medium: 0.5,
          high: 0.8
        },
        staggerDelay: {
          low: 0.03,
          medium: 0.08,
          high: 0.12
        },
        particleCount: {
          low: 10,
          medium: 30,
          high: 60
        }
      };
      
      return settings[settingName][deviceCapability];
    }
  }), [deviceCapability]);
  
  return adaptiveSettings;
};

export default useAdaptiveRendering;
