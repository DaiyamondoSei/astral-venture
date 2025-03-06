
import { useState, useEffect } from 'react';
import { featureTooltips, guidedTours, FeatureTooltipData, GuidedTourData } from '../onboardingData';

export const useFeatureDiscovery = (hasCompletedOnboarding: boolean) => {
  // We'll track which tooltips have been seen
  const [seenTooltips, setSeenTooltips] = useState<Record<string, boolean>>({});
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  
  // Feature discovery state
  const [showFeatureTooltips, setShowFeatureTooltips] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [activeTooltips, setActiveTooltips] = useState<FeatureTooltipData[]>([]);

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

  // Load saved progress from localStorage and determine active tooltips
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

    // Determine active tooltips - only those not seen before
    if (showFeatureTooltips) {
      const filteredTooltips = featureTooltips.filter(
        tooltip => !storedSeenTooltips[tooltip.id]
      ).sort((a, b) => a.order - b.order);
      
      setActiveTooltips(filteredTooltips);
    } else {
      setActiveTooltips([]);
    }
  }, [hasCompletedOnboarding, showFeatureTooltips]);

  const dismissTooltip = (tooltipId: string) => {
    const updatedSeenTooltips = {
      ...seenTooltips,
      [tooltipId]: true
    };
    
    setSeenTooltips(updatedSeenTooltips);
    setActiveTooltips(prev => prev.filter(tooltip => tooltip.id !== tooltipId));
    localStorage.setItem('seen-tooltips', JSON.stringify(updatedSeenTooltips));
  };

  const dismissTour = (tourId: string) => {
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

  return {
    featureTooltips,
    guidedTours,
    seenTooltips,
    activeTour,
    activeTooltips,
    showFeatureTooltips,
    completedTours,
    dismissTooltip,
    dismissTour
  };
};
