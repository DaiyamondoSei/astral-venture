
import { useState } from 'react';
import ChakraActivationHandler from '@/components/chakra/ChakraActivationHandler';
import RecalibrationHandler from '@/components/chakra/RecalibrationHandler';

export const useChakraActivation = ({
  userId,
  userStreak,
  activatedChakras,
  updateStreak,
  updateActivatedChakras,
  updateUserProfile
}: {
  userId: string;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
}) => {
  const [showRecalibration, setShowRecalibration] = useState(false);
  
  const { handleChakraActivation } = ChakraActivationHandler({
    userId,
    userStreak,
    activatedChakras,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile
  });
  
  const { handleRecalibrationComplete } = RecalibrationHandler({
    userId,
    activatedChakras,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile
  });
  
  return {
    handleChakraActivation,
    handleRecalibrationComplete,
    showRecalibration,
    setShowRecalibration
  };
};
