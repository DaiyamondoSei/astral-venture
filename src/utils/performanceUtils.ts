
import { 
  DeviceCapability, 
  PerformanceMode, 
  RenderFrequency, 
  PerformanceSettings,
  QualityLevel
} from './performance/types';

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

export const getParticleCount = (capability: DeviceCapability, type: 'core' | 'background' = 'core'): number => {
  const multiplier = type === 'background' ? 0.5 : 1;
  
  switch (capability) {
    case 'high':
      return Math.floor(1000 * multiplier);
    case 'medium':
      return Math.floor(500 * multiplier);
    case 'low':
      return Math.floor(200 * multiplier);
  }
};

export const shouldEnableFeature = (
  capability: DeviceCapability,
  feature: 'particles' | 'blur' | 'shadows' | 'complexAnimations'
): boolean => {
  switch (capability) {
    case 'high':
      return true;
    case 'medium':
      return feature !== 'complexAnimations' && feature !== 'blur';
    case 'low':
      return false;
  }
};

export const getGeometryDetail = (capability: DeviceCapability): number => {
  switch (capability) {
    case 'high':
      return 1;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.5;
  }
};

/**
 * Detect device capability based on hardware and browser features
 */
export function detectDeviceCapability(): DeviceCapability {
  // Only run in browser environment
  if (typeof window === 'undefined') return 'medium';
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check for available memory (if available in the browser)
  const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
  
  // Check for CPU cores
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  // Check for WebGL capabilities
  let webGLSupport = 'high';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) webGLSupport = 'low';
    else {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer.includes('Intel')) webGLSupport = 'medium';
      }
    }
  } catch (e) {
    webGLSupport = 'low';
  }
  
  // Determine capability level
  if (isMobile && (lowMemory || lowCPU || webGLSupport === 'low')) {
    return 'low';
  } else if (
    (navigator as any).deviceMemory &&
    (navigator as any).deviceMemory >= 8 &&
    navigator.hardwareConcurrency &&
    navigator.hardwareConcurrency >= 8 &&
    webGLSupport === 'high'
  ) {
    return 'high';
  }
  
  return 'medium';
}
