
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

export type LabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';

export interface ProgressTrackerProps {
  progress: number;
  label?: string;
  labelPosition?: LabelPosition;
  showValue?: boolean;
  colorScheme?: ProgressColorScheme;
  size?: ProgressSize;
  glowIntensity?: GlowIntensity;
  animation?: AnimationStyle;
  className?: string;
  showPercentage?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export interface ProgressGlowProps {
  progress: number;
  intensity?: GlowIntensity;
  animation?: AnimationStyle;
  colorScheme?: ProgressColorScheme;
}
