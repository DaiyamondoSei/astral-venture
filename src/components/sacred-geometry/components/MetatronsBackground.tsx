
import React from 'react';
import { motion } from 'framer-motion';

const MetatronsBackground: React.FC = () => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    >
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="rgba(138, 92, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(138, 92, 246, 0)" />
        </radialGradient>
        
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background glow effect */}
      <motion.circle 
        cx="250" 
        cy="250" 
        r="200" 
        fill="url(#centerGlow)"
        initial={{ opacity: 0.5 }}
        animate={{ 
          opacity: [0.5, 0.7, 0.5],
          r: [200, 210, 200]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Center circle */}
      <motion.circle 
        cx="250" 
        cy="250" 
        r="20" 
        fill="none" 
        stroke="rgba(255,255,255,0.6)" 
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Inner circles */}
      <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8">
        <motion.circle 
          cx="250" cy="180" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        />
        <motion.circle 
          cx="320" cy="215" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.circle 
          cx="320" cy="285" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.circle 
          cx="250" cy="320" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.circle 
          cx="180" cy="285" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.circle 
          cx="180" cy="215" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </g>
      
      {/* Outer circles */}
      <g fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7">
        <motion.circle 
          cx="250" cy="110" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        />
        <motion.circle 
          cx="390" cy="180" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        <motion.circle 
          cx="390" cy="320" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        />
        <motion.circle 
          cx="250" cy="390" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
        />
        <motion.circle 
          cx="110" cy="320" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        />
        <motion.circle 
          cx="110" cy="180" r="20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
      </g>
      
      {/* Connecting lines */}
      <g stroke="url(#lineGradient)" strokeWidth="0.5">
        {/* Inner hexagon */}
        <motion.line 
          x1="250" y1="180" x2="320" y2="215" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.3 }}
        />
        <motion.line 
          x1="320" y1="215" x2="320" y2="285" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.4 }}
        />
        <motion.line 
          x1="320" y1="285" x2="250" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
        <motion.line 
          x1="250" y1="320" x2="180" y2="285" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.6 }}
        />
        <motion.line 
          x1="180" y1="285" x2="180" y2="215" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.7 }}
        />
        <motion.line 
          x1="180" y1="215" x2="250" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        />
        
        {/* Outer hexagon */}
        <motion.line 
          x1="250" y1="110" x2="390" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 1.9 }}
        />
        <motion.line 
          x1="390" y1="180" x2="390" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 2.0 }}
        />
        <motion.line 
          x1="390" y1="320" x2="250" y2="390" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 2.1 }}
        />
        <motion.line 
          x1="250" y1="390" x2="110" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 2.2 }}
        />
        <motion.line 
          x1="110" y1="320" x2="110" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 2.3 }}
        />
        <motion.line 
          x1="110" y1="180" x2="250" y2="110" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 2.4 }}
        />
        
        {/* Connecting spokes */}
        <motion.line 
          x1="250" y1="250" x2="250" y2="110" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 2.5 }}
        />
        <motion.line 
          x1="250" y1="250" x2="390" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 2.6 }}
        />
        <motion.line 
          x1="250" y1="250" x2="390" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 2.7 }}
        />
        <motion.line 
          x1="250" y1="250" x2="250" y2="390" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 2.8 }}
        />
        <motion.line 
          x1="250" y1="250" x2="110" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 2.9 }}
        />
        <motion.line 
          x1="250" y1="250" x2="110" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 3.0 }}
        />
        
        {/* Inner connections */}
        <motion.line 
          x1="250" y1="250" x2="250" y2="180" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.1 }}
        />
        <motion.line 
          x1="250" y1="250" x2="320" y2="215" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.2 }}
        />
        <motion.line 
          x1="250" y1="250" x2="320" y2="285" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.3 }}
        />
        <motion.line 
          x1="250" y1="250" x2="250" y2="320" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.4 }}
        />
        <motion.line 
          x1="250" y1="250" x2="180" y2="285" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.5 }}
        />
        <motion.line 
          x1="250" y1="250" x2="180" y2="215" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 3.6 }}
        />
      </g>
      
      {/* Sacred geometry patterns */}
      <g stroke="rgba(255,255,255,0.15)" fill="none">
        <motion.circle 
          cx="250" 
          cy="250" 
          r="100" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3.7 }}
        />
        <motion.circle 
          cx="250" 
          cy="250" 
          r="150" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3.8 }}
        />
        <motion.path 
          d="M150,250 A100,100 0 0,1 350,250 A100,100 0 0,1 150,250" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3.9 }}
        />
        <motion.path 
          d="M250,150 A100,100 0 0,1 250,350 A100,100 0 0,1 250,150" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 4.0 }}
        />
      </g>
    </svg>
  );
};

export default MetatronsBackground;
