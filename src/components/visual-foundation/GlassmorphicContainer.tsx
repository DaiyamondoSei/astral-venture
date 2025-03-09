
import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdaptivePerformance } from '@/contexts/AdaptivePerformanceContext';

export type GlassmorphicVariant = 
  | 'default'
  | 'light'  
  | 'dark'
  | 'purple'
  | 'blue'
  | 'quantum'
  | 'astral'
  | 'ethereal';

export type GlassmorphicIntensity = 'low' | 'medium' | 'high';

export interface GlassmorphicContainerProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  children: React.ReactNode;
  variant?: GlassmorphicVariant;
  intensity?: GlassmorphicIntensity;
  glowColor?: string;
  borderColor?: string;
  backgroundOpacity?: number;
  withGlow?: boolean;
  withMotion?: boolean;
  interactive?: boolean;
  cornerSharpness?: 'sharp' | 'rounded' | 'smooth' | 'pill';
  enableBlur?: boolean;
}

const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  className,
  variant = 'default',
  intensity = 'medium',
  glowColor,
  borderColor,
  backgroundOpacity,
  withGlow = false,
  withMotion = false,
  interactive = false,
  cornerSharpness = 'rounded',
  enableBlur,
  ...props
}) => {
  const adaptivePerf = useAdaptivePerformance();
  
  // Use performance context to determine if blur should be enabled
  const shouldEnableBlur = () => {
    if (enableBlur !== undefined) return enableBlur;
    if (!adaptivePerf) return true;
    return adaptivePerf.features.enableBlur;
  };
  
  const blurEnabled = shouldEnableBlur();
  
  // Map intensity to opacity and blur values
  const getIntensityStyles = () => {
    const opacityMap = {
      low: { bg: 0.05, border: 0.1 },
      medium: { bg: 0.1, border: 0.2 },
      high: { bg: 0.15, border: 0.3 }
    };
    
    const blurMap = {
      low: '4px',
      medium: '8px',
      high: '12px'
    };
    
    return {
      opacity: backgroundOpacity ?? opacityMap[intensity].bg,
      borderOpacity: opacityMap[intensity].border,
      blur: blurEnabled ? blurMap[intensity] : '0px'
    };
  };
  
  // Map cornerSharpness to border-radius values
  const getBorderRadiusClass = () => {
    const radiusMap = {
      sharp: 'rounded-none',
      rounded: 'rounded-md',
      smooth: 'rounded-xl',
      pill: 'rounded-full'
    };
    
    return radiusMap[cornerSharpness];
  };
  
  // Map variant to color values
  const getVariantStyles = () => {
    const { opacity, borderOpacity } = getIntensityStyles();
    
    const baseStyle = {
      background: `rgba(255, 255, 255, ${opacity})`,
      borderColor: borderColor || `rgba(255, 255, 255, ${borderOpacity})`,
      boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(255, 255, 255, 0.1)'}` : 'none',
    };
    
    switch (variant) {
      case 'light':
        return {
          ...baseStyle,
          background: `rgba(255, 255, 255, ${opacity * 1.5})`,
        };
        
      case 'dark':
        return {
          ...baseStyle,
          background: `rgba(0, 0, 0, ${opacity * 1.5})`,
          borderColor: borderColor || `rgba(255, 255, 255, ${borderOpacity / 2})`,
        };
        
      case 'purple':
        return {
          ...baseStyle,
          background: `rgba(139, 92, 246, ${opacity})`,
          borderColor: borderColor || `rgba(167, 139, 250, ${borderOpacity})`,
          boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(139, 92, 246, 0.2)'}` : 'none',
        };
        
      case 'blue':
        return {
          ...baseStyle,
          background: `rgba(59, 130, 246, ${opacity})`,
          borderColor: borderColor || `rgba(96, 165, 250, ${borderOpacity})`,
          boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(59, 130, 246, 0.2)'}` : 'none',
        };
        
      case 'quantum':
        return {
          ...baseStyle,
          background: `rgba(124, 58, 237, ${opacity})`,
          borderColor: borderColor || `rgba(167, 139, 250, ${borderOpacity})`,
          boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(124, 58, 237, 0.25)'}` : 'none',
        };
        
      case 'astral':
        return {
          ...baseStyle,
          background: `rgba(79, 70, 229, ${opacity})`,
          borderColor: borderColor || `rgba(129, 140, 248, ${borderOpacity})`,
          boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(79, 70, 229, 0.25)'}` : 'none',
        };
        
      case 'ethereal':
        return {
          ...baseStyle,
          background: `rgba(52, 211, 153, ${opacity})`,
          borderColor: borderColor || `rgba(110, 231, 183, ${borderOpacity})`,
          boxShadow: withGlow ? `0 0 20px ${glowColor || 'rgba(52, 211, 153, 0.25)'}` : 'none',
        };
        
      default:
        return baseStyle;
    }
  };
  
  const variantStyles = getVariantStyles();
  const { blur } = getIntensityStyles();
  const borderRadiusClass = getBorderRadiusClass();
  
  // Animation variants for motion
  const motionVariants = {
    hover: interactive ? {
      scale: 1.02,
      boxShadow: `0 0 30px ${glowColor || 'rgba(255, 255, 255, 0.2)'}`,
      transition: { duration: 0.3 }
    } : {},
    tap: interactive ? {
      scale: 0.98,
      transition: { duration: 0.1 }
    } : {},
  };

  // Apply styles
  const containerStyle = {
    ...variantStyles,
    backdropFilter: blurEnabled ? `blur(${blur})` : 'none',
    WebkitBackdropFilter: blurEnabled ? `blur(${blur})` : 'none',
  };

  // Render with or without motion
  if (withMotion) {
    return (
      <motion.div
        className={cn(
          'border',
          borderRadiusClass,
          interactive && 'cursor-pointer',
          className
        )}
        style={containerStyle}
        whileHover={interactive ? 'hover' : undefined}
        whileTap={interactive ? 'tap' : undefined}
        variants={motionVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'border',
        borderRadiusClass,
        interactive && 'cursor-pointer',
        className
      )}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
