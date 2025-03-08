
import { ProgressColorScheme, LabelPosition, AnimationStyle } from './types';

export function getColorClass(color: ProgressColorScheme): string {
  // Handle standard color schemes
  if (color === 'primary') {
    return 'bg-primary';
  }
  
  if (color === 'secondary') {
    return 'bg-secondary';
  }
  
  if (color === 'accent') {
    return 'bg-accent';
  }
  
  if (color === 'success') {
    return 'bg-green-500';
  }
  
  if (color === 'warning') {
    return 'bg-amber-500';
  }
  
  if (color === 'danger') {
    return 'bg-red-500';
  }
  
  if (color === 'info') {
    return 'bg-blue-500';
  }
  
  // Custom color (assumes Tailwind class)
  return color.startsWith('bg-') ? color : `bg-${color}`;
}

export function getBackgroundColorClass(color: string): string {
  // Handle standard color schemes
  return color.startsWith('bg-') ? color : `bg-${color}`;
}

export function getLabelPositionClass(position: LabelPosition, shape: 'linear' | 'circular' | 'radial'): string {
  if (shape === 'linear') {
    if (position === 'left') {
      return 'flex-row-reverse items-center';
    }
    if (position === 'right') {
      return 'flex-row items-center';
    }
    
    if (position === 'bottom') {
      return 'flex-col-reverse';
    }
    if (position === 'top') {
      return 'flex-col';
    }
    
    // Default to right for linear
    return 'flex-row items-center';
  }
  
  if (shape === 'circular' || shape === 'radial') {
    if (position === 'right') {
      return 'flex-row items-center gap-4';
    }
    
    if (position === 'bottom') {
      return 'flex-col-reverse gap-4';
    }
    
    if (position === 'left') {
      return 'flex-row-reverse items-center gap-4';
    }
    if (position === 'top') {
      return 'flex-col gap-4';
    }
    
    // Default to center (label inside) for circular/radial
    return 'relative';
  }
  
  return '';
}

export function getValueText(value: number, max: number, valueText?: string): string {
  if (valueText) {
    return valueText;
  }
  
  const percentage = Math.round((value / max) * 100);
  return `${percentage}%`;
}

export function getBaseColorClass(color: ProgressColorScheme): string {
  // Handle standard color schemes
  if (color === 'primary') {
    return 'text-primary';
  }
  
  if (color === 'secondary') {
    return 'text-secondary';
  }
  
  if (color === 'accent') {
    return 'text-accent';
  }
  
  if (color === 'success') {
    return 'text-green-500';
  }
  
  if (color === 'warning') {
    return 'text-amber-500';
  }
  
  if (color === 'danger') {
    return 'text-red-500';
  }
  
  if (color === 'info') {
    return 'text-blue-500';
  }
  
  // Custom color (assumes Tailwind class)
  return color.startsWith('text-') ? color : `text-${color}`;
}

export function getAnimationClass(animation: AnimationStyle): string {
  if (animation === 'slide') {
    return 'transition-all duration-500 ease-in-out';
  }
  
  if (animation === 'ripple') {
    return 'progress-ripple';
  }
  
  if (animation === 'glow') {
    return 'progress-glow';
  }
  
  if (animation === 'pulse') {
    return 'animate-pulse';
  }
  
  return '';
}

export function getProgressSizeClass(size: 'sm' | 'md' | 'lg' | 'xl', shape: 'linear' | 'circular' | 'radial'): string {
  if (shape === 'linear') {
    switch (size) {
      case 'sm': return 'h-1';
      case 'md': return 'h-2';
      case 'lg': return 'h-3';
      case 'xl': return 'h-4';
      default: return 'h-2';
    }
  }
  
  if (shape === 'circular' || shape === 'radial') {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'md': return 'w-24 h-24';
      case 'lg': return 'w-32 h-32';
      case 'xl': return 'w-40 h-40';
      default: return 'w-24 h-24';
    }
  }
  
  return '';
}
