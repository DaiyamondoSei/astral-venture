import { ProgressColorScheme, GlowIntensity, ProgressSize, AnimationStyle } from './types';
import { cn } from "@/lib/utils";

/**
 * Determines the appropriate color gradient based on progress percentage or specified color scheme
 */
export const getColorScheme = (progress: number, colorScheme?: ProgressColorScheme): string => {
  // If a specific color scheme is provided, use it
  if (colorScheme) {
    switch (colorScheme) {
      case 'quantum': return 'from-quantum-300 to-quantum-500';
      case 'astral': return 'from-astral-300 to-astral-500';
      case 'ethereal': return 'from-ethereal-300 to-ethereal-500';
      case 'default': return 'from-primary/70 to-primary';
    }
  }
  
  // Otherwise, determine color based on progress
  if (progress < 30) return 'from-quantum-300 to-quantum-500';
  if (progress < 60) return 'from-astral-300 to-astral-500';
  return 'from-ethereal-300 to-ethereal-500';
};

/**
 * Determines the height of the progress bar based on size
 */
export const getProgressHeight = (size?: ProgressSize): string => {
  switch (size) {
    case 'xs': return 'h-1';
    case 'sm': return 'h-2';
    case 'md': return 'h-4';
    case 'lg': return 'h-6';
    default: return 'h-4';
  }
};

/**
 * Maps the glow intensity to animation style
 */
export const getGlowAnimation = (glowIntensity: GlowIntensity, animation?: AnimationStyle): AnimationStyle => {
  // If a specific animation is provided, use it instead of deriving from glow intensity
  if (animation) return animation;
  
  // Otherwise map glow intensity to animation
  switch (glowIntensity) {
    case 'none': return 'none';
    case 'low': return 'pulse';
    case 'medium': return 'pulse';
    case 'high': return 'breathe';
    default: return 'pulse';
  }
};

/**
 * Gets the appropriate CSS animation class 
 */
export const getAnimationClass = (animation: AnimationStyle): string => {
  switch (animation) {
    case 'none': return '';
    case 'pulse': return 'animate-pulse-slow';
    case 'breathe': return 'animate-pulse';
    case 'slide': return 'animate-shimmer bg-gradient-to-r bg-[length:400%_100%]';
    default: return '';
  }
};

/**
 * Creates the layout for the progress tracker based on label position
 */
export const getLayoutClass = (labelPosition?: 'top' | 'bottom' | 'left' | 'right'): string => {
  return cn(
    "w-full", 
    {
      'flex items-center gap-3': labelPosition === 'left' || labelPosition === 'right',
    }
  );
};

/**
 * Gets the appropriate CSS class for label positioning
 */
export const getLabelClass = (
  labelPosition?: 'top' | 'bottom' | 'left' | 'right',
  labelClassName?: string
): string => {
  return cn(
    "text-sm font-medium text-muted-foreground",
    { 
      'mb-1': labelPosition === 'top',
      'mt-1': labelPosition === 'bottom'
    },
    labelClassName
  );
};
