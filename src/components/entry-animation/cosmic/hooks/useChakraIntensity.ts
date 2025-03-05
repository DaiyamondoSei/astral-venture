
import { useCallback } from 'react';
import { ENERGY_THRESHOLDS } from '../types';

export const useChakraIntensity = (
  energyPoints: number, 
  activatedChakras: number[] = []
) => {
  // Calculate chakra intensity based on progress
  const getChakraIntensity = useCallback((chakraIndex: number) => {
    if (energyPoints < ENERGY_THRESHOLDS.CHAKRAS) return 0;
    
    // If chakra is in the activated list, show it at full intensity
    if (activatedChakras.includes(chakraIndex)) {
      return 1;
    }
    
    const chakraActivationPoints = 
      ENERGY_THRESHOLDS.CHAKRAS + (chakraIndex * 15);
      
    if (energyPoints < chakraActivationPoints) return 0.3;
    if (energyPoints < chakraActivationPoints + 50) return 0.6;
    return 1;
  }, [energyPoints, activatedChakras]);

  return getChakraIntensity;
};
