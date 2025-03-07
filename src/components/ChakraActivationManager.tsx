
import React from 'react';
import StreakTracker from '@/components/StreakTracker';
import RecalibrationDialog from '@/components/RecalibrationDialog';
import { useChakraActivation } from '@/hooks/useChakraActivation';

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
  const {
    handleChakraActivation,
    handleRecalibrationComplete,
    showRecalibration,
    setShowRecalibration
  } = useChakraActivation({
    userId,
    userStreak,
    activatedChakras,
    updateStreak,
    updateActivatedChakras,
    updateUserProfile
  });

  return (
    <>
      <div className="mb-8">
        <StreakTracker 
          currentStreak={userStreak.current}
          longestStreak={userStreak.longest}
          activatedChakras={activatedChakras}
          userId={userId}
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
