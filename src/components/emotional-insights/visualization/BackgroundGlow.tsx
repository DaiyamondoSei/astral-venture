
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalTransition } from '@/hooks/useEmotionalTransition';

interface BackgroundGlowProps {
  emotionalGrowth: number;
  glowIntensity: number;
  dominantEmotions?: string[]; // Optional dominant emotions for color variation
}

const BackgroundGlow: React.FC<BackgroundGlowProps> = ({ 
  emotionalGrowth, 
  glowIntensity,
  dominantEmotions = [] 
}) => {
  // Smooth transitions for glow intensity
  const transitionedGlowIntensity = useEmotionalTransition(glowIntensity);
  const transitionedGrowth = useEmotionalTransition(emotionalGrowth);
  
  // Calculate dynamic glow properties based on emotional state
  const glowProperties = useMemo(() => {
    const baseGlowSize = 20 + (transitionedGrowth / 10);
    
    // Determine color based on dominant emotions
    let glowColor = 'rgba(138, 92, 246, {{intensity}})'; // Default purple
    
    if (dominantEmotions.includes('Love')) {
      glowColor = 'rgba(236, 72, 153, {{intensity}})'; // Pink
    } else if (dominantEmotions.includes('Peace')) {
      glowColor = 'rgba(14, 165, 233, {{intensity}})'; // Blue
    } else if (dominantEmotions.includes('Wisdom')) {
      glowColor = 'rgba(168, 85, 247, {{intensity}})'; // Purple
    } else if (dominantEmotions.includes('Power')) {
      glowColor = 'rgba(245, 158, 11, {{intensity}})'; // Amber
    } else if (dominantEmotions.includes('Healing')) {
      glowColor = 'rgba(16, 185, 129, {{intensity}})'; // Emerald
    }
    
    return {
      size: baseGlowSize,
      color: glowColor.replace('{{intensity}}', transitionedGlowIntensity.toString())
    };
  }, [transitionedGlowIntensity, transitionedGrowth, dominantEmotions]);
  
  // Create array of multiple background elements for layered effect
  const backgroundLayers = useMemo(() => {
    const layerCount = Math.max(1, Math.min(5, Math.floor(transitionedGrowth / 20)));
    return Array.from({ length: layerCount }, (_, i) => ({
      id: i,
      scale: 1 - (i * 0.1),
      opacity: transitionedGlowIntensity * (1 - (i * 0.15)),
      duration: 3 + (i * 0.7)
    }));
  }, [transitionedGrowth, transitionedGlowIntensity]);

  return (
    <>
      {/* Primary background glow */}
      <motion.div 
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: `inset 0 0 ${glowProperties.size}px ${glowProperties.color}`
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      {/* Layered background pulses for more depth */}
      {backgroundLayers.map(layer => (
        <motion.div
          key={`bg-layer-${layer.id}`}
          className="absolute inset-0 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: [layer.opacity * 0.7, layer.opacity, layer.opacity * 0.7],
            scale: [layer.scale, layer.scale * 1.05, layer.scale],
            boxShadow: `inset 0 0 ${glowProperties.size * (1 + layer.id * 0.2)}px ${glowProperties.color.replace(
              '{{intensity}}', 
              (transitionedGlowIntensity * (1 - layer.id * 0.2)).toString()
            )}`
          }}
          transition={{ 
            duration: layer.duration, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut",
            delay: layer.id * 0.5
          }}
        />
      ))}
      
      {/* Ambient particle effects for higher emotional states */}
      {transitionedGrowth > 50 && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {Array.from({ length: Math.floor(transitionedGrowth / 10) }, (_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.2 + Math.random() * 0.3
              }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0, 1, 0],
                y: [0, -20 - Math.random() * 30]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default BackgroundGlow;
