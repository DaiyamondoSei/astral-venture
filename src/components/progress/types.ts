
// This file defines types used by the progress components

export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressColorScheme = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'quantum'
  | `from-quantum-${number} to-quantum-${number}`;

export type GlowIntensity = 'low' | 'medium' | 'high';
export type AnimationStyle = 'none' | 'pulse' | 'slide' | 'ripple';
