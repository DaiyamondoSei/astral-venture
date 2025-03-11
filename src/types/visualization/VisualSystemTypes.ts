
/**
 * Visual System Architecture
 * 
 * Core type definitions for the visualization system that handles
 * rendering, state management, and animations for cosmic visualizations.
 */

// Rendering engine types
export type RenderingEngine = 'svg' | 'canvas' | 'webgl';

// Performance settings types
export interface PerformanceSettings {
  adaptiveQuality: boolean;
  performanceMetrics: boolean;
  simplifiedForLowEnd: boolean;
  webglFallback: boolean;
  maxParticleCount: number;
  animationFrameLimit: number;
}

// Visual state types for different consciousness levels
export interface BaseVisualState {
  active: boolean;
  intensity: number;
  transitionProgress: number;
  colorPalette: string[];
}

export interface TranscendenceState extends BaseVisualState {
  waveAmplitude: number;
  waveFrequency: number;
  radianceLevel: number;
}

export interface InfinityState extends BaseVisualState {
  dimensionDepth: number;
  omnidirectionalFlow: boolean;
  universalConnectivity: number;
}

export interface IlluminationState extends BaseVisualState {
  glowIntensity: number;
  rayCount: number;
  pulseRate: number;
}

export interface FractalState extends BaseVisualState {
  complexity: number;
  iterations: number;
  patternType: 'mandelbrot' | 'julia' | 'cosmic' | 'chakra';
}

export interface VisualStates {
  transcendence: TranscendenceState;
  infinity: InfinityState;
  illumination: IlluminationState;
  fractal: FractalState;
}

// Animation system types
export type TransitionType = 'fade' | 'morph' | 'expand' | 'pulse' | 'quantum';

export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  easing: string;
  delayBetweenElements?: number;
}

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  speed: number;
  lifespan: number;
  blendMode: string;
}

export interface ParticleSystem {
  enabled: boolean;
  configs: Record<string, ParticleConfig>;
  adaptiveParticleReduction: boolean;
}

export interface GlowConfig {
  intensity: number;
  color: string;
  radius: number;
  pulseRate?: number;
}

export interface GlowSystem {
  enabled: boolean;
  configs: Record<string, GlowConfig>;
  performanceOptimized: boolean;
}

// Animation system
export interface AnimationSystem {
  transitions: TransitionConfig;
  particles: ParticleSystem;
  glowEffects: GlowSystem;
}

// Main visualization system interface
export interface VisualizationSystem {
  // Core rendering layers
  renderingEngine: RenderingEngine;
  performanceSettings: PerformanceSettings;
  
  // Visual states
  visualStates: VisualStates;
  
  // Animation system
  animations: AnimationSystem;
}

// Component props for the visualization system
export interface VisualizationProps {
  system?: Partial<VisualizationSystem>;
  energyPoints: number;
  activatedChakras?: number[];
  className?: string;
  onVisualizationRendered?: () => void;
  deviceCapability?: 'low' | 'medium' | 'high';
}
