
/**
 * Geometry Utilities
 * 
 * Utilities for creating and manipulating geometric patterns.
 */

// Type definitions for geometry
export interface Point {
  x: number;
  y: number;
}

export interface GeometryNode extends Point {
  id: string;
  size?: number;
  energy?: number;
  active?: boolean;
}

export interface GeometryConnection {
  from: string;
  to: string;
  type?: string;
  energy?: number;
  width?: number;
  active?: boolean;
}

export interface GeometryPattern {
  nodes: GeometryNode[];
  connections: GeometryConnection[];
}

/**
 * Generate points for a regular polygon
 */
export function generatePolygonPoints(
  sides: number,
  radius: number,
  startAngle: number = 0,
  centerX: number = 0,
  centerY: number = 0
): Point[] {
  if (sides < 3) {
    console.warn('Polygon must have at least 3 sides');
    sides = Math.max(3, sides);
  }
  
  const points: Point[] = [];
  const angleStep = (Math.PI * 2) / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Generate the Flower of Life pattern
 */
export function generateFlowerOfLife(
  radius: number,
  detail: number = 2,
  centerX: number = 0,
  centerY: number = 0
): GeometryPattern {
  const nodes: GeometryNode[] = [];
  const connections: GeometryConnection[] = [];
  
  // Add center circle
  nodes.push({
    id: 'center',
    x: centerX,
    y: centerY,
    size: radius * 0.1,
    active: true
  });
  
  // Generate first ring of 6 circles
  const firstRing = generatePolygonPoints(6, radius, 0, centerX, centerY);
  
  firstRing.forEach((point, index) => {
    const id = `ring1-${index}`;
    nodes.push({
      id,
      x: point.x,
      y: point.y,
      size: radius * 0.1,
      active: true
    });
    
    // Connect to center
    connections.push({
      from: 'center',
      to: id,
      type: 'primary',
      active: true
    });
    
    // Connect to neighbors in the ring
    const prevId = index === 0 ? `ring1-${firstRing.length - 1}` : `ring1-${index - 1}`;
    connections.push({
      from: id,
      to: prevId,
      type: 'primary',
      active: true
    });
  });
  
  // Add more detail if requested
  if (detail > 1) {
    // Generate additional rings
    for (let ring = 2; ring <= detail; ring++) {
      const ringPoints = generatePolygonPoints(6 * ring, radius * ring, 0, centerX, centerY);
      
      ringPoints.forEach((point, index) => {
        const id = `ring${ring}-${index}`;
        nodes.push({
          id,
          x: point.x,
          y: point.y,
          size: radius * 0.08 / ring,
          active: ring === 2 // Only the second ring is active by default
        });
        
        // Connect to closest nodes
        const closestNodes = findClosestNodes(point, nodes, 3);
        closestNodes.forEach(nodeId => {
          connections.push({
            from: id,
            to: nodeId,
            type: ring === 2 ? 'secondary' : 'tertiary',
            active: ring === 2 // Only connections in the second ring are active by default
          });
        });
      });
    }
  }
  
  return { nodes, connections };
}

/**
 * Generate Metatron's Cube
 */
export function generateMetatronsCube(
  radius: number,
  detail: number = 3,
  centerX: number = 0,
  centerY: number = 0
): GeometryPattern {
  const nodes: GeometryNode[] = [];
  const connections: GeometryConnection[] = [];
  
  // Create center node
  nodes.push({
    id: 'center',
    x: centerX,
    y: centerY,
    size: radius * 0.1,
    energy: 1,
    active: true
  });
  
  // Create first ring of 6 nodes (hexagon)
  const hexagon = generatePolygonPoints(6, radius, 0, centerX, centerY);
  hexagon.forEach((point, index) => {
    const id = `hex-${index}`;
    nodes.push({
      id,
      x: point.x,
      y: point.y,
      size: radius * 0.08,
      energy: 0.9,
      active: true
    });
    
    // Connect to center
    connections.push({
      from: 'center',
      to: id,
      type: 'primary',
      energy: 0.9,
      active: true
    });
    
    // Connect to neighbors
    if (index < hexagon.length - 1) {
      connections.push({
        from: id,
        to: `hex-${index + 1}`,
        type: 'primary',
        energy: 0.8,
        active: true
      });
    }
  });
  
  // Connect last to first to complete the hexagon
  connections.push({
    from: `hex-${hexagon.length - 1}`,
    to: 'hex-0',
    type: 'primary',
    energy: 0.8,
    active: true
  });
  
  // Add Platonic solids if detail is high enough
  if (detail >= 2) {
    // Add points for an inner circle (cube/octahedron)
    const innerRadius = radius * 0.6;
    const square = generatePolygonPoints(4, innerRadius, Math.PI / 4, centerX, centerY);
    
    square.forEach((point, index) => {
      const id = `square-${index}`;
      nodes.push({
        id,
        x: point.x,
        y: point.y,
        size: radius * 0.07,
        energy: 0.8,
        active: true
      });
      
      // Connect to center
      connections.push({
        from: 'center',
        to: id,
        type: 'secondary',
        energy: 0.7,
        active: true
      });
      
      // Connect square points to each other
      if (index < square.length - 1) {
        connections.push({
          from: id,
          to: `square-${index + 1}`,
          type: 'secondary',
          energy: 0.7,
          active: true
        });
      }
    });
    
    // Complete the square
    connections.push({
      from: `square-${square.length - 1}`,
      to: 'square-0',
      type: 'secondary',
      energy: 0.7,
      active: true
    });
    
    // Connect square to hexagon
    for (let i = 0; i < square.length; i++) {
      for (let j = 0; j < hexagon.length; j++) {
        connections.push({
          from: `square-${i}`,
          to: `hex-${j}`,
          type: 'energy',
          energy: 0.5,
          active: false  // These are initially inactive
        });
      }
    }
  }
  
  // Add more complex structures for higher detail levels
  if (detail >= 3) {
    // Add a 12-pointed star around the edge (icosahedron projection)
    const outerRadius = radius * 1.2;
    const star = generatePolygonPoints(12, outerRadius, Math.PI / 12, centerX, centerY);
    
    star.forEach((point, index) => {
      const id = `star-${index}`;
      nodes.push({
        id,
        x: point.x,
        y: point.y,
        size: radius * 0.06,
        energy: 0.6,
        active: index % 3 === 0  // Only some points are active by default
      });
      
      // Connect alternating points to center
      if (index % 2 === 0) {
        connections.push({
          from: 'center',
          to: id,
          type: 'tertiary',
          energy: 0.5,
          active: index % 6 === 0
        });
      }
      
      // Connect to neighbors
      if (index < star.length - 1) {
        connections.push({
          from: id,
          to: `star-${index + 1}`,
          type: 'tertiary',
          energy: 0.4,
          active: index % 3 === 0
        });
      }
    });
    
    // Complete the star
    connections.push({
      from: `star-${star.length - 1}`,
      to: 'star-0',
      type: 'tertiary',
      energy: 0.4,
      active: false
    });
  }
  
  // Create even more complex structures for very high detail
  if (detail >= 4) {
    // Inner connection patterns (representing higher-dimensional projections)
    for (let i = 0; i < hexagon.length; i++) {
      for (let j = i + 2; j < hexagon.length; j++) {
        if (j !== i + 3 || i !== 0) { // Skip some connections for aesthetic purposes
          connections.push({
            from: `hex-${i}`,
            to: `hex-${j}`,
            type: 'resonance',
            energy: 0.3,
            active: false // Initially inactive
          });
        }
      }
    }
  }
  
  return { nodes, connections };
}

/**
 * Find the closest nodes to a point
 */
function findClosestNodes(
  point: Point,
  nodes: GeometryNode[],
  count: number = 3
): string[] {
  // Calculate distances
  const distances = nodes.map(node => ({
    id: node.id,
    distance: Math.sqrt(Math.pow(node.x - point.x, 2) + Math.pow(node.y - point.y, 2))
  }));
  
  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);
  
  // Return the IDs of the closest nodes (excluding the first one if it's the same point)
  return distances.slice(0, count + 1).map(d => d.id);
}
