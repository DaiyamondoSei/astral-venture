/**
 * Web Worker for heavy calculations
 * Handles particle physics, fractal generation, and data processing
 */

// Import any shared utilities and types
import type { WorkerTask, WorkerResult, WorkerTaskType } from '../utils/workerManager';

// Register task handlers
const taskHandlers: Record<WorkerTaskType, (data: any) => any> = {
  particles: calculateParticles,
  fractalGeneration: generateFractal,
  geometryCalculation: calculateGeometry,
  dataProcessing: processData
};

// Listen for messages from the main thread
self.onmessage = (event) => {
  const task = event.data as WorkerTask;
  const startTime = performance.now();
  
  try {
    // Get the appropriate handler for this task type
    const handler = taskHandlers[task.type];
    
    if (!handler) {
      throw new Error(`No handler registered for task type: ${task.type}`);
    }
    
    // Process the task
    const result = handler(task.data);
    
    // Send back the result
    const response: WorkerResult = {
      id: task.id,
      type: task.type,
      data: result,
      timing: {
        queueTime: 0, // We don't know queue time in the worker
        processingTime: performance.now() - startTime
      }
    };
    
    self.postMessage(response);
  } catch (error) {
    // Send back the error
    const errorResponse: WorkerResult = {
      id: task.id,
      type: task.type,
      data: null,
      error: error instanceof Error ? error.message : String(error),
      timing: {
        queueTime: 0,
        processingTime: performance.now() - startTime
      }
    };
    
    self.postMessage(errorResponse);
  }
};

/**
 * Calculate particle positions and interactions
 */
function calculateParticles(data: {
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
  }>;
  bounds: { width: number; height: number };
  mousePosition?: { x: number; y: number };
  interactions: {
    repulsion: number;
    attraction: number;
    bounds: number;
    mouse: number;
  };
  deltaTime: number;
}) {
  const { particles, bounds, mousePosition, interactions, deltaTime } = data;
  
  // Cap delta time to prevent large jumps
  const dt = Math.min(deltaTime, 32) / 16;
  
  // Process each particle
  const updatedParticles = particles.map((p, i) => {
    let fx = 0, fy = 0;
    
    // Particle interactions (simplified physics)
    particles.forEach((p2, j) => {
      if (i === j) return;
      
      const dx = p2.x - p.x;
      const dy = p2.y - p.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 0.001;
      
      // Combined attraction/repulsion force
      const force = interactions.repulsion / (distSq * p.mass) - interactions.attraction / dist;
      
      fx += dx / dist * force;
      fy += dy / dist * force;
    });
    
    // Boundary forces (keep particles in bounds)
    const boundaryForce = interactions.bounds;
    if (p.x < 0) fx += boundaryForce * -p.x;
    if (p.x > bounds.width) fx += boundaryForce * (bounds.width - p.x);
    if (p.y < 0) fy += boundaryForce * -p.y;
    if (p.y > bounds.height) fy += boundaryForce * (bounds.height - p.y);
    
    // Mouse interaction force
    if (mousePosition) {
      const dx = mousePosition.x - p.x;
      const dy = mousePosition.y - p.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 0.001;
      
      if (dist < 150) {
        const force = interactions.mouse / dist;
        fx += dx / dist * force;
        fy += dy / dist * force;
      }
    }
    
    // Update velocity with forces (simplified physics)
    const vx = p.vx + fx * dt;
    const vy = p.vy + fy * dt;
    
    // Add damping to prevent eternal motion
    const damping = 0.98;
    
    // Update position with velocity
    const x = p.x + vx * dt;
    const y = p.y + vy * dt;
    
    return {
      x,
      y,
      vx: vx * damping,
      vy: vy * damping,
      mass: p.mass
    };
  });
  
  return updatedParticles;
}

/**
 * Generate fractal geometry
 */
function generateFractal(data: {
  type: 'mandelbrot' | 'julia' | 'sierpinski';
  dimensions: { width: number; height: number };
  params: {
    maxIterations: number;
    escapeRadius: number;
    juliaConstant?: { x: number; y: number };
  };
}) {
  const { type, dimensions, params } = data;
  const { width, height } = dimensions;
  const { maxIterations, escapeRadius, juliaConstant } = params;
  
  // Create ImageData for the fractal
  const fractalData = new Uint8ClampedArray(width * height * 4);
  
  // Generate different fractal types
  switch (type) {
    case 'mandelbrot':
      // Mandelbrot set calculation
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          // Map pixel coordinates to complex plane
          const a = 3.0 * (x - width / 2) / width;
          const b = 2.0 * (y - height / 2) / height;
          
          let ca = a;
          let cb = b;
          
          let n = 0;
          let z = 0;
          let aa = 0;
          let bb = 0;
          
          // Iterate until escape or max iterations
          while (n < maxIterations && aa + bb <= escapeRadius * escapeRadius) {
            cb = 2 * ca * cb + b;
            ca = aa - bb + a;
            aa = ca * ca;
            bb = cb * cb;
            n++;
          }
          
          // Calculate color based on iteration count
          const bright = n === maxIterations ? 0 : 255 * Math.sqrt(n / maxIterations);
          
          // Set pixel in ImageData
          const pix = (y * width + x) * 4;
          fractalData[pix] = bright;
          fractalData[pix + 1] = bright;
          fractalData[pix + 2] = bright;
          fractalData[pix + 3] = 255;
        }
      }
      break;
      
    case 'julia':
      // Julia set calculation
      const jx = juliaConstant?.x || -0.7;
      const jy = juliaConstant?.y || 0.27;
      
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          // Map pixel coordinates to complex plane
          let zx = 3.0 * (x - width / 2) / width;
          let zy = 2.0 * (y - height / 2) / height;
          
          let n = 0;
          
          // Iterate until escape or max iterations
          while (n < maxIterations && zx * zx + zy * zy < escapeRadius * escapeRadius) {
            const tmp = zx * zx - zy * zy + jx;
            zy = 2.0 * zx * zy + jy;
            zx = tmp;
            n++;
          }
          
          // Calculate color based on iteration count
          const bright = n === maxIterations ? 0 : 255 * Math.sqrt(n / maxIterations);
          
          // Set pixel in ImageData
          const pix = (y * width + x) * 4;
          fractalData[pix] = bright;
          fractalData[pix + 1] = bright;
          fractalData[pix + 2] = bright;
          fractalData[pix + 3] = 255;
        }
      }
      break;
      
    default:
      // Default simple pattern
      for (let i = 0; i < width * height * 4; i += 4) {
        fractalData[i] = 0;
        fractalData[i + 1] = 0;
        fractalData[i + 2] = 0;
        fractalData[i + 3] = 255;
      }
  }
  
  return { fractalData, width, height };
}

/**
 * Calculate complex geometry for sacred geometry visualizations
 */
function calculateGeometry(data: any) {
  // Implement geometry calculations here
  return data;
}

/**
 * Process large datasets
 */
function processData(data: any) {
  // Implement data processing here
  return data;
}

// Notify main thread that worker is ready
self.postMessage({ type: 'ready' });
