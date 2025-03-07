
import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getPerformanceCategory } from '@/utils/performanceUtils';

interface GlassmorphicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'subtle' | 'medium' | 'prominent';
  animate?: boolean;
  blur?: 'none' | 'light' | 'medium' | 'heavy';
  className?: string;
  centerContent?: boolean;
  motionProps?: MotionProps;
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
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const deviceCapability = getPerformanceCategory();
  
  // Reduce effects on low-end devices for better performance
  const adjustedBlur = deviceCapability === 'low' 
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
        {...motionProps}
        {...props}
      >
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
      {children}
    </div>
  );
};

export default GlassmorphicContainer;
