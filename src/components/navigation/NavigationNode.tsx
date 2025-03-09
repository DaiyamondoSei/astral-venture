
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { SacredGeometryIcon, SacredGeometryIconType } from './SacredGeometryIcon';
import { useQuantumTheme } from '@/components/visual-foundation';
import { cn } from '@/lib/utils';

export interface NavigationNodeProps {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  isActive?: boolean;
  isDisabled?: boolean;
  iconType: SacredGeometryIconType;
  onClick?: (id: string) => void;
  className?: string;
}

const NavigationNode = memo(({
  id,
  label,
  description,
  x,
  y,
  isActive = false,
  isDisabled = false,
  iconType,
  onClick,
  className
}: NavigationNodeProps) => {
  const { getPrimaryColor, getSecondaryColor } = useQuantumTheme();
  
  const primaryColor = getPrimaryColor();
  const secondaryColor = getSecondaryColor();
  const glowColor = isActive ? primaryColor : 'rgba(255, 255, 255, 0.3)';
  
  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(id);
    }
  };
  
  // Animation variants
  const nodeVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1 * parseInt(id, 10) % 5  // Stagger effect based on id
      }
    },
    exit: { 
      opacity: 0,
      scale: 0,
      transition: { duration: 0.2 }
    },
    disabled: {
      opacity: 0.5,
      filter: 'grayscale(70%)'
    }
  };

  return (
    <motion.div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center",
        isDisabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: isActive ? 30 : 20
      }}
      initial="initial"
      animate={[isDisabled ? "disabled" : "animate"]}
      exit="exit"
      variants={nodeVariants}
      data-node-id={id}
    >
      <SacredGeometryIcon
        type={iconType}
        label={label}
        description={description}
        isActive={isActive}
        onClick={isDisabled ? undefined : handleClick}
        size="md"
        glowColor={glowColor}
        animateOnHover={!isDisabled}
      />
      
      <motion.div
        className={cn(
          "mt-2 text-center text-sm font-medium",
          isActive ? "text-white" : "text-white/80"
        )}
        animate={{ 
          opacity: isActive ? 1 : 0.8,
          y: isActive ? 0 : 2
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
});

NavigationNode.displayName = 'NavigationNode';

export default NavigationNode;
