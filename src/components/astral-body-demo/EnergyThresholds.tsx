
import React from 'react';
import { motion } from 'framer-motion';
import { ENERGY_THRESHOLDS } from '@/components/entry-animation/cosmic/types';

/**
 * EnergyThresholds component
 * 
 * Displays the various energy thresholds that trigger changes in the astral body visualization
 */
const EnergyThresholds = () => {
  // Array of thresholds with labels and descriptions
  const thresholds = [
    { 
      name: 'Chakra Activation', 
      points: ENERGY_THRESHOLDS.CHAKRAS, 
      description: 'Energy centers become visible',
      color: 'from-quantum-400/20 to-quantum-600/10'
    },
    { 
      name: 'Aura Manifestation', 
      points: ENERGY_THRESHOLDS.AURA, 
      description: 'Energy field expands around the form',
      color: 'from-quantum-400/30 to-quantum-600/15'
    },
    { 
      name: 'Constellation Connection', 
      points: ENERGY_THRESHOLDS.CONSTELLATION, 
      description: 'Cosmic connections emerge',
      color: 'from-astral-400/20 to-astral-600/10'
    },
    { 
      name: 'Detail Enhancement', 
      points: ENERGY_THRESHOLDS.DETAILS, 
      description: 'Increased field resolution',
      color: 'from-astral-400/30 to-astral-600/15'
    },
    { 
      name: 'Illumination Stage', 
      points: ENERGY_THRESHOLDS.ILLUMINATION, 
      description: 'Inner light begins to radiate',
      color: 'from-ethereal-400/20 to-ethereal-600/10'
    },
    { 
      name: 'Fractal Emergence', 
      points: ENERGY_THRESHOLDS.FRACTAL, 
      description: 'Geometric patterns of consciousness',
      color: 'from-ethereal-400/30 to-ethereal-600/15'
    },
    { 
      name: 'Transcendence', 
      points: ENERGY_THRESHOLDS.TRANSCENDENCE, 
      description: 'Beyond form limitations',
      color: 'from-purple-400/30 to-purple-600/15'
    },
    { 
      name: 'Infinite Consciousness', 
      points: ENERGY_THRESHOLDS.INFINITY, 
      description: 'Fusion with universal consciousness',
      color: 'from-purple-400/40 to-purple-600/20'
    },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.h3 
        className="text-center text-xl font-display mb-6 text-white glow-text"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Energy Evolution Thresholds
      </motion.h3>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {thresholds.map((threshold, index) => (
          <motion.div 
            key={threshold.name}
            className={`glass-card relative overflow-hidden p-4 border-white/5 hover:border-white/10 transition-colors duration-300`}
            variants={itemVariants}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${threshold.color} opacity-50`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-display text-white">{threshold.name}</h4>
                <span className="text-sm font-mono bg-black/30 px-2 py-0.5 rounded-full text-white/80">
                  {threshold.points} pts
                </span>
              </div>
              <p className="text-sm text-white/70">{threshold.description}</p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.p 
        className="text-center mt-8 text-sm text-white/60 italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        As your energy points increase, your astral body visualization evolves through these stages
      </motion.p>
    </div>
  );
};

export default EnergyThresholds;
