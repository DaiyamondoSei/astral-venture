
export type ProgressColorScheme = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | string;

export type ProgressShape = 'circular' | 'linear' | 'radial';

export type AnimationStyle = 'slide' | 'ripple' | 'glow' | 'pulse' | string;

export type LabelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | string;

export interface ProgressProps {
  value: number;
  max?: number;
  min?: number;
  showValue?: boolean;
  valueText?: string;
  color?: ProgressColorScheme;
  backgroundColor?: string;
  shape?: ProgressShape;
  label?: string;
  labelPosition?: LabelPosition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  thickness?: number;
  animation?: AnimationStyle;
  animationDuration?: number;
  className?: string;
}
