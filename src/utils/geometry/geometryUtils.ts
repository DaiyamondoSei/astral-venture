
/**
 * Geometry Utilities
 * 
 * Provides functions for procedural generation of sacred geometry patterns.
 * This serves as a local fallback when AI-generated geometry is not available.
 */

import { GeometryPattern } from '../ai/VisualProcessingService';

// Constants for pattern types
export const GEOMETRY_TYPES = {
  FLOWER_OF_LIFE: 'flower_of_life',
  METATRON_CUBE: 'metatron_cube',
  SRI_YANTRA: 'sri_yantra',
  FIBONACCI_SPIRAL: 'fibonacci_spiral',
  SEED_OF_LIFE: 'seed_of_life',
  MERKABA: 'merkaba',
  TORUS: 'torus'
};

// Chakra associations for geometry patterns
export const GEOMETRY_CHAKRA_MAPPING = {
  [GEOMETRY_TYPES.FLOWER_OF_LIFE]: [2, 4, 6],  // Sacral, Heart, Third Eye
  [GEOMETRY_TYPES.METATRON_CUBE]: [3, 6, 7],   // Solar Plexus, Third Eye, Crown
  [GEOMETRY_TYPES.SRI_YANTRA]: [1, 4, 7],      // Root, Heart, Crown
  [GEOMETRY_TYPES.FIBONACCI_SPIRAL]: [2, 5],   // Sacral, Throat
  [GEOMETRY_TYPES.SEED_OF_LIFE]: [1, 2, 4],    // Root, Sacral, Heart
  [GEOMETRY_TYPES.MERKABA]: [3, 6, 7],         // Solar Plexus, Third Eye, Crown
  [GEOMETRY_TYPES.TORUS]: [4, 7]               // Heart, Crown
};

/**
 * Generate a pseudo-random number based on a string seed
 */
export function seedRandom(seed: string): () => number {
  // Simple implementation of seeded PRNG
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Return a function that generates a random number between 0 and 1
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Generate points for a circle
 */
function generateCirclePoints(centerX: number, centerY: number, radius: number, numPoints: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push([x, y]);
  }
  return points;
}

/**
 * Generate a SVG path for a circle
 */
function generateCirclePath(centerX: number, centerY: number, radius: number): string {
  return `M ${centerX - radius} ${centerY} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`;
}

/**
 * Generate a Flower of Life pattern
 */
function generateFlowerOfLife(random: () => number, complexity: number): { svgPath: string; points: [number, number][] } {
  const centerX = 50;
  const centerY = 50;
  const baseRadius = 10 + (random() * 5);
  const circleCount = 1 + Math.floor(complexity * 2);
  
  let svgPath = '';
  const points: [number, number][] = [];
  
  // Center circle
  svgPath += generateCirclePath(centerX, centerY, baseRadius);
  points.push(...generateCirclePoints(centerX, centerY, baseRadius, 12));
  
  // Surrounding circles
  for (let i = 0; i < circleCount; i++) {
    const angle = (i / circleCount) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * baseRadius;
    const y = centerY + Math.sin(angle) * baseRadius;
    
    svgPath += ' ' + generateCirclePath(x, y, baseRadius);
    points.push(...generateCirclePoints(x, y, baseRadius, 12));
    
    if (complexity > 2) {
      // Add a second layer for higher complexity
      const outerAngle = (i / circleCount) * Math.PI * 2;
      const outerX = centerX + Math.cos(outerAngle) * (baseRadius * 2);
      const outerY = centerY + Math.sin(outerAngle) * (baseRadius * 2);
      
      svgPath += ' ' + generateCirclePath(outerX, outerY, baseRadius);
      points.push(...generateCirclePoints(outerX, outerY, baseRadius, 12));
    }
  }
  
  return { svgPath, points };
}

/**
 * Generate a Sri Yantra pattern (simplified)
 */
function generateSriYantra(random: () => number, complexity: number): { svgPath: string; points: [number, number][] } {
  const centerX = 50;
  const centerY = 50;
  const baseSize = 20 + (random() * 10);
  const triangles = Math.min(4 + Math.floor(complexity), 9);
  
  let svgPath = '';
  const points: [number, number][] = [];
  
  // Generate triangles
  for (let i = 0; i < triangles; i++) {
    const size = baseSize * (1 - i * 0.1);
    const upOffset = i * 1.5;
    const downOffset = i * 1.5;
    
    // Upward triangle
    const upP1: [number, number] = [centerX, centerY - size + upOffset];
    const upP2: [number, number] = [centerX + size, centerY + size/2 + upOffset];
    const upP3: [number, number] = [centerX - size, centerY + size/2 + upOffset];
    
    svgPath += ` M ${upP1[0]} ${upP1[1]} L ${upP2[0]} ${upP2[1]} L ${upP3[0]} ${upP3[1]} Z`;
    points.push(upP1, upP2, upP3);
    
    // Downward triangle
    const downP1: [number, number] = [centerX, centerY + size - downOffset];
    const downP2: [number, number] = [centerX + size, centerY - size/2 - downOffset];
    const downP3: [number, number] = [centerX - size, centerY - size/2 - downOffset];
    
    svgPath += ` M ${downP1[0]} ${downP1[1]} L ${downP2[0]} ${downP2[1]} L ${downP3[0]} ${downP3[1]} Z`;
    points.push(downP1, downP2, downP3);
  }
  
  // Add center point and bindu (dot)
  svgPath += ` M ${centerX-1} ${centerY} a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0`;
  points.push([centerX, centerY]);
  
  return { svgPath, points };
}

