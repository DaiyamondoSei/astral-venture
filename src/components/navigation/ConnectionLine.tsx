
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { usePerfConfig } from '@/hooks/usePerfConfig';

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive?: boolean;
  strokeColor?: string;
  activeStrokeColor?: string;
  strokeWidth?: number;
  activeStrokeWidth?: number;
  animationDuration?: number;
  className?: string;
}

const ConnectionLine = memo(({
  x1,
  y1,
  x2,
  y2,
  isActive = false,
  strokeColor = 'rgba(255, 255, 255, 0.2)',
  activeStrokeColor = 'rgba(139, 92, 246, 0.7)',
  strokeWidth = 1,
  activeStrokeWidth = 1.5,
  animationDuration = 1.5,
  className
}: ConnectionLineProps) => {
  const { config } = usePerfConfig();
  
  // Calculate the line length for the animation
  const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  // Determine if we should animate based on device capability
  const shouldAnimate = config.deviceCapability !== 'low' && isActive;
  
  // Animation for the line dash
  const lineVariants = {
    initial: {
      strokeDasharray: lineLength,
      strokeDashoffset: lineLength
    },
    animate: {
      strokeDashoffset: shouldAnimate ? [lineLength, 0, lineLength] : 0,
      transition: {
        duration: animationDuration,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop" as const
      }
    },
    inactive: {
      strokeDashoffset: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <motion.line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke={isActive ? activeStrokeColor : strokeColor}
      strokeWidth={isActive ? activeStrokeWidth : strokeWidth}
      className={className}
      initial="initial"
      animate={isActive ? "animate" : "inactive"}
      variants={lineVariants}
    />
  );
});

ConnectionLine.displayName = 'ConnectionLine';

export default ConnectionLine;
