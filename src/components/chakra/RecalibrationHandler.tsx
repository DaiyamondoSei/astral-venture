
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';

interface RecalibrationHandlerProps {
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
  const { toast } = useToast();

  const handleRecalibrationComplete = async (reflection: string) => {
    if (!userId) return;
    
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

  return { handleRecalibrationComplete };
};

export default RecalibrationHandler;
