
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

// Export wrapped versions with optimized loading states
export const QuantumParticles = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyQuantumParticles {...props} />
  </React.Suspense>
);

export const InteractiveEnergyField = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyInteractiveEnergyField {...props} />
  </React.Suspense>
);

export const InteractiveMetatronsPortal = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyInteractiveMetatronsPortal {...props} />
  </React.Suspense>
);

export const VisualizationTabs = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyVisualizationTabs {...props} />
  </React.Suspense>
);

export const CosmicAstralBody = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyCosmicAstralBody {...props} />
  </React.Suspense>
);

export const AstralBody = (props: any) => (
  <React.Suspense fallback={<div className="loading-fallback">Loading...</div>}>
    <LazyAstralBody {...props} />
  </React.Suspense>
);
