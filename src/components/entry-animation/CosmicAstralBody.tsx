
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlowEffect from '@/components/GlowEffect';

const CosmicAstralBody = () => {
  const [stars, setStars] = useState<{x: number, y: number, size: number, delay: number, duration: number}[]>([]);
  
  useEffect(() => {
    // Generate random stars
    const randomStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
    
    setStars(randomStars);
  }, []);

  return (
    <div className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden rounded-xl">
      {/* Background stars */}
      <div className="absolute inset-0 bg-black">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-200"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`
            }}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              boxShadow: [
                '0 0 2px rgba(148, 163, 184, 0.5)', 
                '0 0 8px rgba(148, 163, 184, 0.8)', 
                '0 0 2px rgba(148, 163, 184, 0.5)'
              ]
            }}
            transition={{ 
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatType: "loop" as const
            }}
          />
        ))}
      </div>
      
      {/* Cosmic Circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((circle) => (
          <motion.div
            key={circle}
            className="absolute rounded-full border border-blue-400/30"
            initial={{ width: '40%', height: '40%', opacity: 0 }}
            animate={{ 
              width: ['40%', '90%'],
              height: ['40%', '90%'],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4,
              delay: circle * 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
        >
          <path d="M20,30 L35,40 L50,35 L65,45 L80,30" className="stroke-blue-300/30 stroke-[0.2]" />
          <path d="M25,50 L40,55 L50,50 L60,55 L75,50" className="stroke-blue-300/30 stroke-[0.2]" />
          <path d="M20,70 L35,60 L50,65 L65,55 L80,70" className="stroke-blue-300/30 stroke-[0.2]" />
          <path d="M50,20 L50,80" className="stroke-blue-300/20 stroke-[0.2]" />
        </motion.g>
      </svg>
      
      {/* Human silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative h-4/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <svg 
            className="h-full mx-auto astral-body-silhouette"
            viewBox="0 0 100 220" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="silhouetteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />
                <stop offset="50%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" />
              </linearGradient>
            </defs>
            
            {/* Full silhouette */}
            <path 
              d="M50,30 
                 C58,30 64,24 64,16 
                 C64,8 58,2 50,2 
                 C42,2 36,8 36,16 
                 C36,24 42,30 50,30 
                 Z 
                 M38,32 L62,32 
                 L64,45 L36,45 
                 Z 
                 M36,45 L64,45 
                 L68,100 L32,100 
                 Z
                 M32,100 L40,100 L36,140 L28,140 
                 Z
                 M68,100 L60,100 L64,140 L72,140 
                 Z
                 M36,140 L28,140 L30,170 L38,170 
                 Z
                 M64,140 L72,140 L70,170 L62,170 
                 Z"
              fill="url(#silhouetteGradient)"
              className="astral-body-silhouette"
            />
            
            {/* Energy points */}
            <circle cx="50" cy="16" r="2" className="energy-point crown-chakra" />
            <circle cx="50" cy="32" r="2" className="energy-point throat-chakra" />
            <circle cx="50" cy="55" r="2.5" className="energy-point heart-chakra" />
            <circle cx="50" cy="70" r="2" className="energy-point solar-chakra" />
            <circle cx="50" cy="85" r="2" className="energy-point sacral-chakra" />
            <circle cx="50" cy="100" r="2.5" className="energy-point root-chakra" />
          </svg>
          
          {/* Central glow behind the silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="w-1/2 h-1/2 rounded-full bg-gradient-to-t from-blue-500/20 to-cyan-400/20 blur-xl"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse" as const
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Pulsing light effect */}
      <GlowEffect 
        className="absolute inset-0 w-full h-full rounded-lg"
        animation="pulse"
        color="rgba(56, 189, 248, 0.2)"
        intensity="medium"
      />
      
      {/* Central bright light at center of body */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-300/80 blur-xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse" as const
        }}
      />
    </div>
  );
};

export default CosmicAstralBody;
