import React from 'react';
import { useFeatureDiscovery } from './hooks/useFeatureDiscovery';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';

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
      return (
        <GuidedTour 
          tourId={tourData.id}
          title={tourData.title}
          description={tourData.description}
          steps={tourData.steps.map(step => ({
            ...step,
            targetSelector: step.target // Map to expected prop name
          }))}
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
          tooltipData={tooltip}
          onDismiss={() => dismissTooltip(tooltip.id)}
        />
      ))}
    </>
  );
};

export default FeatureDiscoveryLayer;