/**
 * Generate a Metatron's Cube pattern
 */
function generateMetatronCube(random: () => number, complexity: number): { svgPath: string; points: [number, number][] } {
  const centerX = 50;
  const centerY = 50;
  const radius = 20 + (random() * 10);
  
  const points: [number, number][] = [];
  let svgPath = '';
  
  // Create hexagon vertices
  const hexPoints: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    hexPoints.push([x, y]);
  }
  
  // Add center point
  points.push([centerX, centerY]);
  
  // Draw hexagon
  svgPath += `M ${hexPoints[0][0]} ${hexPoints[0][1]}`;
  hexPoints.forEach(point => {
    svgPath += ` L ${point[0]} ${point[1]}`;
    points.push(point);
  });
  svgPath += ' Z';
  
  // Add inner lines based on complexity
  if (complexity >= 2) {
    // Connect center to vertices
    hexPoints.forEach(point => {
      svgPath += ` M ${centerX} ${centerY} L ${point[0]} ${point[1]}`;
    });
    
    // Connect alternate vertices if high complexity
    if (complexity >= 3) {
      for (let i = 0; i < 6; i++) {
        const p1 = hexPoints[i];
        for (let j = i + 2; j < 6; j++) {
          const p2 = hexPoints[j];
          svgPath += ` M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]}`;
        }
      }
    }
  }
  
  return { svgPath, points };
}

/**
 * Generate a pattern based on the seed and complexity
 */
export function generateLocalGeometry(
  seed: string,
  complexity: number = 3,
  chakraAssociations: number[] = []
): GeometryPattern {
  // Create random generator from seed
  const random = seedRandom(seed);
  
  // Determine pattern type based on seed and chakra associations
  let patternType = GEOMETRY_TYPES.FLOWER_OF_LIFE;
  
  // If chakras are provided, find best matching pattern
  if (chakraAssociations.length > 0) {
    let bestMatch = 0;
    let bestPatternType = patternType;
    
    // Find pattern with most chakra matches
    Object.entries(GEOMETRY_CHAKRA_MAPPING).forEach(([type, chakras]) => {
      const matches = chakraAssociations.filter(chakra => chakras.includes(chakra)).length;
      if (matches > bestMatch) {
        bestMatch = matches;
        bestPatternType = type;
      }
    });
    
    // Use best match if found, otherwise random
    if (bestMatch > 0) {
      patternType = bestPatternType;
    } else {
      // Random selection based on seed
      const patternTypes = Object.values(GEOMETRY_TYPES);
      patternType = patternTypes[Math.floor(random() * patternTypes.length)];
    }
  } else {
    // Random selection based on seed if no chakras provided
    const patternTypes = Object.values(GEOMETRY_TYPES);
    patternType = patternTypes[Math.floor(random() * patternTypes.length)];
  }
  
  // Generate the pattern based on type
  let patternData: { svgPath: string; points: [number, number][] };
  
  switch (patternType) {
    case GEOMETRY_TYPES.FLOWER_OF_LIFE:
      patternData = generateFlowerOfLife(random, complexity);
      break;
    case GEOMETRY_TYPES.SRI_YANTRA:
      patternData = generateSriYantra(random, complexity);
      break;
    case GEOMETRY_TYPES.METATRON_CUBE:
      patternData = generateMetatronCube(random, complexity);
      break;
    default:
      patternData = generateFlowerOfLife(random, complexity);
  }
  
  // Map pattern type to chakra associations if none provided
  const associatedChakras = chakraAssociations.length > 0 
    ? chakraAssociations 
    : GEOMETRY_CHAKRA_MAPPING[patternType] || [];
  
  // Generate energy alignment based on chakra associations
  const energyAlignment = associatedChakras.map(chakraId => {
    switch (chakraId) {
      case 1: return 'grounding';
      case 2: return 'creative';
      case 3: return 'empowering';
      case 4: return 'loving';
      case 5: return 'expressive';
      case 6: return 'intuitive';
      case 7: return 'transcendent';
      default: return 'balanced';
    }
  });
  
  // Create animation properties based on pattern type and complexity
  const animationProperties = {
    duration: 3000 + (complexity * 1000),
    easing: 'ease-in-out',
    rotation: patternType === GEOMETRY_TYPES.FLOWER_OF_LIFE || patternType === GEOMETRY_TYPES.TORUS,
    pulsate: patternType === GEOMETRY_TYPES.SRI_YANTRA || patternType === GEOMETRY_TYPES.MERKABA,
    scale: random() > 0.5,
    particleEffect: complexity > 3
  };
  
  return {
    svgPath: patternData.svgPath,
    points: patternData.points,
    complexity,
    energyAlignment,
    chakraAssociations: associatedChakras,
    animationProperties
  };
}
