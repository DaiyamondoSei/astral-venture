
import { DeviceCapability, PerformanceMode } from './core/types';
import { ComponentMetrics } from './core/metrics';

export const getPerformanceMode = (capability: DeviceCapability): PerformanceMode => {
  switch (capability) {
    case 'high':
      return 'quality';
    case 'medium':
      return 'balanced';
    case 'low':
      return 'performance';
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

export const detectDeviceCapability = (): DeviceCapability => {
  // Only run in browser environment
  if (typeof window === 'undefined') return 'medium';
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check for available memory
  const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
  
  // Check for CPU cores
  const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  // Check for WebGL capabilities
  let webGLSupport = 'high';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
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
  } else if (!isMobile && !lowMemory && !lowCPU && webGLSupport === 'high') {
    return 'high';
  }
  
  return 'medium';
};

// Performance monitoring utilities
export const getComponentMetrics = (component: string): ComponentMetrics => ({
  componentName: component,
  renderCount: 0,
  totalRenderTime: 0,
  averageRenderTime: 0,
  lastRenderTime: 0
});

export { DeviceCapability, PerformanceMode };
