
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CentralEffectsProps {
  showInfinity: boolean;
  showTranscendence: boolean;
  showIllumination: boolean;
  baseProgressPercentage: number;
}

const CentralEffects: React.FC<CentralEffectsProps> = ({
  showInfinity,
  showTranscendence,
  showIllumination,
  baseProgressPercentage
}) => {
  // Determine animation complexity based on consciousness level
  const particleCount = showInfinity ? 24 : showTranscendence ? 18 : showIllumination ? 12 : 8;
  
  // Memoize particles to prevent re-renders
  const particles = useMemo(() => {
    // Create energy particles that emanate from the center
    return Array.from({ length: particleCount }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / particleCount;
      const delay = index * 0.1;
      
      // Calculate particle color based on consciousness level
      let particleColor = "rgba(100, 120, 255, 0.4)"; // Default
      
      if (showInfinity) {
        particleColor = `hsl(${(index * 15) % 360}, 80%, 70%, 0.5)`;
      } else if (showTranscendence) {
        particleColor = "rgba(180, 180, 255, 0.4)";
      } else if (showIllumination) {
        particleColor = "rgba(140, 180, 255, 0.3)";
      }
      
      return (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: particleColor,
            left: "50%",
            top: "50%",
            margin: "-2px 0 0 -2px",
          }}
          animate={{
            x: [0, Math.cos(angle) * 100 * baseProgressPercentage],
            y: [0, Math.sin(angle) * 100 * baseProgressPercentage],
            opacity: [1, 0],
            scale: showInfinity ? [1, 2] : [1, 1.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: delay,
            ease: "easeOut"
          }}
        />
      );
    });
  }, [particleCount, showInfinity, showTranscendence, showIllumination, baseProgressPercentage]);
  
  // Enhanced central orb glow
  const glowVariants = {
    infinity: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(180,180,255,0.3) 50%, rgba(100,100,255,0) 80%)`,
    transcendence: `radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(180,180,255,0.2) 50%, rgba(100,100,255,0) 80%)`,
    illumination: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(140,180,255,0.2) 50%, rgba(100,100,255,0) 80%)`,
    default: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(140,180,255,0.15) 50%, rgba(100,100,255,0) 80%)`
  };
  
  const getGlowVariant = () => {
    if (showInfinity) return glowVariants.infinity;
    if (showTranscendence) return glowVariants.transcendence;
    if (showIllumination) return glowVariants.illumination;
    return glowVariants.default;
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
      
      <motion.div
        className="absolute left-1/2 top-1/2 -ml-8 -mt-8 w-16 h-16 rounded-full"
        style={{
          background: getGlowVariant()
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Add more complex effects for higher consciousness states */}
      {showInfinity && (
        <motion.div
          className="absolute left-1/2 top-1/2 -ml-16 -mt-16 w-32 h-32"
          style={{
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 0 30px rgba(180, 180, 255, 0.3)"
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
        />
      )}
      
      {showTranscendence && (
        <motion.div
          className="absolute left-1/2 top-1/2 -ml-12 -mt-12 w-24 h-24 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0) 40%, rgba(180,180,255,0.2) 80%, rgba(255,255,255,0) 100%)"
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};

export default CentralEffects;
