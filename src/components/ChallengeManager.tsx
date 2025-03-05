
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

interface ChallengeManagerProps {
  userProfile: any;
  activatedChakras: number[];
  updateUserProfile: (data: any) => void;
  updateActivatedChakras: (chakras: number[]) => void;
  children: (handleChallengeComplete: (pointsEarned: number, emotionalInsights?: any) => void) => React.ReactNode;
}

const ChallengeManager: React.FC<ChallengeManagerProps> = ({
  userProfile,
  activatedChakras,
  updateUserProfile,
  updateActivatedChakras,
  children
}) => {
  const { toast } = useToast();

  const handleChallengeComplete = async (pointsEarned: number, emotionalInsights?: any) => {
    if (!userProfile) return;
    
    updateUserProfile({
      energy_points: userProfile.energy_points + pointsEarned
    });
    
    if (emotionalInsights && emotionalInsights.chakrasActivated && emotionalInsights.chakrasActivated.length > 0) {
      const newChakras = [...activatedChakras];
      emotionalInsights.chakrasActivated.forEach((chakraIndex: number) => {
        if (!newChakras.includes(chakraIndex)) {
          newChakras.push(chakraIndex);
        }
      });
      
      updateActivatedChakras(newChakras);
      
      const newlyActivated = emotionalInsights.chakrasActivated.filter(
        (chakra: number) => !activatedChakras.includes(chakra)
      );
      
      let chakraMessage = '';
      if (newlyActivated.length > 0) {
        chakraMessage = ` Your ${CHAKRA_NAMES[newlyActivated[0]]} chakra energy is awakening.`;
      }
      
      toast({
        title: "Energy Points Increased!",
        description: `+${pointsEarned} points added to your profile.${chakraMessage}`,
      });
    } else {
      toast({
        title: "Energy Points Increased!",
        description: `+${pointsEarned} points added to your profile`,
      });
    }
  };

  return <>{children(handleChallengeComplete)}</>;
};

export default ChallengeManager;
