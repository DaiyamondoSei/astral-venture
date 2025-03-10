
import { useContext } from 'react';
import PerfConfigContext, { PerfConfigContextType } from '@/contexts/PerfConfigContext';

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

export default usePerfConfig;
