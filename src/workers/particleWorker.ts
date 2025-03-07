/**
 * Web Worker for particle physics calculations
 * Offloads heavy computation from the main thread
 */

// Define message types
type WorkerMessage = {
  type: 'initialize' | 'updateParticles' | 'terminate';
  data?: any;
};

type ParticleData = {
  id: string;
  x: number;
  y: number;
  direction: number;
  speed: number;
  pulse?: number;
  // Other properties needed for calculations
};

type Dimensions = {
  width: number;
  height: number;
};

type MousePosition = {
  x: number;
  y: number;
} | null;

// Store state
let particles: ParticleData[] = [];
let dimensions: Dimensions | null = null;
let lastTimeStamp = 0;
let isRunning = false;

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'initialize':
      // Initialize with initial particles and dimensions
      particles = data.particles;
      dimensions = data.dimensions;
      isRunning = true;
      lastTimeStamp = performance.now();
      requestAnimationFrame(updateParticles);
      break;
      
    case 'updateParticles':
      // Update particles, dimensions, or mouse position
      if (data.particles) particles = data.particles;
      if (data.dimensions) dimensions = data.dimensions;
      break;
      
    case 'terminate':
      // Stop calculations
      isRunning = false;
      break;
  }
};

// Main calculation function
function updateParticles(timestamp: number = performance.now()) {
  if (!isRunning || !dimensions) return;
  
  // Calculate delta time for smooth animation
  const delta = lastTimeStamp ? timestamp - lastTimeStamp : 16.67;
  lastTimeStamp = timestamp;
  
  // Normalized delta (targeting 60fps)
  const normalizedDelta = delta / 16.67;
  
  // Update each particle
  const updatedParticles = particles.map(particle => {
    let { x, y, direction, pulse } = particle;
    const { speed } = particle;
    
    // Simple wandering behavior
    direction += (Math.random() - 0.5) * 0.2;
    
    // Update position with delta time
    x += Math.cos(direction) * speed * normalizedDelta;
    y += Math.sin(direction) * speed * normalizedDelta;
    
    // Boundary checking with wrapping
    if (x < 0) x = dimensions.width;
    if (x > dimensions.width) x = 0;
    if (y < 0) y = dimensions.height;
    if (y > dimensions.height) y = 0;
    
    // Update pulse property if it exists
    if (pulse !== undefined) {
      pulse = Math.max(pulse - 0.05, 1);
    }
    
    return { ...particle, x, y, direction, pulse };
  });
  
  // Send updated particles back to main thread
  self.postMessage({ 
    type: 'particlesUpdated', 
    data: { particles: updatedParticles, timestamp }
  });
  
  // Continue animation loop
  if (isRunning) {
    requestAnimationFrame(updateParticles);
  }
}

// Notify main thread that worker is ready
self.postMessage({ type: 'ready' });
