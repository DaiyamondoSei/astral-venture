
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * useAstralDemo Hook
 * 
 * Manages the state for the AstralBodyDemo page
 * 
 * @returns The state and handlers for the AstralBodyDemo page
 */
export const useAstralDemo = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const [simulatedPoints, setSimulatedPoints] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [incrementAmount, setIncrementAmount] = useState<number>(50);
  
  // Get the actual energy points from the user profile, or use simulated points
  const energyPoints = isSimulating 
    ? simulatedPoints 
    : (userProfile?.energy_points || 0);

  return {
    userProfile,
    updateUserProfile,
    simulatedPoints,
    setSimulatedPoints,
    isSimulating,
    setIsSimulating,
    incrementAmount,
    setIncrementAmount,
    energyPoints
  };
};
