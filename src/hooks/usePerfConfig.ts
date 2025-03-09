
import { useContext } from 'react';
import PerfConfigContext, { PerfConfigContextType } from '@/contexts/PerfConfigContext';

// Custom hook to use the performance configuration
export const usePerfConfig = (): PerfConfigContextType => {
  const context = useContext(PerfConfigContext);
  if (!context) {
    throw new Error('usePerfConfig must be used within a PerfConfigProvider');
  }
  return context;
};

export default usePerfConfig;
