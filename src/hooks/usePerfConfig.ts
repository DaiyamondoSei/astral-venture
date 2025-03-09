
import { useContext } from 'react';
import { PerfConfigContext, PerfConfigContextType } from '@/contexts/PerfConfigContext';

/**
 * Hook to access performance configuration with intelligent defaults
 */
export function usePerfConfig(): PerfConfigContextType {
  const context = useContext(PerfConfigContext);
  
  if (!context) {
    // Return safe defaults if context is not available
    // In production, most monitoring is disabled by default
    const isProd = process.env.NODE_ENV === 'production';
    
    return {
      // Core features - all disabled in production
      enablePerformanceTracking: !isProd,
      enableRenderTracking: false,
      enableValidation: false,
      enablePropTracking: false,
      enableDebugLogging: false,
      
      // Advanced settings with conservative defaults
      samplingRate: isProd ? 0.05 : 0.3, // Only 5% sampling in production
      throttleInterval: isProd ? 2000 : 500, // 2 seconds in production
      maxTrackedComponents: isProd ? 5 : 20,
      batchUpdates: true,
      
      // Optimizations always enabled
      intelligentProfiling: true,
      inactiveTabThrottling: true,
      
      // No-op functions that don't throw when context is missing
      setPerformanceConfig: () => {},
      applyPreset: () => {}
    };
  }
  
  return context;
}
