
import { useContext } from 'react';
import { PerformanceContext } from '@/contexts/PerformanceContext';

/**
 * Hook to use performance context
 */
export function usePerformance() {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
}

export default usePerformance;
