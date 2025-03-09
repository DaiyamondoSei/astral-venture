
import { useContext } from 'react';
import { PerfConfigContext, PerfConfigContextType } from '@/contexts/PerfConfigContext';

// Default safe configuration for production
const productionDefaults: PerfConfigContextType = {
  // Core features - all disabled in production
  enablePerformanceTracking: false,
  enableRenderTracking: false,
  enableValidation: false,
  enablePropTracking: false,
  enableDebugLogging: false,
  
  // Advanced settings with conservative defaults
  samplingRate: 0, // No sampling in production
  throttleInterval: 2000,
  maxTrackedComponents: 0,
  batchUpdates: true,
  
  // Optimizations always enabled
  intelligentProfiling: false,
  inactiveTabThrottling: true,
  
  // No-op functions
  setPerformanceConfig: () => {},
  applyPreset: () => {}
};

// Development defaults with reduced overhead
const developmentDefaults: PerfConfigContextType = {
  // Core features - selective enabling
  enablePerformanceTracking: true,
  enableRenderTracking: false, // Disabled by default
  enableValidation: false, // Disabled by default
  enablePropTracking: false, // Disabled by default
  enableDebugLogging: false, // Disabled by default
  
  // Advanced settings with balanced defaults
  samplingRate: 0.2, // Only 20% sampling by default
  throttleInterval: 1000, // 1 second throttle
  maxTrackedComponents: 15,
  batchUpdates: true,
  
  // Optimizations always enabled
  intelligentProfiling: true,
  inactiveTabThrottling: true,
  
  // No-op functions
  setPerformanceConfig: () => {},
  applyPreset: () => {}
};

/**
 * Hook to access performance configuration with intelligent defaults
 * and reduced overhead
 */
export function usePerfConfig(): PerfConfigContextType {
  // Return immediate production defaults if in production
  if (process.env.NODE_ENV === 'production') {
    return productionDefaults;
  }
  
  const context = useContext(PerfConfigContext);
  
  if (!context) {
    // Return development defaults if context is not available
    return developmentDefaults;
  }
  
  return context;
}
