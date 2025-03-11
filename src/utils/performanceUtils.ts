
/**
 * Performance Utilities
 * 
 * Utilities for performance classification, adaptive rendering, and resource optimization.
 */

// Device capability classification
export type DeviceCapability = 'low' | 'medium' | 'high';

// Quality level for adaptive rendering
export interface QualityLevel {
  level: number;
  name: string;
  description: string;
  particleCount: number;
  effectsEnabled: boolean;
  animationComplexity: number;
  geometryDetail: number;
  textureResolution: number;
}

// Performance category boundaries
export interface PerformanceBoundaries {
  lowFPS: number;
  mediumFPS: number;
  highFPS: number;
  criticalMemory: number;
  highMemory: number;
  mediumMemory: number;
}

// Default quality levels
export const DEFAULT_QUALITY_LEVELS: QualityLevel[] = [
  {
    level: 1,
    name: 'Low',
    description: 'Minimal visual effects, optimized for low-end devices',
    particleCount: 50,
    effectsEnabled: false,
    animationComplexity: 1,
    geometryDetail: 1,
    textureResolution: 1
  },
  {
    level: 2,
    name: 'Medium',
    description: 'Balanced visual effects, suitable for most devices',
    particleCount: 200,
    effectsEnabled: true,
    animationComplexity: 2,
    geometryDetail: 2,
    textureResolution: 2
  },
  {
    level: 3,
    name: 'High',
    description: 'Enhanced visual effects with moderate complexity',
    particleCount: 500,
    effectsEnabled: true,
    animationComplexity: 3,
    geometryDetail: 3,
    textureResolution: 3
  },
  {
    level: 4,
    name: 'Ultra',
    description: 'Maximum visual quality with full effects',
    particleCount: 1000,
    effectsEnabled: true,
    animationComplexity: 4,
    geometryDetail: 4,
    textureResolution: 4
  },
  {
    level: 5,
    name: 'Extreme',
    description: 'Exceptional visual quality for high-end devices',
    particleCount: 2000,
    effectsEnabled: true,
    animationComplexity: 5,
    geometryDetail: 5,
    textureResolution: 5
  }
];

// Default performance boundaries
export const DEFAULT_PERFORMANCE_BOUNDARIES: PerformanceBoundaries = {
  lowFPS: 30,
  mediumFPS: 45,
  highFPS: 60,
  criticalMemory: 500 * 1024 * 1024, // 500MB
  highMemory: 350 * 1024 * 1024, // 350MB
  mediumMemory: 200 * 1024 * 1024 // 200MB
};

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

/**
 * Get animation complexity parameters based on quality level
 */
export function getAnimationComplexity(qualityLevel: number): {
  framerate: number;
  steps: number;
  interpolation: 'linear' | 'cubic' | 'spring';
} {
  const level = getQualityLevel(qualityLevel);
  const complexity = level.animationComplexity;
  
  let interpolation: 'linear' | 'cubic' | 'spring';
  switch (complexity) {
    case 1:
      interpolation = 'linear';
      break;
    case 2:
    case 3:
      interpolation = 'cubic';
      break;
    default:
      interpolation = 'spring';
      break;
  }
  
  return {
    framerate: 30 + (complexity * 10), // 40, 50, 60, 70, 80
    steps: 2 + complexity, // 3, 4, 5, 6, 7
    interpolation
  };
}

export default {
  getQualityLevel,
  calculateRecommendedQualityLevel,
  getParticleCount,
  getGeometryDetail,
  shouldEnableFeature,
  getAnimationComplexity,
  DEFAULT_QUALITY_LEVELS,
  DEFAULT_PERFORMANCE_BOUNDARIES
};
