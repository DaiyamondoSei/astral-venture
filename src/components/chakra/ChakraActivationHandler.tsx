
import React from 'react';
import { ChakraActivationService } from '@/services/chakra/ChakraActivationService';
import { handleError } from '@/utils/errorHandling';

export interface ChakraActivationHandlerProps {
  userId: string;
  activatedChakras: number[];
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  userStreak: { current: number; longest: number };
}

const ChakraActivationHandler: React.FC<ChakraActivationHandlerProps> = ({ 
  userId, 
  activatedChakras, 
  updateActivatedChakras, 
  updateUserProfile,
  updateStreak,
  userStreak
}) => {
  const handleChakraActivation = async (chakraIndex: number) => {
    try {
      const result = await ChakraActivationService.activateChakra(
        userId,
        chakraIndex,
        activatedChakras
      );
      
      if (result.success) {
        // Update activated chakras
        updateActivatedChakras(result.newActivatedChakras);
        
        // Update user profile with new points
        if (result.newPoints) {
          updateUserProfile({
            energyPoints: result.newPoints
          });
        }
        
        // Update streak if needed
        if (activatedChakras.length === 0 && chakraIndex === 0) {
          // First chakra of a new streak
          const newStreak = userStreak.current + 1;
          await updateStreak(newStreak);
        }
      }
    } catch (error) {
      handleError(error, "ChakraActivation");
    }
  };

  return null; // This is a logic component, it doesn't render anything
};

export default ChakraActivationHandler;
