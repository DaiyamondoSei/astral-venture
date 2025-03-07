
import React, { ReactNode, useEffect, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getPerformanceCategory } from '@/utils/performanceUtils';

interface GlassmorphicContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  children: ReactNode;
  variant?: 'subtle' | 'medium' | 'prominent';
  animate?: boolean;
  blur?: 'none' | 'light' | 'medium' | 'heavy';
  className?: string;
  centerContent?: boolean;
  motionProps?: Omit<MotionProps, 'onDrag'>;
  glowEffect?: boolean;
  shimmer?: boolean;
}

/**
 * Enhanced glassmorphic container that adapts to device capabilities
 * Creates a sophisticated glass effect that works well with geometric backgrounds
 */
export const GlassmorphicContainer: React.FC<GlassmorphicContainerProps> = ({
  children,
  variant = 'medium',
  animate = false,
  blur = 'medium',
  className,
  centerContent = false,
  motionProps,
  glowEffect = false,
  shimmer = false,
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const deviceCapability = getPerformanceCategory();
  const [performanceAdjusted, setPerformanceAdjusted] = useState(false);
  
  // Reduce effects on low-end devices for better performance
  useEffect(() => {
    if (deviceCapability === 'low') {
      setPerformanceAdjusted(true);
    }
  }, [deviceCapability]);
  
  // Adjust blur based on device capability
  const adjustedBlur = performanceAdjusted 
    ? (blur === 'heavy' ? 'medium' : blur === 'medium' ? 'light' : blur) 
    : blur;
  
  // Map blur settings to pixel values
  const blurMap = {
    none: '0',
    light: isMobile ? '4px' : '6px',
    medium: isMobile ? '8px' : '12px',
    heavy: isMobile ? '12px' : '20px'
  };
  
  // Get appropriate background opacity based on variant
  const getBgOpacity = () => {
    switch (variant) {
      case 'subtle': return 'bg-opacity-5';
      case 'medium': return 'bg-opacity-10';
      case 'prominent': return 'bg-opacity-15';
      default: return 'bg-opacity-10';
    }
  };
  
  // Get appropriate border opacity based on variant
  const getBorderOpacity = () => {
    switch (variant) {
      case 'subtle': return 'border-opacity-10';
      case 'medium': return 'border-opacity-15';
      case 'prominent': return 'border-opacity-20';
      default: return 'border-opacity-15';
    }
  };
  
  const containerStyles = cn(
    "backdrop-filter",
    "transition-all duration-300",
    "bg-white border border-white",
    "shadow-xl",
    getBgOpacity(),
    getBorderOpacity(),
    centerContent && "flex items-center justify-center",
    glowEffect && !performanceAdjusted && "shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    shimmer && !performanceAdjusted && "overflow-hidden",
    className
  );
  
  // Use motion div for animated containers
  if (animate) {
    return (
      <motion.div
        className={containerStyles}
        style={{ backdropFilter: `blur(${blurMap[adjustedBlur]})` }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        {...(motionProps as any)}
        {...props}
      >
        {shimmer && !performanceAdjusted && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ 
              x: ["calc(-100% - 200px)", "calc(100% + 200px)"]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 4
            }}
            style={{ width: "100%" }}
          />
        )}
        {children}
      </motion.div>
    );
  }
  
  // Regular div for static containers
  return (
    <div
      className={containerStyles}
      style={{ backdropFilter: `blur(${blurMap[adjustedBlur]})` }}
      {...props}
    >
      {shimmer && !performanceAdjusted && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
