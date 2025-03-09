
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/onboarding';
import { featureTooltips, guidedTours } from '../data';
import { FeatureTooltipData, GuidedTourData } from '../hooks/achievement/types';

/**
 * Hook to manage feature discovery tooltips and guided tours
 */
export function useFeatureDiscovery(hasCompletedOnboarding: boolean) {
  const [activeTooltips, setActiveTooltips] = useState<FeatureTooltipData[]>([]);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useState<Record<string, boolean>>({});
  const [dismissedTours, setDismissedTours] = useState<Record<string, boolean>>({});
  
  const { 
    completedSteps, 
    currentStep, 
    hasCompletedAnyStep 
  } = useOnboarding();

  // Filter and show appropriate tooltips and tours
  useEffect(() => {
    if (!hasCompletedAnyStep) return;
    
    // Only allow one active tour at a time
    if (activeTour) return;
    
    // Filter tooltips based on completed steps and conditions
    const eligibleTooltips = featureTooltips.filter(tooltip => {
      // Skip if already dismissed
      if (dismissedTooltips[tooltip.id]) return false;
      
      // Check if required step is completed
      if (tooltip.requiredStep && completedSteps) {
        if (!completedSteps[tooltip.requiredStep]) return false;
      }
      
      // Check condition
      if (tooltip.condition === 'isFirstLogin' && hasCompletedOnboarding) return false;
      if (tooltip.condition === 'hasCompletedOnboarding' && !hasCompletedOnboarding) return false;
      
      return true;
    });
    
    setActiveTooltips(eligibleTooltips);
    
    // Determine if any tour should be shown
    const eligibleTour = guidedTours.find(tour => {
      // Skip if already dismissed
      if (dismissedTours[tour.id]) return false;
      
      // Check if required step is completed
      if (tour.requiredStep && completedSteps) {
        if (!completedSteps[tour.requiredStep]) return false;
      }
      
      // Check condition
      if (tour.condition === 'isFirstLogin' && hasCompletedOnboarding) return false;
      if (tour.condition === 'hasCompletedOnboarding' && !hasCompletedOnboarding) return false;
      
      return true;
    });
    
    if (eligibleTour) {
      setActiveTour(eligibleTour.id);
    }
  }, [completedSteps, currentStep, dismissedTooltips, dismissedTours, activeTour, hasCompletedAnyStep, hasCompletedOnboarding]);

  // Dismiss a tooltip
  const dismissTooltip = (id: string) => {
    setDismissedTooltips(prev => ({
      ...prev,
      [id]: true
    }));
    
    setActiveTooltips(prev => prev.filter(tooltip => tooltip.id !== id));
  };
  
  // Dismiss a tour
  const dismissTour = (id: string) => {
    setDismissedTours(prev => ({
      ...prev,
      [id]: true
    }));
    
    setActiveTour(null);
  };

  return {
    activeTooltips,
    activeTour,
    guidedTours,
    dismissTooltip,
    dismissTour
  };
}
