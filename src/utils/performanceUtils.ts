
import { DeviceCapability, PerformanceSettings } from './performance/core/types';

export const getPerformanceCategory = (capability: DeviceCapability): string => {
  switch (capability) {
    case 'high':
      return 'high-end';
    case 'medium':
      return 'mid-range';
    case 'low':
      return 'low-end';
  }
};

export const throttleForPerformance = (callback: () => void, capability: DeviceCapability): () => void => {
  const interval = capability === 'low' ? 100 : capability === 'medium' ? 50 : 0;
  let lastRun = 0;

  return () => {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      callback();
    }
  };
};

export const getDefaultSettings = (capability: DeviceCapability): PerformanceSettings => {
  switch (capability) {
    case 'high':
      return {
        targetFPS: 60,
        qualityLevel: 'high',
        useSimplifiedEffects: false,
        disableBlur: false,
        disableShadows: false,
        particleCount: 1000,
        maxAnimationsPerFrame: 10
      };
    case 'medium':
      return {
        targetFPS: 45,
        qualityLevel: 'medium',
        useSimplifiedEffects: true,
        disableBlur: false,
        disableShadows: true,
        particleCount: 500,
        maxAnimationsPerFrame: 5
      };
    case 'low':
      return {
        targetFPS: 30,
        qualityLevel: 'low',
        useSimplifiedEffects: true,
        disableBlur: true,
        disableShadows: true,
        particleCount: 200,
        maxAnimationsPerFrame: 2
      };
  }
};
