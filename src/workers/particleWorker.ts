
// This is a Web Worker for offloading particle calculations
// It handles the physics calculations for particles in a separate thread

// Define particle type for worker
interface WorkerParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  direction: number;
  pulse: number;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'updateParticles':
      const { particles, dimensions, mousePosition, delta } = data;
      const updatedParticles = updateParticlePositions(
        particles,
        dimensions,
        mousePosition,
        delta
      );
      self.postMessage({ type: 'particlesUpdated', particles: updatedParticles });
      break;
    
    case 'generateParticles':
      const { count, width, height, colors } = data;
      const newParticles = generateParticles(count, width, height, colors);
      self.postMessage({ type: 'particlesGenerated', particles: newParticles });
      break;
      
    default:
      console.warn('Unknown message type received in worker:', type);
  }
};

// Generate initial particles
function generateParticles(
  count: number,
  width: number,
  height: number,
  colors: string[]
): WorkerParticle[] {
  const particles: WorkerParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `p-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 1.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3,
      direction: Math.random() * Math.PI * 2,
      pulse: Math.random() * 2 + 1,
      vx: 0,
      vy: 0
    });
  }
  
  return particles;
}

// Update particle positions based on physics
function updateParticlePositions(
  particles: WorkerParticle[],
  dimensions: { width: number; height: number },
  mousePosition: { x: number; y: number } | null,
  delta: number
): WorkerParticle[] {
  // Normalize delta time for consistent animation speed
  const normalizedDelta = delta / 16.67; // Target 60fps
  
  return particles.map(particle => {
    let { x, y, direction, pulse } = particle;
    const { speed } = particle;
    
    // Apply mouse attraction if mouse is within container
    if (mousePosition) {
      const dx = mousePosition.x - x;
      const dy = mousePosition.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        // Only perform complex calculations if mouse is close enough
        const factor = 0.02;
        direction = Math.atan2(dy, dx);
        pulse = Math.min(pulse + 0.1, 3);
      } else {
        // Simplified wandering for distant particles
        direction += (Math.random() - 0.5) * 0.2;
        pulse = Math.max(pulse - 0.05, 1);
      }
    } else {
      // Simple random wandering when no mouse
      direction += (Math.random() - 0.5) * 0.2;
    }
    
    // Update position with delta time for consistent movement
    x += Math.cos(direction) * speed * normalizedDelta;
    y += Math.sin(direction) * speed * normalizedDelta;
    
    // Boundary checking with wrapping
    if (x < 0) x = dimensions.width;
    if (x > dimensions.width) x = 0;
    if (y < 0) y = dimensions.height;
    if (y > dimensions.height) y = 0;
    
    // Update vx and vy for type compatibility
    const vx = Math.cos(direction) * speed;
    const vy = Math.sin(direction) * speed;
    
    return { ...particle, x, y, direction, pulse, vx, vy };
  });
}

// Make TypeScript recognize this as a module
export {};
