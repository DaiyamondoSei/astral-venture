
/**
 * Performance Core Utilities
 * 
 * Core utility functions for performance classification and adaptive rendering.
 */
import { DeviceCapability, QualityLevel } from './types';
import { DEFAULT_QUALITY_LEVELS, DEFAULT_PERFORMANCE_BOUNDARIES } from './constants';

/**
 * Get quality level settings based on level index
 */
export function getQualityLevel(level: number): QualityLevel {
  // Ensure level is within bounds
  const boundedLevel = Math.max(1, Math.min(level, DEFAULT_QUALITY_LEVELS.length));
  return DEFAULT_QUALITY_LEVELS[boundedLevel - 1];
}

/**
 * Calculate recommended quality level based on device capability and performance metrics
 */
export function calculateRecommendedQualityLevel(
  deviceCapability: DeviceCapability,
  fps?: number,
  memoryUsage?: number
): number {
  // Base level on device capability
  let baseLevel: number;
  switch (deviceCapability) {
    case 'high':
      baseLevel = 4;
      break;
    case 'medium':
      baseLevel = 2;
      break;
    case 'low':
    default:
      baseLevel = 1;
      break;
  }
  
  // Adjust based on FPS if available
  if (fps !== undefined) {
    if (fps < DEFAULT_PERFORMANCE_BOUNDARIES.lowFPS) {
      baseLevel = Math.max(1, baseLevel - 2);
    } else if (fps < DEFAULT_PERFORMANCE_BOUNDARIES.mediumFPS) {
      baseLevel = Math.max(1, baseLevel - 1);
    } else if (fps > DEFAULT_PERFORMANCE_BOUNDARIES.highFPS) {
      baseLevel = Math.min(5, baseLevel + 1);
    }
  }
  
  // Adjust based on memory usage if available
  if (memoryUsage !== undefined) {
    if (memoryUsage > DEFAULT_PERFORMANCE_BOUNDARIES.criticalMemory) {
      baseLevel = 1; // Critical memory usage, force lowest quality
    } else if (memoryUsage > DEFAULT_PERFORMANCE_BOUNDARIES.highMemory) {
      baseLevel = Math.max(1, baseLevel - 1);
    }
  }
  
  return baseLevel;
}

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

/**
 * Get particle count based on quality level and effect type
 */
export function getParticleCount(
  qualityLevel: number,
  effectType: 'background' | 'interaction' | 'core' = 'background'
): number {
  const level = getQualityLevel(qualityLevel);
  const baseCount = level.particleCount;
  
  switch (effectType) {
    case 'interaction':
      return Math.floor(baseCount * 0.5); // Fewer particles for interactions
    case 'core':
      return Math.floor(baseCount * 1.5); // More particles for core effects
    case 'background':
    default:
      return baseCount;
  }
}

/**
 * Get geometry detail level based on quality setting
 */
export function getGeometryDetail(qualityLevel: number): {
  vertices: number;
  segments: number;
  resolution: number;
} {
  const level = getQualityLevel(qualityLevel);
  const baseDetail = level.geometryDetail;
  
  return {
    vertices: 4 + (baseDetail * 2), // 6, 8, 10, 12, 14
    segments: 3 + baseDetail, // 4, 5, 6, 7, 8
    resolution: baseDetail // 1, 2, 3, 4, 5
  };
}

/**
 * Determine if a specific visual feature should be enabled based on quality level
 */
export function shouldEnableFeature(
  feature: 'particles' | 'glow' | 'shadows' | 'reflections' | 'distortions',
  qualityLevel: number
): boolean {
  const level = getQualityLevel(qualityLevel);
  
  switch (feature) {
    case 'particles':
      return level.level >= 1; // Enabled at all levels
    case 'glow':
      return level.level >= 2; // Medium and above
    case 'shadows':
      return level.level >= 3; // High and above
    case 'reflections':
      return level.level >= 4; // Ultra and above
    case 'distortions':
      return level.level >= 5; // Only at Extreme
    default:
      return false;
  }
}
