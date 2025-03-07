
import React from 'react';
import LazyLoadWrapper from '../LazyLoadWrapper';

// Lazy load heavy visualization components
const LazyQuantumParticles = React.lazy(() => 
  import('../effects/quantum-particles/QuantumParticles')
);

const LazyInteractiveEnergyField = React.lazy(() => 
  import('../effects/energy-field/InteractiveEnergyField')
);

const LazyInteractiveMetatronsPortal = React.lazy(() =>
  import('../sacred-geometry/components/InteractiveMetatronsPortal')
);

const LazyVisualizationTabs = React.lazy(() =>
  import('../astral-body-demo/VisualizationTabs')
);

const LazyCosmicAstralBody = React.lazy(() =>
  import('../entry-animation/CosmicAstralBody')
);

const LazyAstralBody = React.lazy(() =>
  import('../entry-animation/AstralBody')
);

// Export wrapped versions with optimized loading states
export const QuantumParticles = (props: any) => (
  <LazyLoadWrapper>
    <LazyQuantumParticles {...props} />
  </LazyLoadWrapper>
);

export const InteractiveEnergyField = (props: any) => (
  <LazyLoadWrapper>
    <LazyInteractiveEnergyField {...props} />
  </LazyLoadWrapper>
);

export const InteractiveMetatronsPortal = (props: any) => (
  <LazyLoadWrapper>
    <LazyInteractiveMetatronsPortal {...props} />
  </LazyLoadWrapper>
);

export const VisualizationTabs = (props: any) => (
  <LazyLoadWrapper>
    <LazyVisualizationTabs {...props} />
  </LazyLoadWrapper>
);

export const CosmicAstralBody = (props: any) => (
  <LazyLoadWrapper>
    <LazyCosmicAstralBody {...props} />
  </LazyLoadWrapper>
);

export const AstralBody = (props: any) => (
  <LazyLoadWrapper>
    <LazyAstralBody {...props} />
  </LazyLoadWrapper>
);

// Also export the raw lazy components for advanced usage scenarios
export {
  LazyQuantumParticles,
  LazyInteractiveEnergyField,
  LazyInteractiveMetatronsPortal,
  LazyVisualizationTabs,
  LazyCosmicAstralBody,
  LazyAstralBody
};
