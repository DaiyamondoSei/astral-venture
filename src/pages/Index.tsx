
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import AuthStateManager from '@/components/AuthStateManager';
import OnboardingManager from '@/components/onboarding/OnboardingManager';

// Lazy load components that aren't needed for initial render
const UserDashboardView = lazy(() => import('@/components/UserDashboardView'));
const LandingView = lazy(() => import('@/components/LandingView'));
const EntryAnimationView = lazy(() => import('@/components/EntryAnimationView'));
const DevModeManager = lazy(() => import('@/components/dev-mode/DevModeManager'));
const ChallengeManager = lazy(() => import('@/components/ChallengeManager'));

// Loading fallback components
const LoadingFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="animate-pulse text-white/70">Loading view...</div>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
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
              <OnboardingManager userId={authState.user.id}>
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
              </OnboardingManager>
            ))}
          </DevModeManager>
        </Suspense>
      )}
    </Layout>
  );
};

export default Index;
