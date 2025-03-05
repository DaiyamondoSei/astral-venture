
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import UserDashboardView from '@/components/UserDashboardView';
import LandingView from '@/components/LandingView';
import EntryAnimationView from '@/components/EntryAnimationView';
import DevModeManager from '@/components/dev-mode/DevModeManager';
import AuthStateManager from '@/components/AuthStateManager';
import ChallengeManager from '@/components/ChallengeManager';

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !localStorage.getItem(`entry-animation-shown-${user.id}`)) {
      const dreamCaptureCompleted = localStorage.getItem('dreamCaptureCompleted');
      
      if (!dreamCaptureCompleted) {
        navigate('/dream-capture');
      } else {
        setShowEntryAnimation(true);
      }
    }
  }, [user, navigate]);

  const handleAuthStateLoaded = (authData: any) => {
    setAuthState(authData);
  };

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
  };

  return (
    <Layout>
      <AuthStateManager onLoadingComplete={handleAuthStateLoaded} />
      
      {authState && (
        <DevModeManager>
          {showEntryAnimation ? (
            <EntryAnimationView 
              user={authState.user}
              onComplete={handleEntryAnimationComplete}
              showTestButton={false}
            />
          ) : (!authState.user ? (
            <LandingView />
          ) : (
            <ChallengeManager
              userProfile={authState.userProfile}
              activatedChakras={authState.activatedChakras}
              updateUserProfile={authState.updateUserProfile}
              updateActivatedChakras={authState.updateActivatedChakras}
            >
              {(handleChallengeComplete) => (
                <UserDashboardView
                  user={authState.user}
                  userProfile={authState.userProfile}
                  todayChallenge={authState.todayChallenge}
                  userStreak={authState.userStreak}
                  activatedChakras={authState.activatedChakras}
                  onLogout={authState.handleLogout}
                  updateStreak={authState.updateStreak}
                  updateActivatedChakras={authState.updateActivatedChakras}
                  updateUserProfile={authState.updateUserProfile}
                  onChallengeComplete={handleChallengeComplete}
                />
              )}
            </ChallengeManager>
          ))}
        </DevModeManager>
      )}
    </Layout>
  );
};

export default Index;
