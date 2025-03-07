
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import AuthStateManager from '@/components/AuthStateManager';
import OnboardingManager from '@/components/onboarding/OnboardingManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePerformance } from '@/contexts/PerformanceContext';
import { initializeApp } from '@/utils/appInitializer';

// Lazy load components that aren't needed for initial render
const UserDashboardView = lazy(() => import('@/components/UserDashboardView'));
const LandingView = lazy(() => import('@/components/LandingView'));
const EntryAnimationView = lazy(() => import('@/components/EntryAnimationView'));
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
  const { isLowPerformance } = usePerformance();

  // Initialize app with performance optimizations
  useEffect(() => {
    initializeApp({ route: 'index', prioritizeLCP: true });
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Index component - auth state:", { user: !!user, authState: !!authState });
  }, [user, authState]);

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
    console.log("Auth state loaded:", authData.user ? "User exists" : "No user");
    setAuthState(authData);
  };

  const handleEntryAnimationComplete = () => {
    setShowEntryAnimation(false);
    if (user) {
      localStorage.setItem(`entry-animation-shown-${user.id}`, 'true');
    }
  };

  // Adjust the suspense fallback based on performance
  const SuspenseFallback = () => (
    <div className={`min-h-[70vh] flex items-center justify-center ${isLowPerformance ? '' : 'animate-pulse'}`}>
      <div className="text-white/70">Loading view...</div>
    </div>
  );

  return (
    <Layout>
      <ErrorBoundary>
        <AuthStateManager onLoadingComplete={handleAuthStateLoaded} />
        
        {authState && (
          <Suspense fallback={<SuspenseFallback />}>
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
                  activatedChakras={authState.activatedChakras || []}
                  updateUserProfile={authState.updateUserProfile}
                  updateActivatedChakras={authState.updateActivatedChakras}
                >
                  {(handleChallengeComplete) => (
                    <UserDashboardView
                      user={authState.user}
                      userProfile={authState.userProfile}
                      todayChallenge={authState.todayChallenge}
                      userStreak={authState.userStreak || { current: 0, longest: 0 }}
                      activatedChakras={authState.activatedChakras || []}
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
          </Suspense>
        )}
      </ErrorBoundary>
    </Layout>
  );
};

export default Index;
