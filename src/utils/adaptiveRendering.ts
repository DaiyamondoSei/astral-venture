
/**
 * Adaptive rendering utilities for optimizing performance
 * Adjusts rendering quality based on device capabilities
 */

import { getPerformanceCategory } from './performanceUtils';

/**
 * Different quality levels for adaptive rendering
 */
export type RenderQuality = 'low' | 'medium' | 'high';

/**
 * Controls for optimized rendering
 */
export interface AdaptiveRenderingControls {
  // Whether to render particles
  enableParticles: boolean;
  
  // Maximum number of particles to render
  maxParticles: number;
  
  // Whether to use blur effects
  enableBlur: boolean;
  
  // Blur intensity (0-10)
  blurIntensity: number;
  
  // Whether to use shadows
  enableShadows: boolean;
  
  // Shadow quality (0-10)
  shadowQuality: number;
  
  // Whether to use complex animations
  enableComplexAnimations: boolean;
  
  // Animation frame rate limiter
  frameRateLimit: number;
  
  // Whether to render non-essential decorative elements
  renderDecorations: boolean;
}

/**
 * Get adaptive rendering controls based on device capabilities
 */
export function getAdaptiveRenderingControls(): AdaptiveRenderingControls {
  const deviceCapability = getPerformanceCategory();
  
  switch(deviceCapability) {
    case 'low':
      return {
        enableParticles: false,
        maxParticles: 10,
        enableBlur: false,
        blurIntensity: 0,
        enableShadows: false,
        shadowQuality: 0,
        enableComplexAnimations: false,
        frameRateLimit: 30,
        renderDecorations: false
      };
      
    case 'medium':
      return {
        enableParticles: true,
        maxParticles: 50,
        enableBlur: true,
        blurIntensity: 3,
        enableShadows: true,
        shadowQuality: 3,
        enableComplexAnimations: false,
        frameRateLimit: 60,
        renderDecorations: true
      };
      
    case 'high':
    default:
      return {
        enableParticles: true,
        maxParticles: 200,
        enableBlur: true,
        blurIntensity: 5,
        enableShadows: true,
        shadowQuality: 8,
        enableComplexAnimations: true,
        frameRateLimit: 60,
        renderDecorations: true
      };
  }
}

/**
 * Get the appropriate number of items to render based on device capability
 * Useful for limiting lists, grids, etc. on lower-end devices
 */
export function getAdaptiveItemCount(
  lowCount: number, 
  mediumCount: number, 
  highCount: number
): number {
  const deviceCapability = getPerformanceCategory();
  
  switch(deviceCapability) {
    case 'low': return lowCount;
    case 'medium': return mediumCount;
    case 'high': return highCount;
    default: return mediumCount;
  }
}

/**
 * Get animation duration adjusted for device capability
 * Can be used to speed up animations on lower-end devices
 */
export function getAdaptiveAnimationDuration(
  baseDuration: number
): number {
  const deviceCapability = getPerformanceCategory();
  
  switch(deviceCapability) {
    case 'low': return baseDuration * 0.5; // Faster animations on low-end devices
    case 'medium': return baseDuration * 0.8;
    case 'high': return baseDuration;
    default: return baseDuration;
  }
}

/**
 * Determine if an optional visual effect should be rendered
 */
export function shouldRenderEffect(effectImportance: 'low' | 'medium' | 'high'): boolean {
  const deviceCapability = getPerformanceCategory();
  
  switch(effectImportance) {
    case 'low':
      // Only render low-importance effects on high-end devices
      return deviceCapability === 'high';
      
    case 'medium':
      // Render medium-importance effects on medium and high-end devices
      return deviceCapability === 'medium' || deviceCapability === 'high';
      
    case 'high':
      // Always render high-importance effects
      return true;
      
    default:
      return deviceCapability === 'high';
  }
}
