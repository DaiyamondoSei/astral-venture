
/**
 * Visual System Types
 * 
 * Type definitions for the visualization system architecture
 */

export type RenderingEngine = 'svg' | 'canvas' | 'webgl';
export type VisualStateLevel = 'inactive' | 'low' | 'medium' | 'high' | 'transcendent';

/**
 * Visual state configuration with type-safe properties
 */
export interface VisualState {
  active: boolean;
  intensity: number;
  level: VisualStateLevel;
  transitionDuration: number;
  particleCount?: number;
  glowIntensity?: number;
  colorPalette?: string[];
}

/**
 * Configuration for visual transitions
 */
export interface TransitionConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  staggered: boolean;
  staggerDelay?: number;
}

/**
 * Particle system configuration
 */
export interface ParticleSystem {
  count: number;
  size: number | [number, number]; // Fixed size or range
  speed: number | [number, number]; // Fixed speed or range
  lifespan: number | [number, number]; // Fixed lifespan or range
  colors: string[];
  blendMode?: string;
  motionPattern?: 'random' | 'directed' | 'spiral' | 'quantum';
}

/**
 * Glow effects configuration
 */
export interface GlowSystem {
  intensity: number;
  radius: number;
  color: string;
  pulsate: boolean;
  pulsateFrequency?: number;
  composite?: string;
}

/**
 * Performance metrics and adaptation settings
 */
export interface PerformanceSettings {
  adaptiveQuality: boolean;
  measurePerformance: boolean;
  targetFrameRate: number;
  dropQualityThreshold: number;
  recoveryDelay: number;
}

/**
 * Complete visualization system configuration
 */
export interface VisualizationSystem {
  // Core rendering configuration
  renderingEngine: RenderingEngine;
  performanceSettings: PerformanceSettings;
  
  // Visual states
  visualStates: {
    transcendence: VisualState;
    infinity: VisualState;
    illumination: VisualState;
    fractal: VisualState;
  };
  
  // Animation system
  animations: {
    transitions: TransitionConfig;
    particles: ParticleSystem;
    glowEffects: GlowSystem;
  };
}

/**
 * Component props for the VisualSystem component
 */
export interface VisualSystemProps {
  // Core configuration
  config?: Partial<VisualizationSystem>;
  
  // Visual state control
  activeStates?: string[];
  backgroundIntensity?: string;
  
  // Appearance
  showBackground?: boolean; 
  showMetatronsCube?: boolean;
  showParticles?: boolean;
  
  // Chakra-related
  chakraActivations?: Record<string, number>;
  
  // Events
  onStateChange?: (state: string, active: boolean) => void;
}
