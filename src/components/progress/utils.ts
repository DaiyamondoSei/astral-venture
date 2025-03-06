
import { 
  ProgressSize, 
  ProgressColorScheme, 
  GlowIntensity, 
  AnimationStyle,
  LabelPosition
} from './types';

// Get the correct Tailwind classes for progress bar color scheme
export const getProgressColorClasses = (colorScheme: ProgressColorScheme): string => {
  if (colorScheme.startsWith('from-quantum-')) {
    return `bg-gradient-to-r ${colorScheme}`;
  }

  switch (colorScheme) {
    case 'primary':
      return 'bg-primary';
    case 'secondary':
      return 'bg-secondary';
    case 'accent':
      return 'bg-accent';
    case 'quantum':
      return 'bg-gradient-to-r from-quantum-400 to-quantum-700';
    default:
      return 'bg-primary';
  }
};

// Get the correct size classes for the progress container
export const getProgressSizeClasses = (size: ProgressSize): string => {
  switch (size) {
    case 'sm':
      return 'h-1.5';
    case 'md':
      return 'h-2.5';
    case 'lg':
      return 'h-3.5';
    default:
      return 'h-2.5';
  }
};

// Get the glow effect classes based on intensity
export const getGlowClasses = (intensity: GlowIntensity): string => {
  switch (intensity) {
    case 'low':
      return 'shadow-sm shadow-primary/30';
    case 'medium':
      return 'shadow-md shadow-primary/50';
    case 'high':
      return 'shadow-lg shadow-primary/70';
    default:
      return '';
  }
};

// Get animation classes based on style
export const getAnimationClasses = (animation: AnimationStyle): string => {
  switch (animation) {
    case 'pulse':
      return 'animate-pulse';
    case 'slide':
      return 'animate-progress-slide';
    case 'ripple':
      return 'animate-progress-ripple';
    case 'none':
    default:
      return '';
  }
};

// New utility functions needed by ProgressTracker
export const getColorScheme = (progress: number, userColorScheme?: ProgressColorScheme): ProgressColorScheme => {
  if (userColorScheme) return userColorScheme;
  
  // Default dynamic color scheme based on progress
  if (progress < 25) return 'from-quantum-300 to-quantum-500';
  if (progress < 50) return 'from-quantum-400 to-quantum-600';
  if (progress < 75) return 'from-quantum-500 to-quantum-700';
  return 'from-quantum-600 to-quantum-800';
};

export const getProgressHeight = (size: ProgressSize): string => {
  switch (size) {
    case 'sm': return 'h-1.5';
    case 'md': return 'h-2.5';
    case 'lg': return 'h-3.5';
    default: return 'h-2.5';
  }
};

export const getGlowAnimation = (intensity: GlowIntensity, animation?: AnimationStyle): AnimationStyle => {
  if (animation) return animation;
  
  // Default animation based on intensity
  switch (intensity) {
    case 'high': return 'pulse';
    case 'medium': return 'slide';
    case 'low': 
    default: return 'none';
  }
};

export const getLayoutClass = (labelPosition: LabelPosition): string => {
  switch (labelPosition) {
    case 'left':
    case 'right':
      return 'flex items-center gap-2';
    case 'top':
    case 'bottom':
    case 'inside':
    default:
      return 'flex flex-col';
  }
};

export const getLabelClass = (labelPosition: LabelPosition, customClass?: string): string => {
  const baseClass = 'text-xs font-medium text-muted-foreground';
  
  switch (labelPosition) {
    case 'left':
      return `${baseClass} order-first ${customClass || ''}`;
    case 'right':
      return `${baseClass} order-last ${customClass || ''}`;
    case 'top':
      return `${baseClass} mb-1 ${customClass || ''}`;
    case 'bottom':
      return `${baseClass} mt-1 ${customClass || ''}`;
    case 'inside':
      return `${baseClass} absolute inset-0 flex items-center justify-center ${customClass || ''}`;
    default:
      return `${baseClass} ${customClass || ''}`;
  }
};
