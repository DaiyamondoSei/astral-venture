
import React from 'react';
import { useFeatureDiscovery } from './hooks/useFeatureDiscovery';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';
import { TourStep } from './data/types';

interface FeatureDiscoveryLayerProps {
  hasCompletedOnboarding: boolean;
}

const FeatureDiscoveryLayer: React.FC<FeatureDiscoveryLayerProps> = ({ 
  hasCompletedOnboarding 
}) => {
  const {
    activeTooltips,
    activeTour,
    guidedTours,
    dismissTooltip,
    dismissTour
  } = useFeatureDiscovery(hasCompletedOnboarding);

  // If there's an active tour, prioritize showing it
  if (activeTour) {
    const tourData = guidedTours.find(tour => tour.id === activeTour);
    if (tourData) {
      const mappedSteps: TourStep[] = tourData.steps.map(step => ({
        id: step.id,
        title: step.title,
        content: step.description, // Map description to content for the TourStep format
        elementId: step.elementId,
        position: step.position,
        target: step.target || step.targetElement, // Map to expected prop name
        targetSelector: step.targetSelector || `#${step.elementId}` // Ensure targetSelector is provided
      }));
      
      return (
        <GuidedTour 
          tourId={tourData.id}
          title={tourData.title}
          description={tourData.description || ''}
          steps={mappedSteps}
          onComplete={() => dismissTour(tourData.id)}
        />
      );
    }
  }

  // Otherwise, show any feature tooltips if present
  return (
    <>
      {activeTooltips.map(tooltip => (
        <FeatureTooltip
          key={tooltip.id}
          tooltipData={{
            ...tooltip,
            targetSelector: tooltip.targetSelector || `#${tooltip.elementId || tooltip.targetElement}`
          }}
          onDismiss={() => dismissTooltip(tooltip.id)}
        />
      ))}
    </>
  );
};

export default FeatureDiscoveryLayer;
