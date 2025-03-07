
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';

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
      
      // Check if this chakra was already activated today to prevent duplicates
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { data: existingActivations, error: checkError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', `chakra_${chakraIndex}`)
        .gte('completed_at', startOfDay)
        .lte('completed_at', endOfDay);
      
      if (checkError) {
        console.error('Error checking existing activations:', checkError);
        throw checkError;
      }
      
      if (existingActivations && existingActivations.length > 0) {
        console.log('Chakra already activated today:', existingActivations);
        toast({
          title: `${CHAKRA_NAMES[chakraIndex]} Chakra Already Active`,
          description: "You've already activated this chakra today.",
        });
        return;
      }
      
      // Insert new activation
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category: 'chakra_activation',
          challenge_id: `chakra_${chakraIndex}`,
          completed_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error inserting chakra activation:', error);
        throw error;
      }
      
      const pointsEarned = 10 + (chakraIndex * 5);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      if (newPoints !== undefined) {
        updateUserProfile({
          energy_points: newPoints
        });
      }
      
      // Update streak and activated chakras
      const newStreak = userStreak.current + 1;
      await updateStreak(newStreak);
      
      const newActivatedChakras = [...activatedChakras];
      if (!newActivatedChakras.includes(chakraIndex)) {
        newActivatedChakras.push(chakraIndex);
      }
      updateActivatedChakras(newActivatedChakras);
      
      toast({
        title: `${CHAKRA_NAMES[chakraIndex]} Chakra Activated!`,
        description: `+${pointsEarned} cosmic energy points earned`,
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
      const today = new Date();
      const currentDay = today.getDay();
      const allDays = Array.from({ length: currentDay + 1 }, (_, i) => i);
      const missedDays = allDays.filter(day => !activatedChakras.includes(day));
      
      if (missedDays.length === 0) {
        toast({
          title: "No Recalibration Needed",
          description: "You haven't missed any chakra activations.",
        });
        return false;
      }
      
      // Process each missed day
      for (const missedDay of missedDays) {
        // Check if this chakra was already recalibrated today
        const { data: existingRecalibrations, error: checkError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', `chakra_${missedDay}`)
          .eq('category', 'chakra_recalibration');
        
        if (checkError) throw checkError;
        
        // Skip if already recalibrated
        if (existingRecalibrations && existingRecalibrations.length > 0) {
          console.log('Chakra already recalibrated:', missedDay);
          continue;
        }
        
        await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            category: 'chakra_recalibration',
            challenge_id: `chakra_${missedDay}`,
            completed_at: new Date().toISOString(),
            reflection
          });
      }
      
      // Update activated chakras with newly recalibrated ones
      const newActivatedChakras = [...activatedChakras];
      missedDays.forEach(day => {
        if (!newActivatedChakras.includes(day)) {
          newActivatedChakras.push(day);
        }
      });
      updateActivatedChakras(newActivatedChakras);
      
      // Award points and update streak
      const pointsEarned = Math.max(5, missedDays.length * 2);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      if (newPoints !== undefined) {
        updateUserProfile({
          energy_points: newPoints
        });
      }
      
      const newStreak = Math.max(currentDay + 1, activatedChakras.length);
      await updateStreak(newStreak);
      
      toast({
        title: "Energy Recalibrated",
        description: `Your chakra flow has been restored. +${pointsEarned} energy points.`,
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
