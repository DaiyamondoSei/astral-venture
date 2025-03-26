
/**
 * Performance Monitoring System Types
 * 
 * Re-exports all performance-related types, constants, and utilities
 */

// Export types
export * from './types';

// Export constants
export * from './constants';

// Export metric types
export * from './metrics';

// Type guards following the Type-Value pattern

// Device capability type guard
export function isDeviceCapability(value: unknown): value is DeviceCapability {
  return typeof value === 'string' && 
    Object.values(DeviceCapabilities).includes(value as any);
}

// Performance mode type guard
export function isPerformanceMode(value: unknown): value is PerformanceMode {
  return typeof value === 'string' && 
    Object.values(PerformanceModes).includes(value as any);
}

// Quality level type guard
export function isQualityLevel(value: unknown): value is QualityLevel {
  return typeof value === 'string' && 
    Object.values(QualityLevels).includes(value as any);
}

// Cube theme type guard
export function isCubeTheme(value: unknown): value is CubeTheme {
  return typeof value === 'string' && 
    Object.values(CubeThemes).includes(value as any);
}

// Cube size type guard
export function isCubeSize(value: unknown): value is CubeSize {
  return typeof value === 'string' && 
    Object.values(CubeSizes).includes(value as any);
}

// Glow intensity type guard
export function isGlowIntensity(value: unknown): value is GlowIntensity {
  return typeof value === 'string' && 
    Object.values(GlowIntensities).includes(value as any);
}

// Glassmorphic variant type guard
export function isGlassmorphicVariant(value: unknown): value is GlassmorphicVariant {
  return typeof value === 'string' && 
    Object.values(GlassmorphicVariants).includes(value as any);
}

// Detect device capability based on user agent and screen
export function detectDeviceCapability(): DeviceCapability {
  // Basic capability detection based on screen size and connection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /(iPad|tablet|Tablet)/i.test(navigator.userAgent);
  const smallScreen = window.innerWidth < 768;
  const slowConnection = (navigator as any).connection?.effectiveType === '2g' || 
                       (navigator as any).connection?.effectiveType === '3g';
  
  if (isMobile && smallScreen && slowConnection) {
    return DeviceCapabilities.LOW;
  }
  
  if (isMobile || isTablet || smallScreen || slowConnection) {
    return DeviceCapabilities.MEDIUM;
  }
  
  // Check for high-end device
  if (window.devicePixelRatio > 1.5 && window.innerWidth >= 1440) {
    return DeviceCapabilities.ULTRA;
  }
  
  return DeviceCapabilities.HIGH;
}
