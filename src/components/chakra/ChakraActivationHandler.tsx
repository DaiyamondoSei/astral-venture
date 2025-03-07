
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';

interface ChakraActivationHandlerProps {
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
  const { toast } = useToast();

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

  return { handleChakraActivation };
};

export default ChakraActivationHandler;
