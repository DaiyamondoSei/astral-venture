
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';
import { supabase, incrementEnergyPoints } from '@/integrations/supabase/client';
import StreakTracker from '@/components/StreakTracker';
import RecalibrationDialog from '@/components/RecalibrationDialog';

interface ChakraActivationManagerProps {
  userId: string;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
}

const ChakraActivationManager: React.FC<ChakraActivationManagerProps> = ({
  userId,
  userStreak,
  activatedChakras,
  updateStreak,
  updateActivatedChakras,
  updateUserProfile
}) => {
  const [showRecalibration, setShowRecalibration] = useState(false);
  const { toast } = useToast();

  const handleChakraActivation = async (chakraIndex: number) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category: 'chakra_activation',
          challenge_id: `chakra_${chakraIndex}`,
          completed_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      const pointsEarned = 10 + (chakraIndex * 5);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      updateUserProfile({
        energy_points: newPoints
      });
      
      const newStreak = userStreak.current + 1;
      await updateStreak(newStreak);
      
      updateActivatedChakras([chakraIndex]);
      
      toast({
        title: `${CHAKRA_NAMES[chakraIndex]} Chakra Activated!`,
        description: `+${pointsEarned} cosmic energy points earned`,
      });
      
    } catch (error: any) {
      console.error('Error activating chakra:', error);
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRecalibrationComplete = async (reflection: string) => {
    if (!userId) return;
    
    try {
      const today = new Date();
      const currentDay = today.getDay();
      const allDays = Array.from({ length: currentDay }, (_, i) => i);
      const missedDays = allDays.filter(day => !activatedChakras.includes(day));
      
      for (const missedDay of missedDays) {
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
      
      updateActivatedChakras(missedDays);
      
      const pointsEarned = Math.max(5, missedDays.length * 2);
      const newPoints = await incrementEnergyPoints(userId, pointsEarned);
      
      updateUserProfile({
        energy_points: newPoints
      });
      
      const newStreak = currentDay + 1;
      await updateStreak(newStreak);
      
      setShowRecalibration(false);
      
      toast({
        title: "Energy Recalibrated",
        description: `Your chakra flow has been restored. +${pointsEarned} energy points.`,
      });
      
    } catch (error: any) {
      console.error('Error completing recalibration:', error);
      toast({
        title: "Recalibration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-8">
        <StreakTracker 
          currentStreak={userStreak.current}
          longestStreak={userStreak.longest}
          activatedChakras={activatedChakras}
          onChakraActivation={handleChakraActivation}
          onRecalibration={() => setShowRecalibration(true)}
        />
      </div>
      
      <RecalibrationDialog 
        open={showRecalibration}
        onOpenChange={setShowRecalibration}
        onComplete={handleRecalibrationComplete}
      />
    </>
  );
};

export default ChakraActivationManager;
