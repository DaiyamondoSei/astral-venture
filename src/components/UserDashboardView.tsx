
import React from 'react';
import UserWelcome from '@/components/UserWelcome';
import CosmicAstralBody from '@/components/entry-animation/CosmicAstralBody';
import UserDashboardCards from '@/components/UserDashboardCards';
import MainContent from '@/components/MainContent';
import ChakraActivationManager from '@/components/ChakraActivationManager';

interface UserDashboardViewProps {
  user: any;
  userProfile: any;
  todayChallenge: any;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  onLogout: () => void;
  updateStreak: (newStreak: number) => Promise<number | undefined>;
  updateActivatedChakras: (newActivatedChakras: number[]) => void;
  updateUserProfile: (newData: any) => void;
  onChallengeComplete: (pointsEarned: number) => void;
}

const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  userProfile,
  todayChallenge,
  userStreak,
  activatedChakras,
  onLogout,
  updateStreak,
  updateActivatedChakras,
  updateUserProfile,
  onChallengeComplete
}) => {
  return (
    <>
      <UserWelcome 
        username={userProfile?.username || user.email?.split('@')[0] || 'Seeker'} 
        onLogout={onLogout}
        astralLevel={userProfile?.astral_level || 1}
      />
      
      <div className="mb-8">
        <CosmicAstralBody 
          energyPoints={userProfile?.energy_points || 0}
          streakDays={userStreak.current}
          activatedChakras={activatedChakras}
        />
      </div>
      
      <ChakraActivationManager 
        userId={user.id}
        userStreak={userStreak}
        activatedChakras={activatedChakras}
        updateStreak={updateStreak}
        updateActivatedChakras={updateActivatedChakras}
        updateUserProfile={updateUserProfile}
      />
      
      <UserDashboardCards 
        energyPoints={userProfile?.energy_points || 0}
        astralLevel={userProfile?.astral_level || 1}
        todayChallenge={todayChallenge}
      />
      
      <MainContent 
        userProfile={userProfile}
        onChallengeComplete={onChallengeComplete}
      />
    </>
  );
};

export default UserDashboardView;
