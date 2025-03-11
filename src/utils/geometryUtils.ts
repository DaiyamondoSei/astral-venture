
/**
 * Sacred Geometry Utilities
 * 
 * Utility functions for generating sacred geometry patterns and configurations.
 */

// Phi - Golden Ratio
export const PHI = 1.61803398875;

/**
 * Generate points for a regular polygon
 * @param sides Number of sides
 * @param radius Radius of the polygon
 * @param rotation Rotation in radians
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generatePolygonPoints(
  sides: number,
  radius: number,
  rotation: number = 0,
  centerX: number = 0,
  centerY: number = 0
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const angleStep = (Math.PI * 2) / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + rotation;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Generate points for Seed of Life pattern
 * @param radius Radius of the pattern
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateSeedOfLife(
  radius: number,
  centerX: number = 0,
  centerY: number = 0
): { circles: Array<{ x: number; y: number; r: number }> } {
  const circles: Array<{ x: number; y: number; r: number }> = [];
  
  // Center circle
  circles.push({ x: centerX, y: centerY, r: radius });
  
  // Surrounding circles
  const points = generatePolygonPoints(6, radius, 0, centerX, centerY);
  points.forEach(point => {
    circles.push({ x: point.x, y: point.y, r: radius });
  });
  
  return { circles };
}

/**
 * Generate points for Flower of Life pattern
 * @param iterations Number of iterations (1-3)
 * @param radius Base radius
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateFlowerOfLife(
  iterations: number = 2,
  radius: number,
  centerX: number = 0,
  centerY: number = 0
): { circles: Array<{ x: number; y: number; r: number }> } {
  // Cap iterations for performance
  const boundedIterations = Math.min(3, Math.max(1, iterations));
  const circles: Array<{ x: number; y: number; r: number }> = [];
  const processedPoints = new Set<string>();
  
  // Helper to check if we already processed a point
  const hasProcessedPoint = (x: number, y: number): boolean => {
    const key = `${x.toFixed(3)},${y.toFixed(3)}`;
    if (processedPoints.has(key)) return true;
    processedPoints.add(key);
    return false;
  };
  
  // Initial center circle
  circles.push({ x: centerX, y: centerY, r: radius });
  hasProcessedPoint(centerX, centerY);
  
  // Queue for BFS approach
  const queue: Array<{ x: number; y: number; iteration: number }> = [
    { x: centerX, y: centerY, iteration: 0 }
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Stop if we've reached the iteration limit
    if (current.iteration >= boundedIterations) continue;
    
    // Generate surrounding circles
    const points = generatePolygonPoints(6, radius, 0, current.x, current.y);
    
    for (const point of points) {
      if (!hasProcessedPoint(point.x, point.y)) {
        circles.push({ x: point.x, y: point.y, r: radius });
        queue.push({ x: point.x, y: point.y, iteration: current.iteration + 1 });
      }
    }
  }
  
  return { circles };
}

/**
 * Generate Metatron's Cube pattern
 * @param radius Base radius
 * @param detail Detail level (1-5)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateMetatronsCube(
  radius: number,
  detail: number = 3,
  centerX: number = 0,
  centerY: number = 0
): { 
  nodes: Array<{ id: string; x: number; y: number; size: number }>;
  connections: Array<{ from: string; to: string }>;
} {
  // Cap detail level
  const boundedDetail = Math.min(5, Math.max(1, detail));
  
  const nodes: Array<{ id: string; x: number; y: number; size: number }> = [];
  const connections: Array<{ from: string; to: string }> = [];
  
  // Center node
  nodes.push({ id: 'center', x: centerX, y: centerY, size: radius * 0.15 });
  
  // First hexagon
  const firstHexPoints = generatePolygonPoints(6, radius, 0, centerX, centerY);
  firstHexPoints.forEach((point, index) => {
    const id = `hex1_${index}`;
    nodes.push({ id, x: point.x, y: point.y, size: radius * 0.12 });
    connections.push({ from: 'center', to: id });
    
    // Connect hexagon points
    const nextIndex = (index + 1) % 6;
    const nextId = `hex1_${nextIndex}`;
    connections.push({ from: id, to: nextId });
  });
  
  // Second hexagon for higher detail
  if (boundedDetail >= 2) {
    const secondHexPoints = generatePolygonPoints(6, radius * 2, 0, centerX, centerY);
    secondHexPoints.forEach((point, index) => {
      const id = `hex2_${index}`;
      nodes.push({ id, x: point.x, y: point.y, size: radius * 0.1 });
      
      // Connect to first hexagon
      const firstHexId = `hex1_${index}`;
      connections.push({ from: firstHexId, to: id });
      
      // Connect hexagon points
      const nextIndex = (index + 1) % 6;
      const nextId = `hex2_${nextIndex}`;
      connections.push({ from: id, to: nextId });
    });
  }
  
  // Add Platonic solid vertices for higher detail levels
  if (boundedDetail >= 3) {
    // Additional connection points for higher detail
    const additionalPoints = [];
    
    if (boundedDetail >= 3) {
      // Add tetrahedron points
      additionalPoints.push(
        { id: 'tetra_0', x: centerX, y: centerY - radius * 1.5, size: radius * 0.08 },
        { id: 'tetra_1', x: centerX + radius * 1.3, y: centerY + radius * 0.75, size: radius * 0.08 },
        { id: 'tetra_2', x: centerX - radius * 1.3, y: centerY + radius * 0.75, size: radius * 0.08 }
      );
    }
    
    if (boundedDetail >= 4) {
      // Add octahedron points
      additionalPoints.push(
        { id: 'octa_0', x: centerX, y: centerY - radius * 2, size: radius * 0.07 },
        { id: 'octa_1', x: centerX + radius * 2, y: centerY, size: radius * 0.07 },
        { id: 'octa_2', x: centerX, y: centerY + radius * 2, size: radius * 0.07 },
        { id: 'octa_3', x: centerX - radius * 2, y: centerY, size: radius * 0.07 }
      );
    }
    
    if (boundedDetail >= 5) {
      // Add icosahedron points (simplified for 2D)
      const icoRadius = radius * 1.8;
      const icoPoints = generatePolygonPoints(10, icoRadius, Math.PI / 10, centerX, centerY);
      icoPoints.forEach((point, index) => {
        additionalPoints.push({ 
          id: `ico_${index}`, 
          x: point.x, 
          y: point.y, 
          size: radius * 0.06 
        });
      });
    }
    
    // Add the additional points and their connections
    additionalPoints.forEach(point => {
      nodes.push(point);
      
      // Connect to closest points
      nodes.forEach(existingNode => {
        if (existingNode.id !== point.id) {
          const dx = existingNode.x - point.x;
          const dy = existingNode.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if within threshold distance
          if (distance < radius * 2) {
            connections.push({ from: point.id, to: existingNode.id });
          }
        }
      });
    });
  }
  
  return { nodes, connections };
}

/**
 * Generate Vesica Piscis
 * @param radius Circle radius
 * @param overlap Overlap amount (0-1)
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateVesicaPiscis(
  radius: number,
  overlap: number = 0.5,
  centerX: number = 0,
  centerY: number = 0
): { 
  circles: Array<{ x: number; y: number; r: number }>;
  intersectionPoints: Array<{ x: number; y: number }>;
} {
  // Ensure overlap is between 0 and 1
  const boundedOverlap = Math.min(1, Math.max(0, overlap));
  
  // Distance between circle centers
  const distance = radius * 2 * (1 - boundedOverlap);
  
  // Circle centers
  const circle1X = centerX - distance / 2;
  const circle2X = centerX + distance / 2;
  
  // Calculate intersection points
  const h = Math.sqrt(radius * radius - (distance / 2) * (distance / 2));
  const intersectionPoints = [
    { x: centerX, y: centerY + h },
    { x: centerX, y: centerY - h }
  ];
  
  return {
    circles: [
      { x: circle1X, y: centerY, r: radius },
      { x: circle2X, y: centerY, r: radius }
    ],
    intersectionPoints
  };
}

/**
 * Generate Sri Yantra (simplified 2D version)
 * @param size Overall size
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateSriYantra(
  size: number,
  centerX: number = 0,
  centerY: number = 0
): {
  triangles: Array<{ points: Array<{ x: number; y: number }> }>;
  circles: Array<{ x: number; y: number; r: number }>;
  bindu: { x: number; y: number; r: number };
} {
  const triangles = [];
  const upwardSize = size * 0.85;
  const downwardSize = size;
  
  // Generate 4 upward triangles
  for (let i = 0; i < 4; i++) {
    const scale = 1 - i * 0.2;
    const points = [
      { x: centerX, y: centerY - upwardSize * scale / 2 },
      { x: centerX - upwardSize * scale / 2, y: centerY + upwardSize * scale / 2 },
      { x: centerX + upwardSize * scale / 2, y: centerY + upwardSize * scale / 2 }
    ];
    triangles.push({ points });
  }
  
  // Generate 5 downward triangles
  for (let i = 0; i < 5; i++) {
    const scale = 0.9 - i * 0.18;
    const points = [
      { x: centerX, y: centerY + downwardSize * scale / 2 },
      { x: centerX - downwardSize * scale / 2, y: centerY - downwardSize * scale / 2 },
      { x: centerX + downwardSize * scale / 2, y: centerY - downwardSize * scale / 2 }
    ];
    triangles.push({ points });
  }
  
  // Generate surrounding circles
  const circles = [];
  // Inner circle
  circles.push({ x: centerX, y: centerY, r: size * 0.4 });
  // Outer circle
  circles.push({ x: centerX, y: centerY, r: size * 0.95 });
  
  // Bindu (center point)
  const bindu = { x: centerX, y: centerY, r: size * 0.05 };
  
  return { triangles, circles, bindu };
}

/**
 * Generate points for a fibonacci spiral
 * @param turns Number of turns
 * @param points Number of points to generate
 * @param scale Scale factor
 * @param centerX Center X coordinate
 * @param centerY Center Y coordinate
 */
export function generateFibonacciSpiral(
  turns: number = 3,
  points: number = 100,
  scale: number = 1,
  centerX: number = 0,
  centerY: number = 0
): Array<{ x: number; y: number }> {
  const result: Array<{ x: number; y: number }> = [];
  const maxAngle = turns * 2 * Math.PI;
  
  for (let i = 0; i < points; i++) {
    const ratio = i / (points - 1);
    const angle = ratio * maxAngle;
    const radius = scale * Math.sqrt(angle) * 5;
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    result.push({ x, y });
  }
  
  return result;
}

export default {
  PHI,
  generatePolygonPoints,
  generateSeedOfLife,
  generateFlowerOfLife,
  generateMetatronsCube,
  generateVesicaPiscis,
  generateSriYantra,
  generateFibonacciSpiral
};
