
import { 
  ProgressSize, 
  ProgressColorScheme, 
  GlowIntensity, 
  AnimationStyle 
} from '../onboarding/data/types';

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
