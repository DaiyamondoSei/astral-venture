
import { useContext } from 'react';
import { PerfConfigContext, PerfConfigContextType } from '@/contexts/PerfConfigContext';

/**
 * Hook to access performance configuration
 */
export function usePerfConfig(): PerfConfigContextType {
  const context = useContext(PerfConfigContext);
  
  if (!context) {
    // Return default configuration if context is not available
    return {
      enablePerformanceTracking: process.env.NODE_ENV === 'development',
      enableRenderTracking: process.env.NODE_ENV === 'development',
      enableValidation: process.env.NODE_ENV === 'development',
      enablePropTracking: process.env.NODE_ENV === 'development',
      enableDebugLogging: false,
      setPerformanceConfig: () => {}
    };
  }
  
  return context;
}
