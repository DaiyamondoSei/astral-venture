
export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
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
  colors: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ClickWaveProps {
  clickWave: {
    x: number;
    y: number;
    active: boolean;
  } | null;
}
