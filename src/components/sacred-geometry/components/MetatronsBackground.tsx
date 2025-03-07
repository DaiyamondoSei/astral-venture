
import React from 'react';
import { motion } from 'framer-motion';

interface MetatronsBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  opacity?: number;
  consciousnessLevel?: number;
}

const MetatronsBackground: React.FC<MetatronsBackgroundProps> = ({ 
  intensity = 'medium', 
  animated = true,
  opacity = 0.15,
  consciousnessLevel = 1
}) => {
  // Calculate intensity values
  const lineOpacity = opacity * (intensity === 'low' ? 0.7 : intensity === 'medium' ? 1 : 1.3);
  const glowIntensity = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;
  
  // Scale effect based on consciousness level (1-10)
  const levelScale = Math.min(1 + (consciousnessLevel * 0.05), 1.5);
  
  // Animation variants
  const rotateAnimation = animated ? {
    rotate: [0, 360],
    transition: { duration: 300, repeat: Infinity, ease: "linear" }
  } : {};
  
  const pulseAnimation = animated ? {
    scale: [1, 1.02, 1],
    opacity: [lineOpacity, lineOpacity * 1.5, lineOpacity],
    transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
  } : {};
  
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-quantum-800/10 via-transparent to-transparent" />
      
      {/* Base cube structure - fixed grid */}
      <svg
        viewBox="0 0 400 400"
        className="absolute w-full h-full stroke-white"
        style={{ strokeOpacity: lineOpacity }}
      >
        {/* Outer circle */}
        <circle cx="200" cy="200" r="180" fill="none" strokeWidth="0.5" />
        
        {/* Inner circles */}
        <circle cx="200" cy="200" r="140" fill="none" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="100" fill="none" strokeWidth="0.5" />
        
        {/* Hexagon */}
        <polygon 
          points="200,20 340,110 340,290 200,380 60,290 60,110" 
          fill="none" 
          strokeWidth="0.5" 
        />
        
        {/* Connection lines - perfectly aligned */}
        <line x1="200" y1="20" x2="200" y2="380" strokeWidth="0.5" />
        <line x1="60" y1="110" x2="340" y2="290" strokeWidth="0.5" />
        <line x1="60" y1="290" x2="340" y2="110" strokeWidth="0.5" />
        
        {/* Inner hexagon */}
        <polygon 
          points="200,80 280,130 280,270 200,320 120,270 120,130" 
          fill="none" 
          strokeWidth="0.5" 
        />
        
        {/* Node intersection points - where icons will be placed */}
        <circle cx="200" cy="20" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="top" />
        <circle cx="340" cy="110" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="top-right" />
        <circle cx="340" cy="290" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="bottom-right" />
        <circle cx="200" cy="380" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="bottom" />
        <circle cx="60" cy="290" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="bottom-left" />
        <circle cx="60" cy="110" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="top-left" />
        
        {/* Inner hexagon points */}
        <circle cx="200" cy="80" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-top" />
        <circle cx="280" cy="130" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-top-right" />
        <circle cx="280" cy="270" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-bottom-right" />
        <circle cx="200" cy="320" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-bottom" />
        <circle cx="120" cy="270" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-bottom-left" />
        <circle cx="120" cy="130" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="inner-top-left" />
        
        {/* Center point */}
        <circle cx="200" cy="200" r="4" fillOpacity="0" strokeWidth="0" className="node-point" data-position="center" />

        {/* Consciousness level visual enhancements */}
        {consciousnessLevel > 2 && (
          <>
            <circle cx="200" cy="200" r={60 + (consciousnessLevel * 3)} fill="none" strokeWidth="0.3" strokeOpacity={0.3 + (consciousnessLevel * 0.05)} />
            <circle cx="200" cy="200" r={30 + (consciousnessLevel * 2)} fill="none" strokeWidth="0.3" strokeOpacity={0.3 + (consciousnessLevel * 0.05)} />
          </>
        )}
      </svg>
      
      {/* Animated overlay - can rotate and pulse without affecting alignment */}
      {animated && (
        <motion.svg
          viewBox="0 0 400 400"
          className="absolute w-full h-full stroke-white"
          style={{ strokeOpacity: lineOpacity * 0.6 }}
          animate={rotateAnimation}
        >
          <circle cx="200" cy="200" r="160" fill="none" strokeWidth="0.3" />
          <polygon 
            points="200,40 320,120 320,280 200,360 80,280 80,120" 
            fill="none" 
            strokeWidth="0.3" 
          />
          
          {/* Add consciousness level-based elements */}
          {consciousnessLevel > 3 && (
            <polygon 
              points={`200,${100 - consciousnessLevel * 3} ${250 + consciousnessLevel * 2},${150 - consciousnessLevel} ${250 + consciousnessLevel * 2},${250 + consciousnessLevel} 200,${300 + consciousnessLevel * 3} ${150 - consciousnessLevel * 2},${250 + consciousnessLevel} ${150 - consciousnessLevel * 2},${150 - consciousnessLevel}`}
              fill="none" 
              strokeWidth="0.2"
              strokeOpacity={0.3 + (consciousnessLevel * 0.05)}
            />
          )}
        </motion.svg>
      )}
      
      {/* Pulse effect for nodes */}
      {animated && (
        <motion.svg
          viewBox="0 0 400 400"
          className="absolute w-full h-full"
          animate={pulseAnimation}
        >
          <circle cx="200" cy="200" r={8 + (consciousnessLevel * 0.5)} fill={`rgba(255,255,255,${0.2 + (consciousnessLevel * 0.02)})`} />
          <circle cx="200" cy="20" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
          <circle cx="340" cy="110" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
          <circle cx="340" cy="290" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
          <circle cx="200" cy="380" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
          <circle cx="60" cy="290" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
          <circle cx="60" cy="110" r={6 + (consciousnessLevel * 0.3)} fill={`rgba(255,255,255,${0.15 + (consciousnessLevel * 0.01)})`} />
        </motion.svg>
      )}
    </div>
  );
};

export default MetatronsBackground;
