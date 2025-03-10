
import { useContext } from 'react';
import PerfConfigContext, { PerfConfigContextType } from '@/contexts/PerfConfigContext';

// Define type for performance configuration
export interface PerfConfig {
  // Resource management
  maxParticles: number;
  effectsQuality: 'low' | 'medium' | 'high';
  animationFrameRate: number;
  
  // Animation settings
  useLightweightAnimations: boolean;
  disableParallaxEffects: boolean;
  
  // DOM optimization
  batchDomUpdates: boolean;
  virtualizeLists: boolean;
  
  // Performance features
  enableHighPerformanceMode?: boolean;
  enableAdaptiveRendering?: boolean;
  enableMetricsCollection?: boolean;
  
  // Animation controls
  animations?: {
    reduceMotion?: boolean;
    enableFancyTransitions?: boolean;
  };
  
  // Resource loading
  lazyLoading?: {
    enabled?: boolean;
    threshold?: number;
  };
  
  // Monitoring
  monitoring?: {
    enabled?: boolean;
    sampleRate?: number;
  };
}

// Define default configurations for different device capabilities
export const defaultConfigs: Record<'low' | 'medium' | 'high', PerfConfig> = {
  low: {
    maxParticles: 50,
    effectsQuality: 'low',
    animationFrameRate: 30,
    useLightweightAnimations: true,
    disableParallaxEffects: true,
    batchDomUpdates: true,
    virtualizeLists: true,
    enableHighPerformanceMode: false,
    enableAdaptiveRendering: true,
    enableMetricsCollection: false,
    animations: {
      reduceMotion: true,
      enableFancyTransitions: false
    },
    lazyLoading: {
      enabled: true,
      threshold: 0.3
    },
    monitoring: {
      enabled: false,
      sampleRate: 0.1
    }
  },
  medium: {
    maxParticles: 100,
    effectsQuality: 'medium',
    animationFrameRate: 45,
    useLightweightAnimations: false,
    disableParallaxEffects: false,
    batchDomUpdates: true,
    virtualizeLists: true,
    enableHighPerformanceMode: false,
    enableAdaptiveRendering: true,
    enableMetricsCollection: true,
    animations: {
      reduceMotion: false,
      enableFancyTransitions: false
    },
    lazyLoading: {
      enabled: true,
      threshold: 0.2
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.5
    }
  },
  high: {
    maxParticles: 200,
    effectsQuality: 'high',
    animationFrameRate: 60,
    useLightweightAnimations: false,
    disableParallaxEffects: false,
    batchDomUpdates: false,
    virtualizeLists: false,
    enableHighPerformanceMode: true,
    enableAdaptiveRendering: false,
    enableMetricsCollection: true,
    animations: {
      reduceMotion: false,
      enableFancyTransitions: true
    },
    lazyLoading: {
      enabled: false,
      threshold: 0
    },
    monitoring: {
      enabled: true,
      sampleRate: 1.0
    }
  }
};

/**
 * Custom hook to use the performance configuration context
 * 
 * @returns The performance configuration context
 * @throws Error if used outside of a PerfConfigProvider
 */
export const usePerfConfig = (): PerfConfigContextType => {
  const context = useContext(PerfConfigContext);
  
  if (!context) {
    throw new Error('usePerfConfig must be used within a PerfConfigProvider');
  }
  
  return context;
};

/**
 * Get the performance configuration for a specific device capability
 * 
 * @param deviceCapability - The device capability to get configuration for
 * @returns The performance configuration for the specified device capability
 */
export const getPerfConfigForCapability = (
  deviceCapability: 'low' | 'medium' | 'high'
): PerfConfig => {
  return defaultConfigs[deviceCapability];
};

/**
 * Get a safe configuration that works on all devices
 * This is useful for components that need to run in any environment
 * 
 * @returns Performance configuration safe for all device capabilities
 */
export const getSafeConfig = (): PerfConfig => {
  return defaultConfigs.low;
};

export default usePerfConfig;
