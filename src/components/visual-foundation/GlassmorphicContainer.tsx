
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Define variants for glassmorphic containers
export type GlassmorphicVariant = 'default' | 'light' | 'dark' | 'quantum' | 'astral' | 'ethereal';
export type GlassmorphicIntensity = 'low' | 'medium' | 'high';

export interface GlassmorphicContainerProps {
  children: ReactNode;
  className?: string;
  variant?: GlassmorphicVariant;
  intensity?: GlassmorphicIntensity;
  withGlow?: boolean;
  glowColor?: string;
  withMotion?: boolean;
  interactive?: boolean;
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  className = '',
  variant = 'default',
  intensity = 'medium',
  withGlow = false,
  glowColor = 'rgba(139, 92, 246, 0.4)',
  withMotion = false,
  interactive = false,
}) => {
  // Base glass styles with varying intensity levels
  const baseGlassStyles = {
    low: 'backdrop-blur-sm bg-opacity-10 border-opacity-20',
    medium: 'backdrop-blur-md bg-opacity-15 border-opacity-30',
    high: 'backdrop-blur-lg bg-opacity-20 border-opacity-40',
  };
  
  // Variant-specific styles
  const variantStyles = {
    default: 'bg-white/10 border-white/10',
    light: 'bg-white/20 border-white/20',
    dark: 'bg-black/30 border-white/10',
    quantum: 'bg-purple-900/20 border-purple-500/20',
    astral: 'bg-blue-900/20 border-blue-500/20',
    ethereal: 'bg-teal-900/20 border-teal-400/20',
  };
  
  // Glow effect styles
  const getGlowStyles = () => {
    if (!withGlow) return '';
    
    const intensityMap = {
      low: '0 0 10px',
      medium: '0 0 15px',
      high: '0 0 25px'
    };
    
    return `shadow-[${intensityMap[intensity]} ${glowColor}]`;
  };
  
  // Hover effect for interactive containers
  const hoverStyles = interactive
    ? 'transition-all duration-300 hover:scale-[1.01] hover:bg-opacity-30 hover:border-opacity-50'
    : '';

  // Combine all styles
  const containerStyles = cn(
    'rounded-xl border',
    baseGlassStyles[intensity],
    variantStyles[variant],
    getGlowStyles(),
    hoverStyles,
    className
  );

  // Animation variants for motion
  const motionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    hover: interactive ? { scale: 1.01, y: -2 } : {},
  };

  // Render with or without motion
  if (withMotion) {
    return (
      <motion.div
        className={containerStyles}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover={interactive ? "hover" : undefined}
        transition={{ duration: 0.3 }}
        variants={motionVariants}
      >
        {children}
      </motion.div>
    );
  }

  // Static rendering
  return (
    <div className={containerStyles}>
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
