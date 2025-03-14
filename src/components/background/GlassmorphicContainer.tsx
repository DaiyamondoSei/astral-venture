
import React from 'react';
import { cn } from '@/lib/utils';
import { DeviceCapabilities, GlassmorphicVariants } from '@/types/runtime-values';

export interface GlassmorphicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'quantum' | 'ethereal' | 'elevated' | 'subtle' | 'cosmic' | 'medium' | 'purple';
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
  responsive?: boolean;
  noFallback?: boolean;
}

const GlassmorphicContainer = ({
  variant = 'default',
  intensity = 'medium',
  children,
  className,
  responsive = true,
  noFallback = false,
  ...props
}: GlassmorphicContainerProps) => {
  // Get intensity modifier
  const getIntensityClass = () => {
    switch (intensity) {
      case 'low':
        return 'bg-opacity-20 backdrop-blur-sm';
      case 'medium':
        return 'bg-opacity-30 backdrop-blur-md';
      case 'high':
        return 'bg-opacity-40 backdrop-blur-lg';
      default:
        return 'bg-opacity-30 backdrop-blur-md';
    }
  };

  // Get variant class
  const getVariantClass = () => {
    // Use the runtime value constants to check
    // Instead of using the type directly
    if (variant === GlassmorphicVariants.DEFAULT) {
      return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    } else if (variant === GlassmorphicVariants.QUANTUM) {
      return 'bg-indigo-900 border-indigo-600 text-white';
    } else if (variant === GlassmorphicVariants.ETHEREAL) {
      return 'bg-purple-900 border-purple-700 text-white';
    } else if (variant === GlassmorphicVariants.ELEVATED) {
      return 'bg-white dark:bg-gray-800 shadow-lg border-gray-100 dark:border-gray-700';
    } else if (variant === GlassmorphicVariants.SUBTLE) {
      return 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm';
    } else if (variant === GlassmorphicVariants.COSMIC) {
      return 'bg-indigo-950 border-indigo-800 text-white';
    } else if (variant === GlassmorphicVariants.MEDIUM) {
      return 'bg-indigo-800 border-indigo-700 text-white';
    } else if (variant === GlassmorphicVariants.PURPLE) {
      return 'bg-purple-800 border-purple-700 text-white';
    }
    return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
  };

  // Get fallback class when backdrop-filter is not supported
  const getFallbackClass = () => {
    if (noFallback) return '';
    return 'glassmorphic-fallback';
  };

  // Get responsive class
  const getResponsiveClass = () => {
    if (!responsive) return '';
    return 'transition-all duration-500';
  };

  // Combine all classes
  const containerClass = cn(
    'glassmorphic rounded-xl border',
    getVariantClass(),
    getIntensityClass(),
    getFallbackClass(),
    getResponsiveClass(),
    className
  );

  return (
    <div className={containerClass} {...props}>
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
