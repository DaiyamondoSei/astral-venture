
import React from 'react';
import { motion } from 'framer-motion';

interface GlowEffectProps {
  className?: string;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

/**
 * A visual component that creates a glowing effect
 * Can be used as a background or wrapper for other components
 */
const GlowEffect: React.FC<GlowEffectProps> = ({ 
  className = '', 
  color = 'rgba(138, 43, 226, 0.2)', 
  intensity = 'medium',
  animated = true 
}) => {
  // Different blur values based on intensity
  const getBlurRadius = () => {
    switch (intensity) {
      case 'low': return '20px';
      case 'high': return '60px';
      case 'medium':
      default: return '40px';
    }
  };
  
  // Get opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case 'low': return 0.4;
      case 'high': return 0.8;
      case 'medium':
      default: return 0.6;
    }
  };
  
  const baseStyle = {
    position: 'absolute',
    inset: '0px',
    borderRadius: 'inherit',
    backgroundColor: color,
    filter: `blur(${getBlurRadius()})`,
    opacity: getOpacity(),
  } as React.CSSProperties;
  
  if (!animated) {
    return <div className={className} style={baseStyle} />;
  }
  
  return (
    <motion.div
      className={className}
      style={baseStyle}
      animate={{
        opacity: [getOpacity() - 0.1, getOpacity() + 0.1, getOpacity() - 0.1],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    />
  );
};

export default GlowEffect;
