
import { QuantumParticle } from '../types';

/**
 * Create a set of particles with random properties
 */
export function createParticles(
  count: number, 
  dimensions: { width: number; height: number }, 
  colors: string[],
  maxSize: number,
  speed: number
): QuantumParticle[] {
  const particles: QuantumParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 100, // Use percentage for responsive positioning
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2 * speed,
      vy: (Math.random() - 0.5) * 0.2 * speed,
      size: Math.random() * maxSize + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    });
  }
  
  return particles;
}
