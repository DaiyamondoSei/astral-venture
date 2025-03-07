
import React from 'react';

// Lazy load heavy visualization components
export const LazyQuantumParticles = React.lazy(() => 
  import('../effects/quantum-particles/QuantumParticles')
);

export const LazyInteractiveEnergyField = React.lazy(() => 
  import('../effects/energy-field/InteractiveEnergyField')
);

export const LazyInteractiveMetatronsPortal = React.lazy(() =>
  import('../sacred-geometry/components/InteractiveMetatronsPortal')
);

export const LazyVisualizationTabs = React.lazy(() =>
  import('../astral-body-demo/VisualizationTabs')
);

export const LazyCosmicAstralBody = React.lazy(() =>
  import('../entry-animation/CosmicAstralBody')
);

export const LazyAstralBody = React.lazy(() =>
  import('../entry-animation/AstralBody')
);

// Export wrapped versions for direct use
export const QuantumParticles = (props: any) => (
  <LazyQuantumParticles {...props} />
);

export const InteractiveEnergyField = (props: any) => (
  <LazyInteractiveEnergyField {...props} />
);

export const InteractiveMetatronsPortal = (props: any) => (
  <LazyInteractiveMetatronsPortal {...props} />
);

export const VisualizationTabs = (props: any) => (
  <LazyVisualizationTabs {...props} />
);

export const CosmicAstralBody = (props: any) => (
  <LazyCosmicAstralBody {...props} />
);

export const AstralBody = (props: any) => (
  <LazyAstralBody {...props} />
);
