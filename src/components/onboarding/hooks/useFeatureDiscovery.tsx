
import { useState, useEffect, useCallback } from 'react';
import { featureTooltips, guidedTours, FeatureTooltipData, GuidedTourData } from '../data';
import { useToast } from '@/components/ui/use-toast';

export const useFeatureDiscovery = (hasCompletedOnboarding: boolean) => {
  const [seenTooltips, setSeenTooltips] = useState<Record<string, boolean>>({});
  const [completedTours, setCompletedTours] = useState<Record<string, boolean>>({});
  const [showFeatureTooltips, setShowFeatureTooltips] = useState(false);
  const [activeTour, setActiveTour] = useState<string>('');
  const [activeTooltips, setActiveTooltips] = useState<FeatureTooltipData[]>([]);
  const { toast } = useToast();
  
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
        toast({
          title: "Guided Tour Available",
          description: `Learn about ${eligibleTour.title}`,
          duration: 5000,
        });
      }
    }
  }, [showFeatureTooltips, seenTooltips, completedTours, activeTour, toast]);
  
  const dismissTooltip = useCallback((tooltipId: string) => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const updatedSeenTooltips = { ...seenTooltips, [tooltipId]: true };
    setSeenTooltips(updatedSeenTooltips);
    localStorage.setItem(`seen-tooltips-${userId}`, JSON.stringify(updatedSeenTooltips));
    
    // Remove from active tooltips
    setActiveTooltips(prev => prev.filter(t => t.id !== tooltipId));
  }, [seenTooltips]);
  
  const dismissTour = useCallback((tourId: string) => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const updatedCompletedTours = { ...completedTours, [tourId]: true };
    setCompletedTours(updatedCompletedTours);
    localStorage.setItem(`completed-tours-${userId}`, JSON.stringify(updatedCompletedTours));
    
    // Clear active tour
    setActiveTour('');
    
    toast({
      title: "Tour Completed",
      description: "You've completed this guided tour. Continue exploring!",
      duration: 3000,
    });
  }, [completedTours, toast]);
  
  // Handle existing methods for backward compatibility
  const handleTooltipDismiss = useCallback((tooltipId: string) => dismissTooltip(tooltipId), [dismissTooltip]);
  const handleTourComplete = useCallback((tourId: string) => dismissTour(tourId), [dismissTour]);
  
  return {
    activeTooltips,
    activeTour,
    guidedTours,
    featureTooltips,
    seenTooltips,
    completedTours,
    showFeatureTooltips,
    dismissTooltip,
    dismissTour,
    handleTooltipDismiss,
    handleTourComplete
  };
};
