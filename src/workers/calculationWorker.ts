
import { WorkerTask, WorkerResult } from '@/utils/workerManager';

/**
 * Worker thread for offloading heavy calculations
 * Handles different types of calculations based on task type
 */
self.onmessage = (event: MessageEvent<WorkerTask>) => {
  const task = event.data;
  const startTime = performance.now();
  
  try {
    let result: any;
    
    // Process different task types
    switch (task.type) {
      case 'particles':
        result = calculateParticlePositions(task.data);
        break;
      case 'fractalGeneration':
        result = generateFractalPattern(task.data);
        break;
      case 'geometryCalculation':
        result = calculateGeometryPoints(task.data);
        break;
      case 'dataProcessing':
        result = processData(task.data);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
    
    // Send successful result back
    const processingTime = performance.now() - startTime;
    
    const workerResponse: WorkerResult = {
      id: task.id,
      type: task.type,
      data: result,
      timing: {
        queueTime: 0, // Filled in by manager
        processingTime
      }
    };
    
    self.postMessage(workerResponse);
  } catch (error) {
    // Send error back
    const errorResponse: WorkerResult = {
      id: task.id,
      type: task.type,
      data: null,
      error: error instanceof Error ? error.message : String(error)
    };
    
    self.postMessage(errorResponse);
  }
};

/**
 * Calculate next positions for quantum particles
 */
function calculateParticlePositions(data: any) {
  const { particles, dimensions, mousePosition, dx, dy } = data;
  
  if (!particles || !dimensions) {
    return particles;
  }
  
  // Process each particle
  const updatedParticles = particles.map((particle: any) => {
    // Basic particle movement logic
    let { x, y, vx, vy, color, size } = particle;
    
    // Apply current velocity
    x += vx;
    y += vy;
    
    // Bounce off edges
    if (x <= 0 || x >= dimensions.width) {
      vx = -vx;
      x = x <= 0 ? 0 : dimensions.width;
    }
    
    if (y <= 0 || y >= dimensions.height) {
      vy = -vy;
      y = y <= 0 ? 0 : dimensions.height;
    }
    
    // Process mouse interaction if available
    if (mousePosition) {
      const { x: mouseX, y: mouseY } = mousePosition;
      
      // Calculate distance to mouse
      const dx = mouseX - x;
      const dy = mouseY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Apply interaction force (repel/attract)
      if (distance < 100) {
        const force = -0.05; // Repel
        const directionX = dx / distance;
        const directionY = dy / distance;
        vx += directionX * force * (1 - distance / 100);
        vy += directionY * force * (1 - distance / 100);
      }
    }
    
    // Limit max velocity
    const maxVelocity = 2;
    vx = Math.max(-maxVelocity, Math.min(maxVelocity, vx));
    vy = Math.max(-maxVelocity, Math.min(maxVelocity, vy));
    
    // Return updated particle
    return {
      ...particle,
      x,
      y,
      vx,
      vy
    };
  });
  
  return updatedParticles;
}

/**
 * Generate fractal patterns using L-systems or other algorithms
 */
function generateFractalPattern(data: any) {
  const { pattern, iterations, angle, startingPosition } = data;
  
  // Simple L-system implementation for demonstration
  let currentPattern = pattern;
  
  // Apply rules for the specified number of iterations
  for (let i = 0; i < iterations; i++) {
    currentPattern = currentPattern
      .replace(/F/g, 'FF+[+F-F-F]-[-F+F+F]')
      .replace(/A/g, 'B-A-B')
      .replace(/B/g, 'A+B+A');
  }
  
  // Calculate points by interpreting the L-system
  const points = [];
  let x = startingPosition?.x || 0;
  let y = startingPosition?.y || 0;
  let direction = 0;
  const stack = [];
  
  for (let i = 0; i < currentPattern.length; i++) {
    const char = currentPattern[i];
    const step = 5 / (iterations + 1); // Step size decreases with iterations
    
    switch (char) {
      case 'F':
      case 'A':
      case 'B':
        // Move forward
        x += Math.cos(direction) * step;
        y += Math.sin(direction) * step;
        points.push({ x, y });
        break;
      case '+':
        // Turn right
        direction += angle * Math.PI / 180;
        break;
      case '-':
        // Turn left
        direction -= angle * Math.PI / 180;
        break;
      case '[':
        // Save position and direction
        stack.push({ x, y, direction });
        break;
      case ']':
        // Restore position and direction
        if (stack.length > 0) {
          const state = stack.pop();
          if (state) {
            x = state.x;
            y = state.y;
            direction = state.direction;
          }
        }
        break;
    }
  }
  
  return points;
}

/**
 * Calculate sacred geometry points and patterns
 */
function calculateGeometryPoints(data: any) {
  const { type, centerX, centerY, radius, points } = data;
  const results = [];
  
  switch (type) {
    case 'circle':
      // Generate a circle
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        results.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      break;
      
    case 'flowerOfLife':
      // Generate Flower of Life pattern
      const circles = [];
      // First circle at center
      circles.push({ x: centerX, y: centerY, radius });
      
      // Six circles around the center
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        circles.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          radius
        });
      }
      
      // Outer ring of circles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + (Math.PI / 12);
        circles.push({
          x: centerX + Math.cos(angle) * radius * 2,
          y: centerY + Math.sin(angle) * radius * 2,
          radius
        });
      }
      
      return circles;
      
    case 'metatron':
      // Generate Metatron's Cube points
      // Center point
      results.push({ x: centerX, y: centerY });
      
      // Inner hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        results.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      
      // Outer hexagon
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + (Math.PI / 6);
        results.push({
          x: centerX + Math.cos(angle) * radius * 2,
          y: centerY + Math.sin(angle) * radius * 2
        });
      }
      break;
  }
  
  return results;
}

/**
 * Process large datasets efficiently
 */
function processData(data: any) {
  const { dataset, operation, parameters } = data;
  
  if (!dataset || !operation) {
    return null;
  }
  
  switch (operation) {
    case 'filter':
      return dataset.filter((item: any) => {
        // Apply filter criteria
        for (const key in parameters) {
          if (item[key] !== parameters[key]) {
            return false;
          }
        }
        return true;
      });
      
    case 'aggregate':
      const result: Record<string, any> = {};
      
      for (const item of dataset) {
        const groupKey = item[parameters.groupBy];
        
        if (!result[groupKey]) {
          result[groupKey] = {
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity,
            items: []
          };
        }
        
        const group = result[groupKey];
        group.count++;
        
        if (parameters.valueField) {
          const value = item[parameters.valueField];
          if (typeof value === 'number') {
            group.sum += value;
            group.min = Math.min(group.min, value);
            group.max = Math.max(group.max, value);
          }
        }
        
        if (parameters.includeItems) {
          group.items.push(item);
        }
      }
      
      return result;
      
    case 'sort':
      return [...dataset].sort((a: any, b: any) => {
        const field = parameters.field;
        const direction = parameters.direction === 'desc' ? -1 : 1;
        
        if (a[field] < b[field]) return -1 * direction;
        if (a[field] > b[field]) return 1 * direction;
        return 0;
      });
      
    default:
      return dataset;
  }
}

// This ensures TypeScript recognizes this as a module
export {};
