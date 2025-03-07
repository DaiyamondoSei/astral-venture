
import { Vector2 } from 'three';

export interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  size: number;
  color: string;
  alpha: number;
  connections: Connection[];
}

export interface Connection {
  particle: Particle;
  distance: number;
  opacity: number;
}

export interface QuantumParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  duration: number;
  delay: number;
}

export interface QuantumParticlesProps {
  count?: number | string;
  colors?: string[];
  className?: string;
  interactive?: boolean;
  speed?: number;
}

export interface ParticleSystemHookResult {
  particles: Particle[];
  mousePosition: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
}
