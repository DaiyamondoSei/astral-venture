
/**
 * Utility for loading and managing sacred geometry resources
 * Handles loading, caching, and optimization of geometry assets
 */

import { SacredGeometryType, GeometryResourceType } from './emotion/types';

// Cache for loaded geometry resources
const geometryCache = new Map<string, GeometryResourceType>();

/**
 * Loads a sacred geometry resource with caching
 * @param geometryType Type of sacred geometry to load
 * @returns Promise resolving to the loaded geometry resource
 */
export async function loadGeometryResource(
  geometryType: SacredGeometryType
): Promise<GeometryResourceType> {
  // Check if geometry is already cached
  const cacheKey = `geometry-${geometryType}`;
  
  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey) as GeometryResourceType;
  }
  
  // Determine path based on geometry type
  let resourcePath = '';
  
  switch (geometryType) {
    case 'flowerOfLife':
      resourcePath = '/assets/geometries/flower-of-life.svg';
      break;
    case 'metatronsCube':
      resourcePath = '/assets/geometries/metatrons-cube.svg';
      break;
    case 'seedOfLife':
      resourcePath = '/assets/geometries/seed-of-life.svg';
      break;
    case 'treeOfLife':
      resourcePath = '/assets/geometries/tree-of-life.svg';
      break;
    default:
      resourcePath = '/assets/geometries/merkaba.svg';
  }
  
  try {
    // Load the geometry resource
    const response = await fetch(resourcePath);
    const svgContent = await response.text();
    
    const geometryResource: GeometryResourceType = {
      type: geometryType,
      svgContent,
      loaded: true,
      path: resourcePath
    };
    
    // Cache the resource
    geometryCache.set(cacheKey, geometryResource);
    
    return geometryResource;
  } catch (error) {
    console.error(`Failed to load geometry resource for ${geometryType}:`, error);
    
    // Return a fallback resource
    return {
      type: geometryType,
      svgContent: '',
      loaded: false,
      path: resourcePath,
      error: `Failed to load: ${error}`
    };
  }
}

/**
 * Preloads commonly used geometry resources
 * @returns Promise that resolves when preloading is complete
 */
export async function preloadCommonGeometries(): Promise<void> {
  const commonGeometries: SacredGeometryType[] = [
    'flowerOfLife',
    'seedOfLife',
    'metatronsCube'
  ];
  
  await Promise.all(
    commonGeometries.map(geometry => loadGeometryResource(geometry))
  );
  
  console.log('Preloaded common sacred geometries');
}

/**
 * Clears the geometry cache to free memory
 */
export function clearGeometryCache(): void {
  geometryCache.clear();
}

/**
 * Gets information about cached geometry resources
 * @returns Information about the cache status
 */
export function getGeometryCacheInfo(): {
  cacheSize: number;
  cachedGeometries: string[];
} {
  return {
    cacheSize: geometryCache.size,
    cachedGeometries: Array.from(geometryCache.keys())
  };
}
