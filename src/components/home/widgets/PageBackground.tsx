
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MetatronsBackground from '@/components/sacred-geometry/components/MetatronsBackground';
import QuantumParticles from '@/components/effects/QuantumParticles';
import { getPerformanceCategory } from '@/utils/performanceUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface PageBackgroundProps {
  energyPoints: number;
  consciousnessLevel: number;
}

/**
 * PageBackground component
 * 
 * Renders the background effects for the main page based on the user's
 * energy points and consciousness level.
 */
const PageBackground: React.FC<PageBackgroundProps> = ({ 
  energyPoints, 
  consciousnessLevel 
}) => {
  const [orbs, setOrbs] = useState<{x: string, y: string, size: string, color: string, delay: number}[]>([]);
  const performanceCategory = getPerformanceCategory();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Calculate particle count based on device performance and energy points
  const getParticleCount = () => {
    // Reduce particle count significantly to improve performance
    const baseCount = Math.min(Math.max(5, Math.floor(energyPoints / 150) + 5), 25);
    
    if (performanceCategory === 'low') return Math.max(3, Math.floor(baseCount * 0.3));
    if (performanceCategory === 'medium') return Math.max(5, Math.floor(baseCount * 0.5));
    return baseCount;
  };
  
  // Calculate animation speed based on consciousness level and device performance
  const particleSpeed = Math.max(0.3, Math.min(0.8, 
    consciousnessLevel * (performanceCategory === 'high' ? 0.15 : 0.10)
  ));
  
  // Generate background orbs - reduced for better performance
  useEffect(() => {
    if (performanceCategory === 'low') {
      setOrbs([]);
      return;
    }
    
    const orbCount = isMobile ? 2 : Math.min(Math.floor(consciousnessLevel + 1), 4);
    const newOrbs = [];
    
    for (let i = 0; i < orbCount; i++) {
      newOrbs.push({
        x: `${15 + Math.random() * 70}%`,
        y: `${15 + Math.random() * 70}%`,
        size: `${isMobile ? 80 + Math.random() * 80 : 120 + Math.random() * 150}px`,
        color: getOrbColor(i),
        delay: i * 0.7
      });
    }
    
    setOrbs(newOrbs);
  }, [consciousnessLevel, performanceCategory, isMobile]);
  
  // Get orb color based on index
  const getOrbColor = (index: number) => {
    const colors = [
      'from-quantum-600/15 to-astral-500/8',
      'from-astral-500/15 to-ethereal-500/8',
      'from-ethereal-500/12 to-quantum-600/8',
      'from-purple-500/12 to-blue-500/8',
    ];
    
    return colors[index % colors.length];
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Base gradient overlay - simplified for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-quantum-950/60 to-black/95 z-0"></div>
      
      {/* Animated background orbs - reduced opacity for better contrast */}
      {orbs.map((orb, index) => (
        <motion.div
          key={`orb-${index}`}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} z-0`}
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            filter: 'blur(60px)',
            opacity: 0.25
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.03, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: orb.delay
          }}
        />
      ))}
      
      {/* Sacred geometry background with consciousness level - improved visibility */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.5 }}
        className="z-0"
      >
        <MetatronsBackground 
          consciousnessLevel={consciousnessLevel}
          opacity={0.25}
          intensity={performanceCategory === 'low' ? "low" : "medium"}
          animated={performanceCategory !== 'low'}
        />
      </motion.div>
      
      {/* Quantum particles with dynamic count based on energy - significantly reduced */}
      <QuantumParticles 
        count={getParticleCount()} 
        interactive={performanceCategory !== 'low'}
        className="z-0"
        speed={particleSpeed}
      />
    </div>
  );
};

export default React.memo(PageBackground);
