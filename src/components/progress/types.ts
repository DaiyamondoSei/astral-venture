
import { ReactNode } from 'react';

export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';
export type AnimationStyle = 'none' | 'pulse' | 'breathe' | 'slide';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';
export type ProgressColorScheme = 'quantum' | 'astral' | 'ethereal' | 'default';

export interface ProgressTrackerProps {
  progress: number; // 0-100
  className?: string;
  label?: string | ReactNode;
  showPercentage?: boolean;
  glowIntensity?: GlowIntensity;
  size?: ProgressSize;
  labelPosition?: LabelPosition;
  animation?: AnimationStyle;
  colorScheme?: ProgressColorScheme;
  showValue?: boolean;
  labelClassName?: string;
  valueClassName?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}
