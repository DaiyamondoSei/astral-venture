
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FeatureTooltipData, GuidedTourData } from './onboardingData';
import FeatureTooltip from './FeatureTooltip';
import GuidedTour from './GuidedTour';

interface FeatureDiscoveryLayerProps {
  showFeatureTooltips: boolean;
  featureTooltips: FeatureTooltipData[];
  seenTooltips: Record<string, boolean>;
  activeTour: string | null;
  guidedTours: GuidedTourData[];
  handleTooltipDismiss: (tooltipId: string) => void;
  handleTourComplete: (tourId: string) => void;
}

// Type that aligns with what GuidedTour expects
interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const FeatureDiscoveryLayer: React.FC<FeatureDiscoveryLayerProps> = ({
  showFeatureTooltips,
  featureTooltips,
  seenTooltips,
  activeTour,
  guidedTours,
  handleTooltipDismiss,
  handleTourComplete
}) => {
  // Get the current active tour data
  const activeTourData = guidedTours.find(tour => tour.id === activeTour);
  
  // Convert GuidedTourStep[] to TourStep[] by adding targetSelector
  const tourSteps: TourStep[] = activeTourData?.steps.map(step => ({
    ...step,
    targetSelector: step.target, // Map 'target' to 'targetSelector'
    content: step.content,      // Keep existing content
    description: step.content   // Add description property (same as content)
  })) || [];

  if (!showFeatureTooltips && !activeTourData) {
    return null;
  }

  return (
    <div className="feature-discovery-layer">
      {/* Feature tooltips */}
      <AnimatePresence>
        {showFeatureTooltips && featureTooltips.map(tooltip => {
          // Only show tooltips that haven't been seen
          if (seenTooltips[tooltip.id]) return null;
          
          return (
            <FeatureTooltip
              key={tooltip.id}
              tooltip={tooltip}
              onDismiss={() => handleTooltipDismiss(tooltip.id)}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Guided tour */}
      {activeTourData && (
        <GuidedTour
          tourId={activeTourData.id}
          title={activeTourData.title}
          description={activeTourData.description}
          steps={tourSteps}
          onComplete={() => handleTourComplete(activeTourData.id)}
        />
      )}
    </div>
  );
};

export default FeatureDiscoveryLayer;
