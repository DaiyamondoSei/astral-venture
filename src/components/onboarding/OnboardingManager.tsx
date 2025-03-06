
import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingOverlay from './OnboardingOverlay';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';
import AchievementNotification from './AchievementNotification';
import { 
  featureTooltips, 
  guidedTours, 
  onboardingAchievements, 
  AchievementData 
} from './onboardingData';

interface OnboardingManagerProps {
  userId: string;
  children: React.ReactNode;
}

const OnboardingManager: React.FC<OnboardingManagerProps> = ({ userId, children }) => {
  const { 
    isActive, 
    hasCompletedOnboarding,
    completedSteps,
    currentStep
  } = useOnboarding();

  // We'll track which tooltips have been seen
  const [seenTooltips, setSeenTooltips] = useState<Record<string, boolean>>({});
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  
  // Feature discovery state
  const [showFeatureTooltips, setShowFeatureTooltips] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  
  // Achievement notification state
  const [pendingAchievements, setPendingAchievements] = useState<AchievementData[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    // Only show feature tooltips after onboarding is complete
    if (hasCompletedOnboarding && !showFeatureTooltips) {
      const timer = setTimeout(() => {
        setShowFeatureTooltips(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, showFeatureTooltips]);

  // Load saved progress from localStorage
  useEffect(() => {
    // Load seen tooltips and completed tours from localStorage
    const storedSeenTooltips = JSON.parse(localStorage.getItem('seen-tooltips') || '{}');
    const storedCompletedTours = JSON.parse(localStorage.getItem('completed-tours') || '{}');
    
    setSeenTooltips(storedSeenTooltips);
    setCompletedTours(storedCompletedTours);
    
    // Start first tour after onboarding if no tours have been completed
    if (hasCompletedOnboarding && Object.keys(storedCompletedTours).length === 0) {
      const firstTour = guidedTours[0]?.id;
      if (firstTour) {
        setActiveTour(firstTour);
      }
    }
  }, [hasCompletedOnboarding]);

  // Check for achievements based on completed steps
  useEffect(() => {
    const storedAchievements = JSON.parse(localStorage.getItem(`achievements-${userId}`) || '{}');
    
    // Find achievements that should be awarded
    const newAchievements = onboardingAchievements.filter(achievement => {
      // If it requires a specific step and that step is completed
      return achievement.requiredStep && 
             completedSteps[achievement.requiredStep] && 
             !storedAchievements[achievement.id];
    });
    
    if (newAchievements.length > 0) {
      // Update local state with new achievements
      setPendingAchievements(prevAchievements => [...prevAchievements, ...newAchievements]);
      
      // Store as awarded in localStorage
      const updatedAchievements = { ...storedAchievements };
      newAchievements.forEach(achievement => {
        updatedAchievements[achievement.id] = {
          awarded: true,
          timestamp: new Date().toISOString()
        };
      });
      
      localStorage.setItem(`achievements-${userId}`, JSON.stringify(updatedAchievements));
    }
  }, [completedSteps, userId]);

  // Display achievements one at a time
  useEffect(() => {
    if (pendingAchievements.length > 0 && !currentAchievement) {
      // Take the first pending achievement and show it
      const nextAchievement = pendingAchievements[0];
      setCurrentAchievement(nextAchievement);
      
      // Remove it from the pending list
      setPendingAchievements(prevAchievements => prevAchievements.slice(1));
    }
  }, [pendingAchievements, currentAchievement]);

  const handleTooltipDismiss = (tooltipId: string) => {
    const updatedSeenTooltips = {
      ...seenTooltips,
      [tooltipId]: true
    };
    
    setSeenTooltips(updatedSeenTooltips);
    localStorage.setItem('seen-tooltips', JSON.stringify(updatedSeenTooltips));
  };

  const handleTourComplete = (tourId: string) => {
    const updatedCompletedTours = {
      ...completedTours,
      [tourId]: true
    };
    
    setCompletedTours(updatedCompletedTours);
    localStorage.setItem('completed-tours', JSON.stringify(updatedCompletedTours));
    
    setActiveTour(null);
    
    // Check if there are more tours to show
    const nextTourIndex = guidedTours.findIndex(tour => tour.id === tourId) + 1;
    if (nextTourIndex < guidedTours.length) {
      // Schedule next tour
      setTimeout(() => {
        setActiveTour(guidedTours[nextTourIndex].id);
      }, 5000);
    }
  };

  const handleAchievementDismiss = () => {
    setCurrentAchievement(null);
  };

  return (
    <>
      {/* Main onboarding overlay */}
      <OnboardingOverlay />
      
      {/* Feature discovery tooltips - only show after onboarding is complete */}
      {hasCompletedOnboarding && showFeatureTooltips && featureTooltips.map(tooltip => (
        <FeatureTooltip
          key={tooltip.id}
          id={tooltip.id}
          targetSelector={tooltip.targetSelector}
          title={tooltip.title}
          description={tooltip.description}
          position={tooltip.position}
          order={tooltip.order}
          isActive={!seenTooltips[tooltip.id]}
          onDismiss={handleTooltipDismiss}
        />
      ))}
      
      {/* Guided tours - show one at a time */}
      {hasCompletedOnboarding && guidedTours.map(tour => (
        <GuidedTour
          key={tour.id}
          tourId={tour.id}
          steps={tour.steps}
          isActive={activeTour === tour.id && !completedTours[tour.id]}
          onComplete={() => handleTourComplete(tour.id)}
        />
      ))}
      
      {/* Achievement notification */}
      {currentAchievement && (
        <AchievementNotification 
          achievement={currentAchievement}
          onDismiss={handleAchievementDismiss}
        />
      )}
      
      {children}
    </>
  );
};

export default OnboardingManager;
