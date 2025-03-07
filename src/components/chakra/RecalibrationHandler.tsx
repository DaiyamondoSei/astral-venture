
import React from 'react';
import { ChakraActivationService } from '@/services/chakra/ChakraActivationService';
import { handleError } from '@/utils/errorHandling';

export interface RecalibrationHandlerProps {
  userId: string;
  activatedChakras: number[];
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
  updateStreak: (newStreak: number) => Promise<number | undefined>;
}

const RecalibrationHandler: React.FC<RecalibrationHandlerProps> = ({
  userId,
  activatedChakras,
  updateActivatedChakras,
  updateUserProfile,
  updateStreak
}) => {
  const handleRecalibrationComplete = async (reflection: string): Promise<boolean> => {
    try {
      const result = await ChakraActivationService.recalibrateChakras(
        userId,
        activatedChakras,
        reflection
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
        if (result.newStreak) {
          await updateStreak(result.newStreak);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      handleError(error, "ChakraRecalibration");
      return false;
    }
  };

  return null; // This is a logic component, it doesn't render anything
};

export default RecalibrationHandler;
