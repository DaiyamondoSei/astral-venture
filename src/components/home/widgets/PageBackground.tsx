
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
    const baseCount = Math.min(Math.max(15, Math.floor(energyPoints / 100) + 15), 40);
    
    if (performanceCategory === 'low') return Math.max(5, Math.floor(baseCount * 0.4));
    if (performanceCategory === 'medium') return Math.max(10, Math.floor(baseCount * 0.7));
    return baseCount;
  };
  
  // Calculate animation speed based on consciousness level and device performance
  const particleSpeed = Math.max(0.5, Math.min(1.5, 
    consciousnessLevel * (performanceCategory === 'high' ? 0.2 : 0.15)
  ));
  
  // Generate background orbs
  useEffect(() => {
    if (performanceCategory === 'low') {
      setOrbs([]);
      return;
    }
    
    const orbCount = isMobile ? 3 : Math.min(Math.floor(consciousnessLevel + 2), 6);
    const newOrbs = [];
    
    for (let i = 0; i < orbCount; i++) {
      newOrbs.push({
        x: `${10 + Math.random() * 80}%`,
        y: `${10 + Math.random() * 80}%`,
        size: `${isMobile ? 100 + Math.random() * 100 : 150 + Math.random() * 200}px`,
        color: getOrbColor(i),
        delay: i * 0.5
      });
    }
    
    setOrbs(newOrbs);
  }, [consciousnessLevel, performanceCategory, isMobile]);
  
  // Get orb color based on index
  const getOrbColor = (index: number) => {
    const colors = [
      'from-quantum-600/20 to-astral-500/10',
      'from-astral-500/20 to-ethereal-500/10',
      'from-ethereal-500/15 to-quantum-600/10',
      'from-purple-500/15 to-blue-500/10',
      'from-blue-500/15 to-teal-500/10',
      'from-violet-500/15 to-indigo-500/10'
    ];
    
    return colors[index % colors.length];
  };
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-quantum-950/50 to-black/90 z-0"></div>
      
      {/* Animated background orbs */}
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
            opacity: 0.4
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: orb.delay
          }}
        />
      ))}
      
      {/* Sacred geometry background with consciousness level */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5 }}
      >
        <MetatronsBackground 
          consciousnessLevel={consciousnessLevel}
          opacity={0.2}
          intensity={performanceCategory === 'low' ? "low" : "medium"}
          animated={performanceCategory !== 'low'}
        />
      </motion.div>
      
      {/* Quantum particles with dynamic count based on energy */}
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
