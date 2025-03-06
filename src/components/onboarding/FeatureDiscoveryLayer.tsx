
import React from 'react';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';
import { useFeatureDiscovery } from './hooks/useFeatureDiscovery';

interface FeatureDiscoveryLayerProps {
  hasCompletedOnboarding: boolean;
}

const FeatureDiscoveryLayer: React.FC<FeatureDiscoveryLayerProps> = ({ 
  hasCompletedOnboarding 
}) => {
  const {
    featureTooltips,
    guidedTours,
    seenTooltips,
    activeTour,
    showFeatureTooltips,
    completedTours,
    handleTooltipDismiss,
    handleTourComplete
  } = useFeatureDiscovery(hasCompletedOnboarding);

  if (!hasCompletedOnboarding) return null;

  return (
    <>
      {/* Feature discovery tooltips - only show after onboarding is complete */}
      {showFeatureTooltips && featureTooltips.map(tooltip => (
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
      {guidedTours.map(tour => (
        <GuidedTour
          key={tour.id}
          tourId={tour.id}
          steps={tour.steps}
          isActive={activeTour === tour.id && !completedTours[tour.id]}
          onComplete={() => handleTourComplete(tour.id)}
        />
      ))}
    </>
  );
};

export default FeatureDiscoveryLayer;
