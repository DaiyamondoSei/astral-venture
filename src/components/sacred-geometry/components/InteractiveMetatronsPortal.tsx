
import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from 'next-themes';

interface InteractiveMetatronsPortalProps {
  energyPoints: number;
  consciousnessLevel?: number;
  interactionMode?: 'pulse' | 'ripple' | 'resonance';
  portalIntensity?: number;
  isActivated?: boolean;
  onPortalActivation?: () => void;
}

const InteractiveMetatronsPortal: React.FC<InteractiveMetatronsPortalProps> = ({
  energyPoints = 0,
  consciousnessLevel = 1,
  interactionMode = 'pulse',
  portalIntensity = 0.7,
  isActivated = false,
  onPortalActivation
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionPoint, setInteractionPoint] = useState({ x: 50, y: 50 });
  const [portalState, setPortalState] = useState<'dormant' | 'awakening' | 'activated'>('dormant');
  const mainControls = useAnimation();
  const { theme } = useTheme();
  
  // Calculate energy-based parameters
  const portalSize = useMemo(() => Math.min(40 + (energyPoints / 50), 70), [energyPoints]);
  const portalOpenness = useMemo(() => Math.min(0.3 + (energyPoints / 1000), 1), [energyPoints]);
  const portalComplexity = useMemo(() => Math.min(3 + Math.floor(energyPoints / 200), 12), [energyPoints]);
  const portalVibrancy = useMemo(() => Math.min(0.4 + (consciousnessLevel / 10), 1), [consciousnessLevel]);
  
  // Use different color schemes based on theme
  const colors = useMemo(() => {
    const baseColors = theme === 'dark' 
      ? ['rgba(138, 92, 246, alpha)', 'rgba(104, 211, 255, alpha)', 'rgba(255, 125, 220, alpha)'] 
      : ['rgba(165, 127, 244, alpha)', 'rgba(130, 220, 255, alpha)', 'rgba(255, 153, 230, alpha)'];
      
    return baseColors.map(color => color.replace('alpha', portalVibrancy.toFixed(2)));
  }, [theme, portalVibrancy]);

  // Handle user interaction
  const handleInteraction = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgBounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - svgBounds.left) / svgBounds.width) * 100;
    const y = ((e.clientY - svgBounds.top) / svgBounds.height) * 100;
    
    setInteractionPoint({ x, y });
    setIsInteracting(true);
    
    // Trigger portal state change if energy is sufficient
    if (energyPoints > 300 && portalState === 'dormant') {
      setPortalState('awakening');
      mainControls.start("activated");
      
      setTimeout(() => {
        setPortalState('activated');
        if (onPortalActivation) onPortalActivation();
      }, 3000);
    }
    
    // Create ripple effect
    mainControls.start("interact");
  };
  
  // Reset interaction state
  const handleInteractionEnd = () => {
    setTimeout(() => setIsInteracting(false), 500);
  };

  // Animate portal based on energy changes
  useEffect(() => {
    if (isActivated && portalState !== 'activated') {
      setPortalState('activated');
    }
    
    // Update animation controls based on energy
    mainControls.start({
      scale: portalOpenness,
      opacity: portalVibrancy,
      rotate: energyPoints > 500 ? 360 : 0,
      transition: { 
        duration: 2, 
        ease: "easeInOut",
        rotate: { 
          duration: 60,
          ease: "linear",
          repeat: Infinity
        }
      }
    });
  }, [energyPoints, consciousnessLevel, isActivated, portalState, mainControls, portalOpenness, portalVibrancy]);

  // Generate geometric elements based on energy level
  const { circles, lines, innerPatterns } = useMemo(() => {
    // Generate circles
    const generatedCircles = Array.from({ length: portalComplexity }).map((_, index) => {
      const radius = (portalSize - index * 4) * portalOpenness;
      const strokeWidth = 0.3 + (index * 0.1) * portalVibrancy;
      const strokeOpacity = (0.2 + (index / portalComplexity) * 0.8) * portalVibrancy;
      const color = colors[index % colors.length];
      
      return (
        <motion.circle
          key={`circle-${index}`}
          cx="50%"
          cy="50%"
          r={`${radius}%`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={mainControls}
          variants={{
            activated: { 
              opacity: strokeOpacity,
              scale: 1,
              strokeDashoffset: [0, 1000],
              transition: { 
                duration: 30 + (index * 5),
                repeat: Infinity,
                ease: "linear" 
              }
            },
            interact: {
              scale: isInteracting ? [1, 1.05, 1] : 1,
              opacity: isInteracting ? [strokeOpacity, strokeOpacity * 1.3, strokeOpacity] : strokeOpacity,
              transition: { duration: 1, ease: "easeOut" }
            }
          }}
          strokeDasharray={index % 2 === 0 ? "4 4" : "1 8"}
        />
      );
    });
    
    // Generate sacred geometry lines
    const lineCount = Math.max(6, Math.min(Math.floor(portalComplexity * 1.5), 24));
    const generatedLines = Array.from({ length: lineCount }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / lineCount;
      const lineOpacity = (0.3 + (index / lineCount) * 0.7) * portalVibrancy;
      const length = portalSize * portalOpenness;
      const x1 = 50;
      const y1 = 50;
      const x2 = x1 + length * Math.cos(angle);
      const y2 = y1 + length * Math.sin(angle);
      const color = colors[index % colors.length];
      
      return (
        <motion.line
          key={`line-${index}`}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
          stroke={color}
          strokeWidth={0.5 * portalVibrancy}
          strokeOpacity={lineOpacity}
          initial={{ opacity: 0 }}
          animate={mainControls}
          variants={{
            activated: { 
              opacity: lineOpacity,
              rotate: [0, 360],
              transition: { 
                opacity: { duration: 2 },
                rotate: { 
                  duration: 120 - (index * 2),
                  repeat: Infinity,
                  ease: "linear"
                }
              }
            },
            interact: {
              opacity: isInteracting ? [lineOpacity, lineOpacity * 1.5, lineOpacity] : lineOpacity,
              scale: isInteracting ? [1, 1.03, 1] : 1,
              transition: { duration: 0.8, ease: "easeOut" }
            }
          }}
        />
      );
    });
    
    // Generate inner sacred geometry patterns for higher energy levels
    let generatedInnerPatterns = null;
    
    if (energyPoints > 300) {
      // Sacred geometry flower of life pattern
      const patternRadius = portalSize * 0.4 * portalOpenness;
      const petalCount = Math.min(6 + Math.floor(energyPoints / 200), 12);
      
      generatedInnerPatterns = (
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={mainControls}
          variants={{
            activated: {
              opacity: portalVibrancy * 0.8,
              scale: 1,
              rotate: [0, -360],
              transition: { 
                opacity: { duration: 3 },
                scale: { duration: 2 },
                rotate: { 
                  duration: 180,
                  repeat: Infinity,
                  ease: "linear" 
                }
              }
            },
            interact: {
              scale: isInteracting ? [1, 1.1, 1] : 1,
              opacity: isInteracting ? [portalVibrancy * 0.8, portalVibrancy, portalVibrancy * 0.8] : portalVibrancy * 0.8,
              transition: { duration: 1.2, ease: "easeOut" }
            }
          }}
        >
          {/* Center circle */}
          <circle 
            cx="50%" 
            cy="50%" 
            r={`${patternRadius / 3}%`} 
            fill="none" 
            stroke={colors[0]} 
            strokeWidth={0.8 * portalVibrancy} 
          />
          
          {/* Flower petals */}
          {Array.from({ length: petalCount }).map((_, index) => {
            const angle = (Math.PI * 2 * index) / petalCount;
            const petalX = 50 + patternRadius * Math.cos(angle);
            const petalY = 50 + patternRadius * Math.sin(angle);
            
            return (
              <circle 
                key={`petal-${index}`} 
                cx={`${petalX}%`} 
                cy={`${petalY}%`} 
                r={`${patternRadius / 3}%`} 
                fill="none" 
                stroke={colors[index % colors.length]} 
                strokeWidth={0.6 * portalVibrancy} 
                strokeOpacity={0.7 * portalVibrancy}
              />
            );
          })}
          
          {/* Seed of life pattern for highest energy levels */}
          {energyPoints > 500 && (
            <g>
              <polygon
                points={`50,${50-patternRadius} ${50+patternRadius*0.866},${50-patternRadius*0.5} ${50+patternRadius*0.866},${50+patternRadius*0.5} 50,${50+patternRadius} ${50-patternRadius*0.866},${50+patternRadius*0.5} ${50-patternRadius*0.866},${50-patternRadius*0.5}`}
                fill="none"
                stroke={colors[1]}
                strokeWidth={0.5 * portalVibrancy}
                strokeOpacity={0.6 * portalVibrancy}
              />
              
              {energyPoints > 700 && (
                <motion.polygon
                  points={`50,${50-patternRadius*0.8} ${50+patternRadius*0.7},${50-patternRadius*0.4} ${50+patternRadius*0.7},${50+patternRadius*0.4} 50,${50+patternRadius*0.8} ${50-patternRadius*0.7},${50+patternRadius*0.4} ${50-patternRadius*0.7},${50-patternRadius*0.4}`}
                  fill="none"
                  stroke={colors[2]}
                  strokeWidth={0.5 * portalVibrancy}
                  strokeOpacity={0.7 * portalVibrancy}
                  animate={{
                    rotate: [0, 360],
                    transition: {
                      duration: 60,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
              )}
            </g>
          )}
        </motion.g>
      );
    }

    return { circles: generatedCircles, lines: generatedLines, innerPatterns: generatedInnerPatterns };
  }, [portalSize, portalOpenness, portalComplexity, portalVibrancy, colors, isInteracting, energyPoints, mainControls]);
  
  // Create ripple effect at interaction point
  const renderRipple = useMemo(() => {
    if (!isInteracting) return null;
    
    return (
      <motion.circle
        cx={`${interactionPoint.x}%`}
        cy={`${interactionPoint.y}%`}
        r="0"
        fill="none"
        stroke={colors[0].replace('alpha', '0.8')}
        strokeWidth={2 * portalVibrancy}
        initial={{ r: 0, opacity: 1 }}
        animate={{ 
          r: 30, 
          opacity: 0,
          transition: { duration: 1.5, ease: "easeOut" }
        }}
        onAnimationComplete={handleInteractionEnd}
      />
    );
  }, [isInteracting, interactionPoint, colors, portalVibrancy]);
  
  // Portal activation effect
  const portalActivationEffect = useMemo(() => {
    if (portalState !== 'awakening' && portalState !== 'activated') return null;
    
    const glowOpacity = portalState === 'activated' ? 0.7 : 0.4;
    const glowSize = portalState === 'activated' ? portalSize * 1.2 : portalSize * 1.1;
    
    return (
      <motion.circle
        cx="50%"
        cy="50%"
        r={`${glowSize}%`}
        fill={`url(#portalGlow)`}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: glowOpacity * portalVibrancy,
          scale: [1, 1.05, 1],
          transition: { 
            opacity: { duration: 2 },
            scale: { 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }
        }}
      />
    );
  }, [portalState, portalSize, portalVibrancy]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full cursor-pointer"
        preserveAspectRatio="xMidYMid meet"
        onClick={handleInteraction}
        style={{ pointerEvents: 'all' }}
      >
        <defs>
          <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={colors[0].replace('alpha', '0.7')} />
            <stop offset="70%" stopColor={colors[1].replace('alpha', '0.3')} />
            <stop offset="100%" stopColor={colors[2].replace('alpha', '0')} />
          </radialGradient>
        </defs>
      
        {/* Portal background glow effect */}
        {portalActivationEffect}
        
        {/* Metatron's Cube Elements */}
        {circles}
        {innerPatterns}
        {lines}
        
        {/* Interaction ripple effect */}
        {renderRipple}
        
        {/* Central energy point */}
        {energyPoints > 200 && (
          <motion.circle
            cx="50%"
            cy="50%"
            r={`${portalSize * 0.1}%`}
            fill={colors[0].replace('alpha', '0.8')}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [portalVibrancy * 0.7, portalVibrancy, portalVibrancy * 0.7],
              transition: { 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
          />
        )}
      </svg>
      
      {/* Portal state indicator (only visible during awakening) */}
      {portalState === 'awakening' && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-quantum-100 font-medium text-sm tracking-wide opacity-80">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Portal Awakening...
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMetatronsPortal;
