
import { ProgressColorScheme, ProgressSize, LabelPosition, GlowIntensity, AnimationStyle } from '@/components/onboarding/data/types';

// Get color scheme based on the colorScheme prop
export const getColorScheme = (colorScheme: ProgressColorScheme): string => {
  if (colorScheme === 'primary') {
    return 'bg-primary';
  }
  
  if (colorScheme === 'secondary') {
    return 'bg-secondary';
  }
  
  if (colorScheme === 'accent') {
    return 'bg-accent';
  }
  
  if (colorScheme === 'quantum') {
    return 'bg-gradient-to-r from-quantum-400 to-quantum-600';
  }
  
  if (colorScheme.startsWith('from-quantum-')) {
    return `bg-gradient-to-r ${colorScheme}`;
  }
  
  return 'bg-primary';
};

// Get CSS height class based on size
export const getProgressHeight = (size: ProgressSize): string => {
  switch (size) {
    case 'sm':
      return 'h-1.5';
    case 'lg':
      return 'h-3';
    case 'md':
    default:
      return 'h-2';
  }
};

// Get CSS classes for the layout based on label position
export const getLayoutClass = (labelPosition: LabelPosition): string => {
  switch (labelPosition) {
    case 'left':
    case 'right':
      return 'flex items-center space-x-2';
    case 'inside':
      return 'relative';
    case 'bottom':
    case 'top':
    default:
      return 'space-y-1';
  }
};

// Get CSS classes for the label based on position
export const getLabelClass = (labelPosition: LabelPosition): string => {
  switch (labelPosition) {
    case 'right':
      return 'order-2';
    case 'inside':
      return 'absolute inset-0 flex items-center justify-center text-white z-10';
    case 'bottom':
      return 'order-2 pt-1';
    case 'left':
    case 'top':
    default:
      return '';
  }
};

// Get CSS classes for the glow effect
export const getGlowClasses = (intensity: GlowIntensity): string => {
  switch (intensity) {
    case 'low':
      return 'opacity-20 blur-[1px]';
    case 'high':
      return 'opacity-70 blur-[3px]';
    case 'medium':
    default:
      return 'opacity-40 blur-[2px]';
  }
};

// Get CSS classes for progress color
export const getProgressColorClasses = (colorScheme: ProgressColorScheme): string => {
  if (colorScheme === 'primary') {
    return 'bg-primary';
  }
  
  if (colorScheme === 'secondary') {
    return 'bg-secondary';
  }
  
  if (colorScheme === 'accent') {
    return 'bg-accent';
  }
  
  if (colorScheme === 'quantum') {
    return 'bg-gradient-to-r from-quantum-400 to-quantum-600';
  }
  
  if (colorScheme.startsWith('from-quantum-')) {
    return `bg-gradient-to-r ${colorScheme}`;
  }
  
  return 'bg-primary';
};

// Get animation style
export const getGlowAnimation = (animation: AnimationStyle): string => {
  switch (animation) {
    case 'pulse':
      return 'animate-pulse';
    case 'slide':
      return 'animate-slide';
    case 'ripple':
      return 'animate-ripple';
    case 'none':
    default:
      return '';
  }
};
