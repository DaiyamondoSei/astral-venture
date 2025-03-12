
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AuthStateManager from '@/components/AuthStateManager';
import OnboardingManager from '@/components/onboarding/OnboardingManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePerformance } from '@/contexts/PerformanceContext';
import { initializeApp } from '@/utils/appInitializer';
// Import the useAuth hook from the correct location
import { useAuth } from '@/hooks/auth';

// Import lazy-loaded components using our optimized lazy loader
import {
  VisualizationTabs,
  CosmicAstralBody,
  AstralBody
} from '@/components/lazy';

// Lazy load components that aren't needed for initial render
const UserDashboardView = lazy(() => import('@/components/UserDashboardView'));
const LandingView = lazy(() => import('@/components/LandingView'));
const EntryAnimationView = lazy(() => import('@/components/EntryAnimationView'));
const ChallengeManager = lazy(() => import('@/components/ChallengeManager'));

// Loading fallback components with performance adaptability
const LoadingFallback = () => {
  const { isLowPerformance } = usePerformance();
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className={`${isLowPerformance ? '' : 'animate-pulse'} text-white/70`}>
        Loading view...
      </div>
    </div>
  );
};

const Index = () => {
  const [showEntryAnimation, setShowEntryAnimation] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLowPerformance } = usePerformance();

  // Initialize app with performance optimizations
  useEffect(() => {
    initializeApp({ 
      route: 'index', 
      prioritizeLCP: true,
      enableMonitoring: process.env.NODE_ENV === 'development'
    });
  }, []);

  // Simplified debug logging
  useEffect(() => {
    console.log("Index component - auth state:", { 
      user: !!user, 
      authState: !!authState 
    });
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

  // Create a more adaptive fallback component based on performance
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
          <ErrorBoundary>
            <Suspense fallback={<SuspenseFallback />}>
              {showEntryAnimation ? (
                <EntryAnimationView 
                  onComplete={handleEntryAnimationComplete}
                  showTestButton={false}
                />
              ) : (!authState.user ? (
                <LandingView />
              ) : (
                <OnboardingManager userId={authState.user.id}>
                  <ErrorBoundary>
                    <Suspense fallback={<SuspenseFallback />}>
                      <ChallengeManager
                        userProfile={authState.userProfile}
                        activatedChakras={authState.activatedChakras || []}
                        updateUserProfile={authState.updateUserProfile}
                        updateActivatedChakras={authState.updateActivatedChakras}
                      >
                        {(handleChallengeComplete) => (
                          <UserDashboardView
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
                    </Suspense>
                  </ErrorBoundary>
                </OnboardingManager>
              ))}
            </Suspense>
          </ErrorBoundary>
        )}
      </ErrorBoundary>
    </Layout>
  );
};

export default Index;
