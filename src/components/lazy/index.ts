
import React, { lazy } from 'react';

// Helper function to create lazy components with proper naming for better debugging
const createLazyComponent = (importFn: () => Promise<any>, displayName: string) => {
  const LazyComponent = lazy(importFn);
  // Set displayName property only if it exists on the component
  if (LazyComponent) {
    // @ts-ignore - displayName is actually valid here but TS doesn't recognize it
    LazyComponent.displayName = `Lazy(${displayName})`;
  }
  return LazyComponent;
};

// Lazy-loaded components
export const LazyAstralBody = createLazyComponent(
  () => import('../entry-animation/AstralBody'),
  'AstralBody'
);

export const LazyCosmicAstralBody = createLazyComponent(
  () => import('../entry-animation/CosmicAstralBody'),
  'CosmicAstralBody'
);

export const VisualizationTabs = createLazyComponent(
  () => import('../astral-body-demo/VisualizationTabs'),
  'VisualizationTabs'
);

export const AstralBody = createLazyComponent(
  () => import('../entry-animation/AstralBody'),
  'AstralBody'
);

export const CosmicAstralBody = createLazyComponent(
  () => import('../entry-animation/CosmicAstralBody'),
  'CosmicAstralBody'
);

// Add the missing LazyInteractiveEnergyField component
export const LazyInteractiveEnergyField = createLazyComponent(
  () => import('../effects/energy-field/InteractiveEnergyField'),
  'InteractiveEnergyField'
);

// Explicitly export QuantumParticles for lazy loading in App.tsx
export const QuantumParticles = createLazyComponent(
  () => import('../effects/quantum-particles/QuantumParticles'),
  'QuantumParticles'
);
