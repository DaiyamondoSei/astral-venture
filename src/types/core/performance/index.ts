
/**
 * Performance Types and Constants Index
 * 
 * This file serves as the central export point for all performance-related
 * types and their corresponding runtime constants.
 * 
 * @version 1.0.0
 */

// Export all types
export * from './types';

// Export all runtime constants
export * from './constants';

// Export additional utility types
export * from './config';
export * from './metrics';

// Type guards and utility functions
export const isValidDeviceCapability = (value: unknown): value is DeviceCapability => {
  return typeof value === 'string' && 
    Object.values(DeviceCapabilities).includes(value as DeviceCapability);
};

export const isValidPerformanceMode = (value: unknown): value is PerformanceMode => {
  return typeof value === 'string' && 
    Object.values(PerformanceModes).includes(value as PerformanceMode);
};

export const isValidQualityLevel = (value: unknown): value is QualityLevel => {
  return typeof value === 'string' && 
    Object.values(QualityLevels).includes(value as QualityLevel);
};

export const isValidCubeTheme = (value: unknown): value is CubeTheme => {
  return typeof value === 'string' && 
    Object.values(CubeThemes).includes(value as CubeTheme);
};

export const isValidCubeSize = (value: unknown): value is CubeSize => {
  return typeof value === 'string' && 
    Object.values(CubeSizes).includes(value as CubeSize);
};

export const isValidGlowIntensity = (value: unknown): value is GlowIntensity => {
  return typeof value === 'string' && 
    Object.values(GlowIntensities).includes(value as GlowIntensity);
};

export const isValidGlassmorphicVariant = (value: unknown): value is GlassmorphicVariant => {
  return typeof value === 'string' && 
    Object.values(GlassmorphicVariants).includes(value as GlassmorphicVariant);
};
