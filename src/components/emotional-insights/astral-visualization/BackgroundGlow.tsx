
import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundGlowProps {
  emotionalGrowth: number;
  glowIntensity: number;
  dominantEmotions: string[];
}

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({ 
  emotionalGrowth, 
  glowIntensity,
  dominantEmotions
}) => {
  // Determine glow colors based on dominant emotions or default to purples
  const getGlowColor = () => {
    if (dominantEmotions.includes('peace') || dominantEmotions.includes('calm')) {
      return {
        primary: "rgba(56, 189, 248, 0.2)",    // Sky blue
        secondary: "rgba(96, 165, 250, 0.15)"  // Blue
      };
    }
    if (dominantEmotions.includes('joy') || dominantEmotions.includes('happiness')) {
      return {
        primary: "rgba(250, 204, 21, 0.2)",    // Yellow
        secondary: "rgba(234, 179, 8, 0.15)"   // Amber
      };
    }
    if (dominantEmotions.includes('love') || dominantEmotions.includes('compassion')) {
      return {
        primary: "rgba(248, 113, 113, 0.2)",   // Red
        secondary: "rgba(239, 68, 68, 0.15)"   // Red darker
      };
    }
    // Default purples
    return {
      primary: "rgba(168, 85, 247, 0.2)",      // Purple
      secondary: "rgba(139, 92, 246, 0.15)"    // Violet
    };
  };
  
  const glowColors = getGlowColor();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${glowColors.primary} 0%, ${glowColors.secondary} 50%, rgba(0,0,0,0) 70%)`,
          opacity: glowIntensity
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [glowIntensity, glowIntensity * 0.8, glowIntensity]
        }}
        transition={{
          scale: {
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          },
          opacity: {
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      />
      
      {emotionalGrowth > 70 && (
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${glowColors.primary} 0%, rgba(0,0,0,0) 70%)`,
            opacity: glowIntensity * 0.7
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [glowIntensity * 0.7, glowIntensity * 0.5, glowIntensity * 0.7]
          }}
          transition={{
            scale: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            },
            opacity: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
      )}
    </div>
  );
};

export default BackgroundGlow;
