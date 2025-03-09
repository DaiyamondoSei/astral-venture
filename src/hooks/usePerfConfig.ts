
import { useContext } from 'react';
import { PerfConfigContext, PerfConfig } from '@/contexts/PerfConfigContext';

/**
 * Hook to access and update performance configuration settings
 */
export const usePerfConfig = (): PerfConfig & { 
  updateConfig: (updates: Partial<PerfConfig>) => void;
  applyPreset: (preset: 'comprehensive' | 'balanced' | 'minimal' | 'disabled') => void;
} => {
  const { config, updateConfig, applyPreset } = useContext(PerfConfigContext);
  return { ...config, updateConfig, applyPreset };
};
