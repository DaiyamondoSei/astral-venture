
import React, { lazy } from 'react';

// Helper function to create lazy components with proper naming for better debugging
const createLazyComponent = (importFn: () => Promise<any>, displayName: string) => {
  const LazyComponent = lazy(importFn);
  LazyComponent.displayName = `Lazy(${displayName})`;
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

// Explicitly export QuantumParticles for lazy loading in App.tsx
export const QuantumParticles = createLazyComponent(
  () => import('../effects/quantum-particles/QuantumParticles'),
  'QuantumParticles'
);
