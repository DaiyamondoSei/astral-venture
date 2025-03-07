
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingOverlay from './OnboardingOverlay';
import FeatureDiscoveryLayer from './FeatureDiscoveryLayer';
import AchievementLayer from './AchievementLayer';
import WelcomePopup from './components/WelcomePopup';

interface OnboardingManagerProps {
  userId: string;
  children: React.ReactNode;
}

const OnboardingManager: React.FC<OnboardingManagerProps> = ({ userId, children }) => {
  const { 
    hasCompletedOnboarding,
    completedSteps,
    stepInteractions
  } = useOnboarding();
  
  const [isWelcomeComplete, setIsWelcomeComplete] = useState(false);
  
  const handleWelcomeComplete = () => {
    setIsWelcomeComplete(true);
  };

  return (
    <>
      {/* Welcome popup for first-time users */}
      <WelcomePopup 
        userId={userId} 
        onComplete={handleWelcomeComplete} 
      />
      
      {/* Main onboarding overlay */}
      <OnboardingOverlay />
      
      {/* Feature discovery layer (tooltips and guided tours) */}
      <FeatureDiscoveryLayer
        hasCompletedOnboarding={hasCompletedOnboarding}
      />
      
      {/* Achievement layer */}
      <AchievementLayer
        userId={userId}
        completedSteps={completedSteps}
        stepInteractions={stepInteractions}
      />
      
      {children}
    </>
  );
};

export default OnboardingManager;
