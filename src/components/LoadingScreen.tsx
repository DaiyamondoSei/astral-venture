
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
  minDisplayTime?: number; // Minimum time to display in ms
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoadComplete,
  minDisplayTime = 3000 // Give users time to enjoy the animation
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + (1 + Math.random() * 2), 100);
        return newProgress;
      });
    }, 100);
    
    // Ensure minimum display time and wait for 100% progress
    const checkCompletion = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      if (progress >= 100 && elapsedTime >= minDisplayTime) {
        clearInterval(interval);
        clearInterval(checkCompletion);
        
        // Fade out animation then call complete
        setTimeout(() => {
          setIsVisible(false);
          if (onLoadComplete) setTimeout(onLoadComplete, 500);
        }, 500);
      }
    }, 100);
    
    return () => {
      clearInterval(interval);
      clearInterval(checkCompletion);
    };
  }, [progress, minDisplayTime, onLoadComplete]);
  
  return (
    <motion.div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#221F26] via-[#2C2B33] to-[#191A23]",
        "overflow-hidden"
      )}
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Spinning 3D Metatron's Cube */}
      <motion.div 
        className="relative w-64 h-64 mb-8"
        animate={{ 
          rotateY: [0, 360],
          rotateX: [0, 45, 0],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear",
          rotateX: {
            repeatType: "mirror",
            duration: 10
          }
        }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-white">
          {/* Outer circle */}
          <circle cx="200" cy="200" r="180" fill="none" strokeWidth="0.5" className="opacity-70" />
          
          {/* Inner circles */}
          <circle cx="200" cy="200" r="140" fill="none" strokeWidth="0.5" className="opacity-70" />
          <circle cx="200" cy="200" r="100" fill="none" strokeWidth="0.5" className="opacity-70" />
          
          {/* Hexagon */}
          <polygon 
            points="200,20 340,110 340,290 200,380 60,290 60,110" 
            fill="none" 
            strokeWidth="1"
            className="opacity-80" 
          />
          
          {/* Connection lines */}
          <line x1="200" y1="20" x2="200" y2="380" strokeWidth="0.5" className="opacity-70" />
          <line x1="60" y1="110" x2="340" y2="290" strokeWidth="0.5" className="opacity-70" />
          <line x1="60" y1="290" x2="340" y2="110" strokeWidth="0.5" className="opacity-70" />
          
          {/* Inner hexagon */}
          <polygon 
            points="200,80 280,130 280,270 200,320 120,270 120,130" 
            fill="none" 
            strokeWidth="0.8"
            className="opacity-90" 
          />
          
          {/* Metatron's Cube sacred geometry - additional lines */}
          <line x1="200" y1="80" x2="120" y2="270" strokeWidth="0.5" className="opacity-70" />
          <line x1="200" y1="80" x2="280" y2="270" strokeWidth="0.5" className="opacity-70" />
          <line x1="120" y1="130" x2="280" y2="130" strokeWidth="0.5" className="opacity-70" />
          <line x1="120" y1="270" x2="280" y2="270" strokeWidth="0.5" className="opacity-70" />
          <line x1="200" y1="320" x2="120" y2="130" strokeWidth="0.5" className="opacity-70" />
          <line x1="200" y1="320" x2="280" y2="130" strokeWidth="0.5" className="opacity-70" />
          
          {/* Center point */}
          <circle cx="200" cy="200" r="4" fill="white" className="opacity-90" />
          
          {/* Vertex points with subtle glow */}
          {[
            [200, 20], [340, 110], [340, 290], [200, 380], [60, 290], [60, 110], // Outer vertices
            [200, 80], [280, 130], [280, 270], [200, 320], [120, 270], [120, 130] // Inner vertices
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6" fill="rgba(255,255,255,0.2)" className="animate-pulse" />
              <circle cx={cx} cy={cy} r="2" fill="white" />
            </g>
          ))}
        </svg>
      </motion.div>
      
      {/* Loading text */}
      <motion.div 
        className="text-center text-white font-light tracking-widest"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-2xl mb-2 font-display">QUANEX</h2>
        <p className="text-sm text-white/70 mb-4">Awakening Consciousness</p>
      </motion.div>
      
      {/* Progress bar */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-6">
        <motion.div 
          className="h-full bg-gradient-to-r from-quantum-300 to-quantum-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>
      
      {/* Progress percentage */}
      <motion.p 
        className="text-xs text-white/60 mt-2 font-mono"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {Math.floor(progress)}% • {progress >= 100 ? 'Quantum Field Aligned' : 'Aligning Quantum Field'}
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;
