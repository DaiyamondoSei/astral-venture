
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChakraActivationService } from '@/services/chakra/ChakraActivationService';

interface ChakraActivationProps {
  userId: string;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
}

interface ChakraActivationResult {
  handleChakraActivation: (chakraIndex: number) => Promise<void>;
  handleRecalibrationComplete: (reflection: string) => Promise<boolean>;
  showRecalibration: boolean;
  setShowRecalibration: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * A hook that handles chakra activation and recalibration functionality
 */
export const useChakraActivation = ({
  userId,
  userStreak,
  activatedChakras,
  updateStreak,
  updateActivatedChakras,
  updateUserProfile
}: ChakraActivationProps): ChakraActivationResult => {
  const [showRecalibration, setShowRecalibration] = useState(false);
  const { toast } = useToast();
  
  /**
   * Handles the activation of a specific chakra
   */
  const handleChakraActivation = async (chakraIndex: number) => {
    if (!userId) {
      console.log('No user ID provided for chakra activation');
      return;
    }
    
    try {
      console.log('Activating chakra:', chakraIndex, 'for user:', userId);
      
      const result = await ChakraActivationService.activateChakra(
        userId, 
        chakraIndex,
        activatedChakras
      );
      
      if (!result.success) {
        if (result.alreadyActivated) {
          toast({
            title: `${result.chakraName} Chakra Already Active`,
            description: "You've already activated this chakra today.",
          });
        }
        return;
      }
      
      // Update user profile with new points
      if (result.newPoints !== undefined) {
        updateUserProfile({
          energy_points: result.newPoints
        });
      }
      
      // Update streak
      const newStreak = userStreak.current + 1;
      await updateStreak(newStreak);
      
      // Update activated chakras
      updateActivatedChakras(result.newActivatedChakras);
      
      toast({
        title: `${result.chakraName} Chakra Activated!`,
        description: `+${result.pointsEarned} cosmic energy points earned`,
      });
      
    } catch (error: any) {
      console.error('Error activating chakra:', error);
      toast({
        title: "Activation failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  /**
   * Handles the completion of chakra recalibration
   */
  const handleRecalibrationComplete = async (reflection: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const result = await ChakraActivationService.recalibrateChakras(
        userId,
        activatedChakras,
        reflection
      );
      
      if (!result.success) {
        if (result.noRecalibrationNeeded) {
          toast({
            title: "No Recalibration Needed",
            description: "You haven't missed any chakra activations.",
          });
        }
        return false;
      }
      
      // Update activated chakras
      updateActivatedChakras(result.newActivatedChakras);
      
      // Update user profile with new points
      if (result.newPoints !== undefined) {
        updateUserProfile({
          energy_points: result.newPoints
        });
      }
      
      // Update streak
      await updateStreak(result.newStreak);
      
      toast({
        title: "Energy Recalibrated",
        description: `Your chakra flow has been restored. +${result.pointsEarned} energy points.`,
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Error completing recalibration:', error);
      toast({
        title: "Recalibration failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleChakraActivation,
    handleRecalibrationComplete,
    showRecalibration,
    setShowRecalibration
  };
};
