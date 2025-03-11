
/**
 * Type definitions for the integrated visual system
 */

import { ChakraType } from '../chakra/ChakraTypes';

// Base animation timing types
export type AnimationTimingFunction = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'very-slow';
export type TransitionType = 'fade' | 'scale' | 'slide' | 'rotate' | 'pulse';

// Core visual state definition
export interface VisualState {
  active: boolean;
  intensity: number;
  color: string;
  opacity: number;
  scale: number;
  rotation: number;
}

// Performance settings
export interface PerformanceSettings {
  targetFPS: number;
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  useSimplifiedEffects: boolean;
  disableBlur: boolean;
  disableShadows: boolean;
  particleCount: number;
  maxAnimationsPerFrame: number;
}

// Rendering engine configuration
export interface RenderingEngine {
  useWebGL: boolean;
  useSVGOptimization: boolean;
  useCanvasForEffects: boolean;
  useOffscreenRendering: boolean;
  useHardwareAcceleration: boolean;
}

// Animation system
export interface AnimationSystem {
  duration: AnimationDuration;
  timingFunction: AnimationTimingFunction;
  transitionType: TransitionType;
  enableParallax: boolean;
  enableStaggering: boolean;
  staggerAmount: number;
}

// Particle system
export interface ParticleSystem {
  count: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
  variability: number;
}

// Glow system
export interface GlowSystem {
  radius: number;
  intensity: number;
  color: string;
  pulseRate: number;
}

// Combined visual system definition
export interface VisualizationSystem {
  // Visual state for different effects
  visualStates: {
    transcendence: VisualState;
    infinity: VisualState;
    illumination: VisualState;
    fractal: VisualState;
  };
  
  // Core rendering configuration
  renderingEngine: RenderingEngine;
  
  // Performance settings
  performanceSettings: PerformanceSettings;
  
  // Animation configuration
  animations: {
    primary: AnimationSystem;
    secondary: AnimationSystem;
    background: AnimationSystem;
    particles: ParticleSystem;
    glow: GlowSystem;
  };
}

// Chakra visualization integration
export interface ChakraVisualizationState {
  // Map of chakra types to activation intensities (0-1)
  activationLevels: Record<ChakraType, number>;
  
  // Resonance between chakras (0-1)
  resonancePatterns: Array<{
    source: ChakraType;
    target: ChakraType;
    strength: number;
  }>;
  
  // Energy flow visualization
  energyFlow: {
    direction: 'ascending' | 'descending' | 'balanced';
    flowRate: number;
    dominantChakra: ChakraType | null;
  };
  
  // Overall system state
  systemState: {
    balance: number;
    coherence: number;
    totalEnergy: number;
    harmonization: number;
  };
}

// Integrated props type for the visualization component
export interface VisualizationProps {
  // System configs
  chakraSystem: ChakraVisualizationState;
  visualSystem: VisualizationSystem;
  
  // Control props
  autoAnimate?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  
  // Callbacks
  onChakraActivated?: (chakra: ChakraType) => void;
  onChakraDeactivated?: (chakra: ChakraType) => void;
  onSystemStateChange?: (systemState: ChakraVisualizationState['systemState']) => void;
  
  // Layout and style
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}
