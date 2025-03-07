
/**
 * Properties for a single quantum particle
 */
export interface QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
}

/**
 * Props for the QuantumParticles component
 */
export interface QuantumParticlesProps {
  /**
   * Number of particles to render (defaults to 30)
   */
  count?: number | string;
  
  /**
   * Array of colors to use for particles
   */
  colors?: string[];
  
  /**
   * Animation speed multiplier (defaults to 1)
   */
  speed?: number;
  
  /**
   * Maximum particle size in pixels (defaults to 6)
   */
  maxSize?: number;
  
  /**
   * Whether particles should respond to container resize (defaults to true)
   */
  responsive?: boolean;

  /**
   * Whether particles should respond to user interaction (defaults to false)
   */
  interactive?: boolean;
  
  /**
   * Custom CSS class name
   */
  className?: string;
}
