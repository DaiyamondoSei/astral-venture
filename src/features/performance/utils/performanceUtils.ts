
import { DeviceCapability } from '@/types/performance';

/**
 * Detect the device capability based on browser features and device specs
 * without modifying protected components
 */
export function detectDeviceCapability(): DeviceCapability {
  // Check if running in a browser environment
  if (typeof window === 'undefined') {
    return 'medium';
  }
  
  // Get available logical processors (cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check for device memory API
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check for connection type
  const connection = (navigator as any).connection;
  const connectionType = connection?.effectiveType || '4g';
  
  // Check for touchscreen as a proxy for mobile device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Simple heuristic for device capability
  if (
    (cores <= 2) || 
    (memory <= 2) || 
    (connectionType === '2g' || connectionType === 'slow-2g') ||
    (isTouchDevice && cores <= 4 && memory <= 4)
  ) {
    return 'low';
  } else if (
    (cores >= 8) && 
    (memory >= 8) && 
    (connectionType === '4g' || connectionType === 'wifi')
  ) {
    return 'high';
  } else {
    return 'medium';
  }
}

/**
 * Get optimal sampling rate based on device capability
 */
export function getOptimalSamplingRate(deviceCapability: DeviceCapability): number {
  switch (deviceCapability) {
    case 'low':
      return 0.05; // 5% sampling rate
    case 'medium':
      return 0.1; // 10% sampling rate
    case 'high':
      return 0.2; // 20% sampling rate
    default:
      return 0.1;
  }
}

/**
 * Get optimal animation settings based on device capability
 */
export function getAnimationSettings(deviceCapability: DeviceCapability) {
  switch (deviceCapability) {
    case 'low':
      return {
        disableBlur: true,
        disableShadows: true,
        particleCount: 0.3,
        maxAnimationsPerFrame: 2
      };
    case 'medium':
      return {
        disableBlur: false,
        disableShadows: true,
        particleCount: 0.6,
        maxAnimationsPerFrame: 5
      };
    case 'high':
      return {
        disableBlur: false,
        disableShadows: false,
        particleCount: 1.0,
        maxAnimationsPerFrame: 10
      };
    default:
      return {
        disableBlur: false,
        disableShadows: false,
        particleCount: 0.6,
        maxAnimationsPerFrame: 5
      };
  }
}
