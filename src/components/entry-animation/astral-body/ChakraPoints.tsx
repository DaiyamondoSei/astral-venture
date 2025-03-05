
import React from 'react';
import { motion } from 'framer-motion';
import { CHAKRA_NAMES } from '@/components/entry-animation/cosmic/types';

export interface ChakraActivation {
  root: boolean;
  sacral: boolean;
  solar: boolean;
  heart: boolean;
  throat: boolean;
  third: boolean;
  crown: boolean;
}

interface ChakraPointsProps {
  chakras: ChakraActivation;
}

const ChakraPoints: React.FC<ChakraPointsProps> = ({ chakras }) => {
  const getChakraMotionProps = (isActive: boolean) => ({
    initial: { scale: 0.6, opacity: 0.2 },
    animate: { 
      scale: isActive ? [1, 1.2, 1] : 0.8, 
      opacity: isActive ? 1 : 0.3 
    },
    transition: { 
      duration: isActive ? 2 : 0.5,
      repeat: isActive ? Infinity : 0,
      repeatType: "reverse" as const
    }
  });

  return (
    <>
      {/* Energy Points (chakras) with emotional activation */}
      <motion.circle 
        cx="100" cy="280" r="6" 
        className={`energy-point root-chakra ${chakras.root ? 'active' : 'inactive'}`}
        style={{fill: "#e11d48"}}
        {...getChakraMotionProps(chakras.root)}
        aria-label="Root chakra"
      />
      
      <motion.circle 
        cx="100" cy="220" r="5" 
        className={`energy-point sacral-chakra ${chakras.sacral ? 'active' : 'inactive'}`}
        style={{fill: "#fb923c"}}
        {...getChakraMotionProps(chakras.sacral)}
        aria-label="Sacral chakra"
      />
      
      <motion.circle 
        cx="100" cy="180" r="6" 
        className={`energy-point solar-chakra ${chakras.solar ? 'active' : 'inactive'}`}
        style={{fill: "#facc15"}}
        {...getChakraMotionProps(chakras.solar)}
        aria-label="Solar plexus chakra"
      />
      
      <motion.circle 
        cx="100" cy="140" r="7" 
        className={`energy-point heart-chakra ${chakras.heart ? 'active' : 'inactive'}`}
        style={{fill: "#22c55e"}}
        {...getChakraMotionProps(chakras.heart)}
        aria-label="Heart chakra"
      />
      
      <motion.circle 
        cx="100" cy="110" r="5" 
        className={`energy-point throat-chakra ${chakras.throat ? 'active' : 'inactive'}`}
        style={{fill: "#0ea5e9"}}
        {...getChakraMotionProps(chakras.throat)}
        aria-label="Throat chakra"
      />
      
      <motion.circle 
        cx="100" cy="90" r="4" 
        className={`energy-point third-chakra ${chakras.third ? 'active' : 'inactive'}`}
        style={{fill: "#6366f1"}}
        {...getChakraMotionProps(chakras.third)}
        aria-label="Third eye chakra"
      />
      
      <motion.circle 
        cx="100" cy="60" r="6" 
        className={`energy-point crown-chakra ${chakras.crown ? 'active' : 'inactive'}`}
        style={{fill: "#a855f7"}}
        {...getChakraMotionProps(chakras.crown)}
        aria-label="Crown chakra"
      />
    </>
  );
};

export default ChakraPoints;
