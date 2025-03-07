
import { useCallback, useMemo } from 'react';
import { ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';

/**
 * Hook to calculate the intensity of chakras based on energy points and activated chakras
 */
export const useChakraIntensity = (
  energyPoints: number, 
  activatedChakras: number[] = []
) => {
  // Pre-calculate the chakra activation thresholds
  const chakraThresholds = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => 
      ENERGY_THRESHOLDS.CHAKRAS + (i * 15)
    );
  }, []);
  
  // Calculate chakra intensity based on progress and activation state
  const getChakraIntensity = useCallback((chakraIndex: number) => {
    // Early return if energy is below the base threshold for chakras
    if (energyPoints < ENERGY_THRESHOLDS.CHAKRAS) return 0;
    
    // If chakra is in the activated list, show it at full intensity
    if (activatedChakras.includes(chakraIndex)) {
      return 1;
    }
    
    const chakraActivationPoints = chakraThresholds[chakraIndex];
      
    if (energyPoints < chakraActivationPoints) return 0.3;
    if (energyPoints < chakraActivationPoints + 50) return 0.6;
    return 0.8; // Not fully activated but high energy
  }, [energyPoints, activatedChakras, chakraThresholds]);

  return getChakraIntensity;
};
