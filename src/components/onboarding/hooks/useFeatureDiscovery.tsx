
import { useState, useEffect } from 'react';
import { featureTooltips, guidedTours, FeatureTooltipData, GuidedTourData } from '../onboardingData';

export const useFeatureDiscovery = (hasCompletedOnboarding: boolean) => {
  const [seenTooltips, setSeenTooltips] = useState<Record<string, boolean>>({});
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [showFeatureTooltips, setShowFeatureTooltips] = useState(false);
  const [activeTour, setActiveTour] = useState<string>('');
  const [activeTooltips, setActiveTooltips] = useState<FeatureTooltipData[]>([]);
  
  // Load seen tooltips and completed tours
  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const stored = localStorage.getItem(`seen-tooltips-${userId}`);
    if (stored) {
      setSeenTooltips(JSON.parse(stored));
    }
    
    const storedTours = localStorage.getItem(`completed-tours-${userId}`);
    if (storedTours) {
      setCompletedTours(JSON.parse(storedTours));
    }
    
    // Only show tooltips if user has completed onboarding
    setShowFeatureTooltips(hasCompletedOnboarding);
  }, [hasCompletedOnboarding]);
  
  // Determine which tooltips to show
  useEffect(() => {
    if (!showFeatureTooltips) {
      setActiveTooltips([]);
      return;
    }
    
    // Find eligible tooltips (not seen yet)
    const eligibleTooltips = featureTooltips.filter(tooltip => 
      !seenTooltips[tooltip.id] && 
      (!tooltip.requiredStep || localStorage.getItem(`step-completed-${tooltip.requiredStep}`))
    );
    
    // Limit to max 1 tooltip at a time
    setActiveTooltips(eligibleTooltips.slice(0, 1));
    
    // Check if we should start a tour
    if (eligibleTooltips.length === 0 && !activeTour) {
      const eligibleTour = guidedTours.find(tour => 
        !completedTours[tour.id] && 
        (!tour.requiredStep || localStorage.getItem(`step-completed-${tour.requiredStep}`))
      );
      
      if (eligibleTour) {
        setActiveTour(eligibleTour.id);
      }
    }
  }, [showFeatureTooltips, seenTooltips, completedTours, activeTour]);
  
  const dismissTooltip = (tooltipId: string) => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const updatedSeenTooltips = { ...seenTooltips, [tooltipId]: true };
    setSeenTooltips(updatedSeenTooltips);
    localStorage.setItem(`seen-tooltips-${userId}`, JSON.stringify(updatedSeenTooltips));
    
    // Remove from active tooltips
    setActiveTooltips(prev => prev.filter(t => t.id !== tooltipId));
  };
  
  const dismissTour = (tourId: string) => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const updatedCompletedTours = { ...completedTours, [tourId]: true };
    setCompletedTours(updatedCompletedTours);
    localStorage.setItem(`completed-tours-${userId}`, JSON.stringify(updatedCompletedTours));
    
    // Clear active tour
    setActiveTour('');
  };
  
  return {
    activeTooltips,
    activeTour,
    guidedTours,
    dismissTooltip,
    dismissTour,
    seenTooltips,
    completedTours,
    showFeatureTooltips,
    handleTooltipDismiss: dismissTooltip,
    handleTourComplete: dismissTour
  };
};
