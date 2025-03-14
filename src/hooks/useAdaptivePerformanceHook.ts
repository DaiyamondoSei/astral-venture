
import { useContext } from 'react';
import { DeviceCapability, DeviceCapabilities, PerformanceMode } from '@/types/core/performance/constants';

// Interface for the features that can be turned on/off based on device capability
export interface AdaptiveFeatures {
  enableParticles: boolean;
  enableComplexAnimations: boolean;
  enableHighResImages: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableWebWorkers: boolean;
}

// Web vitals metrics
export interface WebVitals {
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  domLoad?: number;
  fullLoad?: number;
  fps?: number;
}

// Context type
export interface AdaptivePerformanceContextValue {
  // Device capability
  deviceCapability: DeviceCapability;
  // Manual override for performance mode
  manualPerformanceMode: PerformanceMode;
  // Feature flags based on device capability
  features: AdaptiveFeatures;
  webVitals?: WebVitals;
  // Functions
  setManualPerformanceMode: (mode: PerformanceMode) => void;
  adaptElementCount: (baseCount: number) => number;
}

// Fallback implementation since we can't modify the original context
export function useAdaptivePerformanceHook(): AdaptivePerformanceContextValue {
  // This is a placeholder implementation since we can't access the actual context
  // It will be used when the original hook throws errors
  
  const defaultContextValue: AdaptivePerformanceContextValue = {
    deviceCapability: DeviceCapabilities.MEDIUM,
    manualPerformanceMode: 'auto',
    features: {
      enableParticles: true,
      enableComplexAnimations: true,
      enableHighResImages: false,
      enableBlur: true,
      enableShadows: true,
      enableWebWorkers: false
    },
    webVitals: {
      fps: 60
    },
    setManualPerformanceMode: () => console.warn('AdaptivePerformanceContext not available - using fallback'),
    adaptElementCount: (baseCount: number) => Math.max(3, Math.floor(baseCount * 0.7))
  };
  
  return defaultContextValue;
}

export default useAdaptivePerformanceHook;
