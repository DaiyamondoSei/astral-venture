
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface BackgroundGlowProps {
  emotionalGrowth: number;
  glowIntensity: number;
  dominantEmotions?: string[];
}

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({
  emotionalGrowth,
  glowIntensity,
  dominantEmotions = []
}) => {
  // Smooth transition for glow intensity
  const transitionedGlowIntensity = useEmotionalTransition(glowIntensity, {
    duration: 2000,
    easing: 'easeOutQuad'
  });
  
  // Determine the color based on dominant emotions
  const glowColor = useMemo(() => {
    // Emotional color mapping
    const colorMap: Record<string, string> = {
      'Joy': '#f59e0b',       // Amber
      'Love': '#ec4899',      // Pink
      'Peace': '#60a5fa',     // Blue
      'Hope': '#a78bfa',      // Violet
      'Wisdom': '#7dd3fc',    // Light Blue
      'Gratitude': '#d946ef', // Fuchsia
      'Clarity': '#f0abfc',   // Light Purple
      'Harmony': '#4ade80',   // Green
      'Tranquility': '#38bdf8', // Sky Blue
      'Bliss': '#fcd34d'      // Yellow
    };
    
    // Default color if no emotions
    if (dominantEmotions.length === 0) {
      return 'rgba(124, 58, 237, 0.3)'; // Violet default
    }
    
    // If we have dominant emotions, use them to create a gradient
    if (dominantEmotions.length === 1) {
      const color = colorMap[dominantEmotions[0]] || '#8b5cf6';
      return color;
    } else {
      // For multiple emotions, create gradient
      const color1 = colorMap[dominantEmotions[0]] || '#8b5cf6';
      const color2 = colorMap[dominantEmotions[1]] || '#6366f1';
      return [color1, color2];
    }
  }, [dominantEmotions]);
  
  // Determine the background pattern based on emotional growth
  const backgroundPattern = useMemo(() => {
    if (emotionalGrowth > 80) {
      return 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)';
    } else if (emotionalGrowth > 60) {
      return 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0) 100%)';
    } else if (emotionalGrowth > 40) {
      return 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0) 100%)';
    }
    return 'none';
  }, [emotionalGrowth]);
  
  // Calculate vibration intensity based on emotional growth
  const vibrationIntensity = useMemo(() => {
    return Math.min(emotionalGrowth / 500, 0.4);
  }, [emotionalGrowth]);
  
  // Intensity affects animation duration and scale
  const animationParams = useMemo(() => {
    const baseDuration = 5;
    const intensityFactor = 1 - (emotionalGrowth / 200); // Higher growth = faster animation
    
    return {
      duration: Math.max(baseDuration * intensityFactor, 3),
      scale: 1 + (transitionedGlowIntensity * 0.2)
    };
  }, [emotionalGrowth, transitionedGlowIntensity]);

  return (
    <motion.div 
      className="absolute inset-0 rounded-lg overflow-hidden"
      style={{ background: backgroundPattern }}
    >
      {/* Center glow */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        animate={{
          opacity: [
            transitionedGlowIntensity * 0.6,
            transitionedGlowIntensity,
            transitionedGlowIntensity * 0.6
          ],
          scale: [
            animationParams.scale - 0.05,
            animationParams.scale,
            animationParams.scale - 0.05
          ],
          x: vibrationIntensity > 0 ? [
            -vibrationIntensity * 3,
            vibrationIntensity * 3,
            -vibrationIntensity * 3
          ] : 0,
          y: vibrationIntensity > 0 ? [
            -vibrationIntensity * 2,
            vibrationIntensity * 2,
            -vibrationIntensity * 2
          ] : 0
        }}
        transition={{
          duration: animationParams.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Radial gradient based on dominant emotions */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
            background: Array.isArray(glowColor) 
              ? `radial-gradient(circle at center, ${glowColor[0]}30 0%, ${glowColor[1]}10 70%, transparent 100%)`
              : `radial-gradient(circle at center, ${glowColor}30 0%, ${glowColor}10 70%, transparent 100%)`,
            opacity: transitionedGlowIntensity
          }}
        />
      </motion.div>
      
      {/* Additional animated overlay for higher emotional states */}
      {emotionalGrowth > 60 && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: Array.isArray(glowColor)
              ? `linear-gradient(45deg, ${glowColor[0]}10, ${glowColor[1]}10)` 
              : `linear-gradient(45deg, ${glowColor}10, rgba(124, 58, 237, 0.1))`,
            mixBlendMode: "screen",
            opacity: 0.6 * transitionedGlowIntensity
          }}
          animate={{
            opacity: [0.3 * transitionedGlowIntensity, 0.6 * transitionedGlowIntensity, 0.3 * transitionedGlowIntensity],
          }}
          transition={{
            duration: animationParams.duration * 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Light particles for transcendent states */}
      {emotionalGrowth > 80 && (
        <div className="absolute inset-0">
          {Array.from({ length: Math.min(Math.floor(emotionalGrowth / 10), 12) }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: 1 + Math.random() * 2,
                height: 1 + Math.random() * 2,
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                opacity: 0.3 + Math.random() * 0.5,
                boxShadow: Array.isArray(glowColor)
                  ? `0 0 10px ${glowColor[i % 2]}`
                  : `0 0 10px ${glowColor}`
              }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0, 2, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BackgroundGlow;
