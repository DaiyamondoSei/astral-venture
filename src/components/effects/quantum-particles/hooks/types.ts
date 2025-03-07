
import { QuantumParticle } from '../types';

export interface DimensionsState {
  width: number;
  height: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ParticleSystemState {
  particles: QuantumParticle[];
  dimensions: DimensionsState | null;
  dx: number;
  dy: number;
}
