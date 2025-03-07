
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
  count?: number;
  colors?: string[];
  className?: string;
  interactive?: boolean;
}
