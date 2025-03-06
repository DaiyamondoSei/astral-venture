
import { AnimationProps } from 'framer-motion';

/**
 * Common animation presets for cosmic-themed animations
 */

// Fade in animations with different directions
export const fadeInUp: AnimationProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInDown: AnimationProps = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInLeft: AnimationProps = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInRight: AnimationProps = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

// Scale animations
export const scaleIn: AnimationProps = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

// Quantum particle effect animations
export const quantumParticleFloat = {
  y: [0, -10, 0, 10, 0],
  opacity: [0.5, 0.8, 0.5, 0.8, 0.5],
  scale: [1, 1.05, 1, 1.05, 1],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Cosmic pulse animation
export const cosmicPulse = {
  scale: [1, 1.02, 1, 0.98, 1],
  opacity: [0.8, 1, 0.8, 0.6, 0.8],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Energy flow animation
export const energyFlow = {
  rotate: [0, 360],
  transition: {
    duration: 30,
    repeat: Infinity,
    ease: "linear"
  }
};

// Chakra activation animation variants
export const chakraActivationVariants = {
  inactive: { 
    scale: 1, 
    opacity: 0.5,
    filter: "brightness(0.8)"
  },
  active: { 
    scale: [1, 1.15, 1.1],
    opacity: 1,
    filter: "brightness(1.2)",
    transition: {
      scale: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Page transition variants
export const pageTransitionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Staggered children animation for menus and lists
export const staggeredChildrenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Sacred geometry animation
export const sacredGeometryRotation = {
  rotate: [0, 360],
  transition: {
    duration: 60,
    repeat: Infinity,
    ease: "linear"
  }
};
