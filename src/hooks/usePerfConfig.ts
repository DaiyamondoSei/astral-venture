
import { useContext } from 'react';
import PerfConfigContext, { PerfConfigContextType } from '@/contexts/PerfConfigContext';

// Define default configurations for different device capabilities
export const defaultConfigs = {
  low: {
    maxParticles: 50,
    effectsQuality: 'low',
    animationFrameRate: 30,
    useLightweightAnimations: true,
    disableParallaxEffects: true,
    batchDomUpdates: true,
    virtualizeLists: true,
  },
  medium: {
    maxParticles: 100,
    effectsQuality: 'medium',
    animationFrameRate: 45,
    useLightweightAnimations: false,
    disableParallaxEffects: false,
    batchDomUpdates: true,
    virtualizeLists: true,
  },
  high: {
    maxParticles: 200,
    effectsQuality: 'high',
    animationFrameRate: 60,
    useLightweightAnimations: false,
    disableParallaxEffects: false,
    batchDomUpdates: false,
    virtualizeLists: false,
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
): PerfConfigContextType['config'] => {
  return defaultConfigs[deviceCapability];
};

/**
 * Get a safe configuration that works on all devices
 * This is useful for components that need to run in any environment
 * 
 * @returns Performance configuration safe for all device capabilities
 */
export const getSafeConfig = (): PerfConfigContextType['config'] => {
  return defaultConfigs.low;
};

export default usePerfConfig;
