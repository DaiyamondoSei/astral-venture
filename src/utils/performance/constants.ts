
import { 
  DeviceCapability,
  PerformanceMode,
  QualityLevel,
  RenderFrequency
} from '@/utils/performance/types';

// Runtime representation of DeviceCapability
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Runtime representation of PerformanceMode
export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode
};

// Runtime representation of QualityLevel
export const QualityLevels = {
  LOW: 'low' as QualityLevel,
  MEDIUM: 'medium' as QualityLevel,
  HIGH: 'high' as QualityLevel,
  ULTRA: 'ultra' as QualityLevel
};

// Runtime representation of RenderFrequency
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency
};

/**
 * Helper function to detect device capability based on browser features
 */
export function detectDeviceCapability(): DeviceCapability {
  // Implementation would use navigator.hardwareConcurrency, etc.
  // Simplified version for now
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  
  if (memory >= 8 && cores >= 8) {
    return DeviceCapabilities.HIGH;
  } else if (memory >= 4 && cores >= 4) {
    return DeviceCapabilities.MEDIUM;
  } else {
    return DeviceCapabilities.LOW;
  }
}

// Default performance settings based on device capability
export const DEFAULT_PERFORMANCE_SETTINGS = {
  [DeviceCapabilities.LOW]: {
    targetFPS: 30,
    qualityLevel: QualityLevels.LOW,
    particleCount: 50,
    disableBlur: true,
    disableShadows: true,
    useSimplifiedEffects: true,
    maxAnimationsPerFrame: 2
  },
  [DeviceCapabilities.MEDIUM]: {
    targetFPS: 45,
    qualityLevel: QualityLevels.MEDIUM,
    particleCount: 150,
    disableBlur: false,
    disableShadows: false,
    useSimplifiedEffects: false,
    maxAnimationsPerFrame: 4
  },
  [DeviceCapabilities.HIGH]: {
    targetFPS: 60,
    qualityLevel: QualityLevels.HIGH,
    particleCount: 300,
    disableBlur: false,
    disableShadows: false,
    useSimplifiedEffects: false,
    maxAnimationsPerFrame: 8
  }
};
