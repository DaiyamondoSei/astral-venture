
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Default fallback for lazy components
const DefaultFallback = () => (
  <div className="animate-pulse flex flex-col space-y-4 p-4">
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-32 w-full rounded-md" />
    <Skeleton className="h-4 w-1/2 rounded" />
  </div>
);

// HOC for creating optimized lazy components
const createLazyComponent = (importFn: () => Promise<any>, LoadingFallback = DefaultFallback) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded components with custom loading states
export const LazyInteractiveEnergyField = createLazyComponent(
  () => import('@/components/effects/InteractiveEnergyField')
);

export const LazyAstralBody = createLazyComponent(
  () => import('@/components/astral-body/AstralBody')
);

export const LazyCosmicAstralBody = createLazyComponent(
  () => import('@/components/entry-animation/CosmicAstralBody')
);

export const QuantumParticles = createLazyComponent(
  () => import('@/components/effects/QuantumParticles')
);

export const VisualizationTabs = createLazyComponent(
  () => import('@/components/astral-body-demo/VisualizationTabs')
);

export const EntryAnimation = createLazyComponent(
  () => import('@/components/EntryAnimation')
);
