
export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  direction: number;
  pulse: number;
  vx?: number;
  vy?: number;
}

export interface EnergyFieldProps {
  energyPoints?: number;
  colors?: string[];
  className?: string;
  particleDensity?: number;
  reactToClick?: boolean;
}

export interface ParticleProps {
  particle: Particle;
}

export interface BackgroundGlowProps {
  energyPoints: number;
  colors: string[];
  dimensions: {
    width: number;
    height: number;
  } | null;
}

export interface ClickWaveProps {
  x: number;
  y: number;
  color: string;
}
