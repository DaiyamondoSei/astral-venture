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
    dismissTooltip,
    dismissTour
  } = useFeatureDiscovery(hasCompletedOnboarding);

  // If there's an active tour, prioritize showing it
  if (activeTour) {
    return (
      <GuidedTour 
        tour={activeTour} 
        onDismiss={dismissTour} 
      />
    );
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
