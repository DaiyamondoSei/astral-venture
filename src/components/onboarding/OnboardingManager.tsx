
import React, { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingOverlay from './OnboardingOverlay';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';
import { featureTooltips, guidedTours } from './onboardingData';

interface OnboardingManagerProps {
  userId: string;
  children: React.ReactNode;
}

const OnboardingManager: React.FC<OnboardingManagerProps> = ({ userId, children }) => {
  const { isActive, hasCompletedOnboarding } = useOnboarding();

  // We'll track which tooltips have been seen
  const [seenTooltips, setSeenTooltips] = React.useState<Record<string, boolean>>({});
  const [completedTours, setCompletedTours] = React.useState<Record<string, boolean>>({});
  
  // Feature discovery state
  const [showFeatureTooltips, setShowFeatureTooltips] = React.useState(false);
  const [activeTour, setActiveTour] = React.useState<string | null>(null);

  useEffect(() => {
    // Only show feature tooltips after onboarding is complete
    if (hasCompletedOnboarding && !showFeatureTooltips) {
      const timer = setTimeout(() => {
        setShowFeatureTooltips(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, showFeatureTooltips]);

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

  const handleTooltipDismiss = (tooltipId: string) => {
    setSeenTooltips(prev => ({
      ...prev,
      [tooltipId]: true
    }));
  };

  const handleTourComplete = (tourId: string) => {
    setCompletedTours(prev => ({
      ...prev,
      [tourId]: true
    }));
    
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
      
      {children}
    </>
  );
};

export default OnboardingManager;
