
import React, { useState, useEffect } from 'react';
import UserDashboardCards from '@/components/UserDashboardCards';
import MainContent from '@/components/MainContent';
import ChakraActivationManager from '@/components/ChakraActivationManager';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserStats from '@/components/dashboard/UserStats';
import { useLogout } from '@/hooks/useLogout';
import SacredHomePage from '@/components/home/SacredHomePage';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  userStreak = { current: 0, longest: 0 },
  activatedChakras = [],
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
  
  const logoutHandler = onLogout || handleLogout;
  
  const handleNodeSelect = (nodeId: string) => {
    console.log("Node selected:", nodeId);
    setSelectedNode(nodeId);
    
    // If chakras node is selected, show chakra activation
    if (nodeId === 'chakras') {
      setActiveView('traditional');
    }
  };

  // Ensure all required props have fallback values
  const safeUserStreak = userStreak || { current: 0, longest: 0 };
  const safeActivatedChakras = activatedChakras || [];
  const safeUserProfile = userProfile || (user ? {
    username: user.email?.split('@')[0] || 'Seeker',
    astral_level: 1,
    energy_points: 0
  } : null);

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
    <ErrorBoundary>
      {activeView === 'sacred-home' ? (
        <SacredHomePage
          user={user}
          userProfile={safeUserProfile}
          userStreak={safeUserStreak}
          activatedChakras={safeActivatedChakras}
          onLogout={logoutHandler}
          onNodeSelect={handleNodeSelect}
        />
      ) : (
        <DashboardLayout
          username={safeUserProfile?.username || user?.email?.split('@')[0] || 'Seeker'}
          astralLevel={safeUserProfile?.astral_level || 1}
          onLogout={logoutHandler}
        >
          <UserStats
            energyPoints={safeUserProfile?.energy_points || 0}
            streakDays={safeUserStreak.current}
            activatedChakras={safeActivatedChakras}
          />
          
          <ChakraActivationManager 
            userId={user.id}
            userStreak={safeUserStreak}
            activatedChakras={safeActivatedChakras}
            updateStreak={updateStreak}
            updateActivatedChakras={updateActivatedChakras}
            updateUserProfile={updateUserProfile}
          />
          
          <UserDashboardCards 
            energyPoints={safeUserProfile?.energy_points || 0}
            astralLevel={safeUserProfile?.astral_level || 1}
            todayChallenge={todayChallenge}
          />
          
          <MainContent 
            userProfile={safeUserProfile}
            onChallengeComplete={onChallengeComplete}
          />
        </DashboardLayout>
      )}
    </ErrorBoundary>
  );
};

export default UserDashboardView;
