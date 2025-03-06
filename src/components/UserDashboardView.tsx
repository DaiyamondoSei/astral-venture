
import React, { useState, useEffect } from 'react';
import UserDashboardCards from '@/components/UserDashboardCards';
import MainContent from '@/components/MainContent';
import ChakraActivationManager from '@/components/ChakraActivationManager';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserStats from '@/components/dashboard/UserStats';
import { useLogout } from '@/hooks/useLogout';
import SacredHomePage from '@/components/home/SacredHomePage';
import { toast } from '@/components/ui/use-toast';

interface UserDashboardViewProps {
  user: any;
  userProfile: any;
  todayChallenge: any;
  userStreak: { current: number; longest: number };
  activatedChakras: number[];
  onLogout?: () => void;
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
  const { handleLogout } = useLogout(user?.id);
  const [activeView, setActiveView] = useState<'sacred-home' | 'traditional'>('sacred-home');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Add debugging effect to log key state values
  useEffect(() => {
    console.log("UserDashboardView mounted with:", {
      userExists: !!user,
      userProfileExists: !!userProfile,
      userId: user?.id,
      activatedChakras,
      userStreak,
      activeView
    });
    
    // Show toast if user exists but profile is missing
    if (user && !userProfile) {
      toast({
        title: "Profile data unavailable",
        description: "Unable to load your profile data. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [user, userProfile, activatedChakras, userStreak, activeView]);
  
  // Derive username from user data
  const username = userProfile?.username || user?.email?.split('@')[0] || 'Seeker';
  const astralLevel = userProfile?.astral_level || 1;
  const energyPoints = userProfile?.energy_points || 0;

  const logoutHandler = onLogout || handleLogout;
  
  const handleNodeSelect = (nodeId: string) => {
    console.log("Node selected:", nodeId);
    setSelectedNode(nodeId);
    
    // If chakras node is selected, show chakra activation
    if (nodeId === 'chakras') {
      setActiveView('traditional');
    }
  };

  // Failsafe rendering to ensure something always shows
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-black/30 rounded-lg">
          <h2 className="text-2xl mb-4">User data not available</h2>
          <p>Please try logging in again</p>
          <button
            onClick={logoutHandler}
            className="mt-4 px-4 py-2 bg-primary rounded-md"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeView === 'sacred-home' ? (
        <SacredHomePage
          user={user}
          userProfile={userProfile}
          userStreak={userStreak}
          activatedChakras={activatedChakras}
          onLogout={logoutHandler}
          onNodeSelect={handleNodeSelect}
        />
      ) : (
        <DashboardLayout
          username={username}
          astralLevel={astralLevel}
          onLogout={logoutHandler}
        >
          <UserStats
            energyPoints={energyPoints}
            streakDays={userStreak.current}
            activatedChakras={activatedChakras}
          />
          
          <ChakraActivationManager 
            userId={user.id}
            userStreak={userStreak}
            activatedChakras={activatedChakras}
            updateStreak={updateStreak}
            updateActivatedChakras={updateActivatedChakras}
            updateUserProfile={updateUserProfile}
          />
          
          <UserDashboardCards 
            energyPoints={energyPoints}
            astralLevel={astralLevel}
            todayChallenge={todayChallenge}
          />
          
          <MainContent 
            userProfile={userProfile}
            onChallengeComplete={onChallengeComplete}
          />
        </DashboardLayout>
      )}
    </>
  );
};

export default UserDashboardView;
