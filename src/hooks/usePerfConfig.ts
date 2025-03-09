
import { useContext } from 'react';
import { PerfConfigContext, PerfConfig } from '@/contexts/PerfConfigContext';

/**
 * Hook to access and update performance configuration settings
 */
export const usePerfConfig = (): PerfConfig & { 
  updateConfig: (updates: Partial<PerfConfig>) => void 
} => {
  const { config, updateConfig } = useContext(PerfConfigContext);
  return { ...config, updateConfig };
};
