
import React from 'react';
import { cn } from '@/lib/utils';
import { motion, MotionProps } from 'framer-motion';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'primary' | 'quantum' | 'cosmic' | 'astral';
  interactive?: boolean;
  withBorder?: boolean;
  withShadow?: boolean;
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    intensity = 'medium', 
    variant = 'primary',
    interactive = false,
    withBorder = true,
    withShadow = true,
    children,
    ...props 
  }, ref) => {
    // Map intensity to blur and opacity values
    const blurIntensity = {
      low: 'backdrop-blur-sm bg-white/5',
      medium: 'backdrop-blur-md bg-white/10',
      high: 'backdrop-blur-xl bg-white/15'
    };
    
    // Map variants to border and glow colors
    const variantStyles = {
      primary: withBorder ? 'border border-white/10' : '',
      quantum: withBorder ? 'border border-purple-500/20' : '',
      cosmic: withBorder ? 'border border-blue-400/20' : '',
      astral: withBorder ? 'border border-indigo-500/20' : ''
    };
    
    // Shadow styles
    const shadowStyle = withShadow ? {
      primary: 'shadow-lg',
      quantum: 'shadow-[0_4px_20px_-2px_rgba(139,92,246,0.15)]',
      cosmic: 'shadow-[0_4px_20px_-2px_rgba(96,165,250,0.15)]',
      astral: 'shadow-[0_4px_20px_-2px_rgba(99,102,241,0.15)]'
    }[variant] : '';
    
    // Interactive hover effects
    const interactiveClasses = interactive ? 
      'transition-all duration-300 hover:bg-white/15 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : '';
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl',
          blurIntensity[intensity],
          variantStyles[variant],
          shadowStyle,
          interactiveClasses,
          className
        )}
        whileHover={interactive ? { scale: 1.01 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
